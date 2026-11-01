import Phaser from 'phaser';
import type { WrongFruit } from '../core/types';
import { TUNING } from '../content/tuning';
import type { Mimi } from './actors';
import { playSfx } from './sfx';
import { reducedMotion } from './ui';

/** Stars flying out of (x, y) and fading. Fire and forget: each star destroys itself. */
export function burst(scene: Phaser.Scene, x: number, y: number, n: number, color: number, inner: number, outer: number, rx: number, ry: number, ms: number): void {
  for (let i = 0; i < n; i++) {
    const star = scene.add.star(x, y, TUNING.burst.points, inner, outer, color).setDepth(TUNING.burst.depth);
    const a = (i / n) * Math.PI * 2;
    scene.tweens.add({ targets: star, x: x + Math.cos(a) * rx, y: y + Math.sin(a) * ry, alpha: 0, duration: ms, onComplete: () => star.destroy() });
  }
}

const DEAD = new Error('joke over');

type Ctx = {
  scene: Phaser.Scene;
  mimi: Mimi;
  home: { x: number; y: number };
  /** Resolves when the tween ends; rejects instead once the joke is over, so a late step never runs. */
  tw: (cfg: Phaser.Types.Tweens.TweenBuilderConfig) => Promise<void>;
  wait: (ms: number) => Promise<void>;
  walk: (x: number, speed: number) => Promise<void>;
  add: <T extends Phaser.GameObjects.Image>(o: T) => T;
};

const heldPos = (m: Mimi) => ({
  x: m.go.x + (m.held?.x ?? 0) * m.go.scaleX,
  y: m.go.y + (m.held?.y ?? -m.body.height / 2) * m.go.scaleY,
});

// Spec 9: surprised, then laughing. Each scene ends on the happy pose; the core then says mimi.oops.
const SCENES: Record<WrongFruit, (c: Ctx) => Promise<void>> = {
  lemon: async ({ scene, mimi, home, tw, wait }) => {
    const l = TUNING.jokes.lemon;
    playSfx('pop'); // the bite
    await tw({ targets: mimi.body, scaleY: l.biteSquash, duration: l.biteMs / 2, yoyo: true });
    mimi.body.setTint(l.tint); // sour!
    playSfx('boing');
    burst(scene, home.x, home.y - TUNING.headDy, l.stars, l.starColor, l.starInner, l.starOuter, l.starRx, l.starRy, l.starMs);
    await tw({ targets: mimi.go, x: { from: home.x - l.shakePx, to: home.x + l.shakePx }, duration: l.shakeMs, yoyo: true, repeat: l.shakes });
    mimi.body.clearTint();
    mimi.go.x = home.x;
    mimi.pose('happy');
    await wait(l.holdMs);
  },
  banana: async ({ mimi, home, tw, wait }) => {
    const b = TUNING.jokes.banana;
    const h = mimi.body.height;
    mimi.body.setOrigin(0.5, 0.5).setY(-h / 2); // spin around her middle, not her feet
    await tw({ targets: mimi.body, angle: b.slipDeg, duration: b.slipMs, ease: 'Quad.In' });
    playSfx('boing');
    await Promise.all([
      tw({ targets: mimi.body, angle: 360, duration: b.spinMs, ease: 'Sine.InOut' }),
      tw({ targets: mimi.go, y: home.y - b.hopPx, duration: b.spinMs / 2, yoyo: true, ease: 'Quad.Out' }),
    ]);
    mimi.body.setAngle(0);
    playSfx('pop');
    await tw({ targets: mimi.body, scaleY: b.sitSquash, duration: b.sitMs / 2, yoyo: true });
    mimi.pose('happy');
    await wait(b.holdMs);
  },
  grape: async ({ scene, mimi, home, tw, add }) => {
    const g = TUNING.jokes.grape;
    const from = heldPos(mimi);
    mimi.held?.setVisible(false);
    const grapes: Phaser.GameObjects.Image[] = [];
    for (let i = 0; i < g.count; i++) {
      const img = add(scene.add.image(from.x, from.y, 'fruit_grape').setScale(g.scale).setDepth(TUNING.burst.itemDepth));
      grapes.push(img);
      const delay = i * g.staggerMs;
      scene.tweens.add({ targets: img, x: home.x + (i / (g.count - 1) - 0.5) * g.spreadX, duration: g.fallMs, delay });
      scene.tweens.add({ targets: img, y: home.y + g.floorDy, duration: g.fallMs, delay, ease: 'Bounce.Out' });
    }
    playSfx('boing');
    await tw({ targets: mimi.go, y: home.y - g.hopPx, duration: g.hopMs, yoyo: true, repeat: g.hops - 1, onRepeat: () => playSfx('pop') });
    mimi.pose('happy');
    await tw({ targets: grapes, alpha: 0, duration: g.fadeMs, delay: g.restMs });
  },
  orange: async ({ scene, mimi, home, tw, wait, walk, add }) => {
    const o = TUNING.jokes.orange;
    const from = heldPos(mimi);
    mimi.held?.setVisible(false);
    const ball = add(scene.add.image(from.x, from.y, 'fruit_orange').setScale(o.scale).setDepth(TUNING.burst.itemDepth));
    const floor = home.y - ball.displayHeight / 2;
    await tw({ targets: ball, y: floor, duration: o.dropMs, ease: 'Bounce.Out' });
    playSfx('pop');
    const far = home.x + o.rollPx;
    await Promise.all([
      tw({ targets: ball, x: far, angle: 360 * o.turns, duration: o.rollMs, ease: 'Quad.Out' }),
      walk(home.x + o.rollPx * o.chase, o.chaseSpeed),
    ]);
    playSfx('boing'); // it rolls back
    await Promise.all([
      tw({ targets: ball, x: from.x, angle: 0, duration: o.rollMs, ease: 'Quad.InOut' }),
      walk(home.x, o.chaseSpeed),
    ]);
    mimi.pose('happy');
    await wait(o.holdMs);
  },
};

