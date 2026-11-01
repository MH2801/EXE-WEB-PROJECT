import Phaser from 'phaser';
import type { WordId } from '../core/types';
import { TUNING } from '../content/tuning';
import { wordDef } from '../content/words';
import { COLORS, CSS, FONT_DISPLAY } from './theme';
import { fitImage, inviteLoop, reducedMotion } from './ui';
import { playSfx } from './sfx';

const L = TUNING.trip.layout;
const C = L.cards;

/** Word cards: thick, with a picture and the word. A colour card shows a swatch, never a fruit. */
export class Cards {
  private cards = new Map<WordId, Phaser.GameObjects.Container>();
  private tapped: WordId | null = null;
  private stopInvite: (() => void) | null = null;

  constructor(private scene: Phaser.Scene, private onTap: (w: WordId) => void) {}

  /** Resolves when the tween ends; the timer stops a stalled tween from holding the caller. */
  private run(cfg: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    return new Promise<void>((resolve) => {
      this.scene.tweens.add({ ...cfg, onComplete: () => resolve() });
      this.scene.time.delayedCall((cfg.duration as number) + ((cfg.delay as number) ?? 0) + TUNING.fallbackPadMs, resolve);
    });
  }

  private make(word: WordId, x: number): Phaser.GameObjects.Container {
    const { w, h, thick, r, line } = C;
    const fh = h - thick;
    const face = this.scene.add.container(0, 0);
    face.add(this.scene.add.graphics().fillStyle(COLORS.paper, 1).fillRoundedRect(-w / 2, -h / 2, w, fh, r).lineStyle(line, COLORS.indigo, 1).strokeRoundedRect(-w / 2, -h / 2, w, fh, r));
    const picY = -h / 2 + fh * C.picY;
    if (wordDef(word).kind === 'color') {
      const s = C.swatch;
      face.add(this.scene.add.graphics().fillStyle(L.swatch[word as 'red' | 'yellow' | 'green'], 1).fillRoundedRect(-s / 2, picY - s / 2, s, s, C.swatchR).lineStyle(line, COLORS.indigo, 1).strokeRoundedRect(-s / 2, picY - s / 2, s, s, C.swatchR));
    } else face.add(fitImage(this.scene.add.image(0, picY, `v2_item_${word}`), C.pic));
    face.add(this.scene.add.text(0, -h / 2 + fh * C.wordY, word, { fontFamily: FONT_DISPLAY, fontStyle: '800', fontSize: `${C.font}px`, color: CSS.ink }).setOrigin(0.5));
    const base = this.scene.add.graphics().fillStyle(COLORS.indigo, 1).fillRoundedRect(-w / 2, -h / 2 + thick, w, fh, r);
    const c = this.scene.add.container(x, C.y, [base, face]).setSize(w, Math.max(h, TUNING.minHitPx)).setDepth(L.depth).setInteractive({ useHandCursor: true });
    let last = -Infinity;
    const release = () => {
      face.y = 0;
      c.setScale(1);
    };
    c.on('pointerdown', () => {
      this.endInvite();
      face.y = thick; // sinks at once; the static change stays under reduced motion
      if (!reducedMotion()) c.setScale(TUNING.pressScale);
      const now = this.scene.time.now;
      if (now - last < TUNING.tapDebounceMs) return;
      last = now;
      playSfx('pop');
      this.tapped = word;
      this.onTap(word);
    });
    c.on('pointerup', release).on('pointerout', release);
    return c;
  }

  deal(words: WordId[]): Promise<void> {
    this.clear();
    const total = words.length * C.w + (words.length - 1) * C.gap;
    const x0 = (TUNING.gameW - total) / 2 + C.w / 2;
    const moves = words.map((w, i) => {
      const c = this.make(w, x0 + i * (C.w + C.gap));
      this.cards.set(w, c);
      if (reducedMotion()) return Promise.resolve();
      c.y += C.enterDy;
      return this.run({ targets: c, y: C.y, duration: C.enterMs, delay: i * C.staggerMs, ease: 'Back.easeOut' });
    });
    return Promise.all(moves).then(() => undefined);
  }

  /** The used card hops up and fades away. Others stay where they are. */
  drop(word: WordId): Promise<void> {
    const c = this.cards.get(word);
    if (!c) return Promise.resolve();
    this.cards.delete(word);
    c.disableInteractive();
    if (reducedMotion()) {
      c.destroy();
      return Promise.resolve();
    }
    return this.run({ targets: c, y: c.y - C.upPx, scale: C.upScale, duration: C.upMs, ease: 'Quad.easeOut' })
      .then(() => this.run({ targets: c, alpha: 0, scale: C.fadeScale, duration: C.fadeMs }))
      .then(() => c.destroy());
  }

  /** The right card flies to `to` and the others slide away. A second call finds nothing left to do. */
  spend(to: { x: number; y: number } | null): Promise<void> {
    const word = this.tapped;
    this.tapped = null;
    const all = [...this.cards];
    this.cards.clear();
    return Promise.all(
      all.map(([w, c]) => {
        c.disableInteractive();
        if (reducedMotion()) return Promise.resolve(c.destroy());
        const fly = w === word ? to : null;
        const go = fly ? { x: fly.x, y: fly.y, scale: C.flyEnd, duration: C.flyMs, ease: 'Quad.easeIn' } : { y: c.y + C.enterDy, duration: C.flyMs };
        return this.run({ targets: c, ...go }).then(() => c.destroy());
      }),
    ).then(() => undefined);
  }

  invite(): void {
    this.endInvite();
    this.stopInvite = inviteLoop(this.scene, [...this.cards.values()].map((c) => ({ objs: [c], x: c.x, top: C.y - C.h / 2 })));
  }

  endInvite(): void {
    this.stopInvite?.();
    this.stopInvite = null;
  }

  clear(): void {
    this.endInvite();
    this.cards.forEach((c) => c.destroy());
    this.cards.clear();
  }

  center(word: WordId): { x: number; y: number } | null {
    const c = this.cards.get(word);
    return c ? { x: c.x, y: c.y } : null;
  }
}