/** One wrong-fruit joke, never longer than TUNING.jokes.maxMs. Always leaves Mimi in place, upright and happy. */
export function playJoke(scene: Phaser.Scene, mimi: Mimi, fruit: WrongFruit): Promise<void> {
  const j = TUNING.jokes;
  const home = { x: mimi.go.x, y: mimi.go.y };
  const made: Phaser.GameObjects.Image[] = [];
  let alive = true;
  const guard = (res: () => void, rej: (e: Error) => void) => () => (alive ? res() : rej(DEAD));
  const ctx: Ctx = {
    scene,
    mimi,
    home,
    tw: (cfg) => new Promise((res, rej) => void scene.tweens.add({ ...cfg, onComplete: guard(res, rej), onStop: guard(res, rej) })),
    wait: (ms) => new Promise((res, rej) => void scene.time.delayedCall(ms, guard(res, rej))),
    walk: (x, speed) => mimi.walkTo(x, home.y, speed).then(() => { if (!alive) throw DEAD; }),
    add: (o) => (made.push(o), o),
  };
  mimi.pose('surprised');
  const still = reducedMotion(); // reduced motion: still poses and the sound only
  const scenePlay = still ? ctx.wait(j.stillMs) : SCENES[fruit](ctx);
  return new Promise<void>((resolve) => {
    const ev = scene.time.delayedCall(j.maxMs, () => end());
    function end(): void {
      if (!alive) return;
      alive = false;
      ev.remove(false);
      scene.tweens.killTweensOf([mimi.go, mimi.body, ...made]);
      for (const o of made) o.destroy();
      mimi.go.setPosition(home.x, home.y).setAngle(0);
      mimi.body.setOrigin(0.5, 1).setPosition(0, 0).setAngle(0).setScale(1).clearTint();
      mimi.held?.setVisible(true);
      mimi.pose('happy'); // never a sad end pose (spec 9)
      playSfx('sparkle'); // every joke closes happy, so no sound means "wrong" (spec 9)
      resolve();
    }
    scenePlay.then(end, end);
  });
}
