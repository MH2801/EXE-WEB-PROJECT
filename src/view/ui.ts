import Phaser from 'phaser';
import { duckWhile } from './music';
import { createSpeaker } from './speech';
import { RECORDED } from '../content/audio-manifest';
import { TUNING } from '../content/tuning';
import { WORDS } from '../content/words';
import type { WordId } from '../core/types';
import { playSfx } from './sfx';
import { COLORS, CSS, FONT_DISPLAY } from './theme';

export const reducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function makeSpeaker(scene: Phaser.Scene): ReturnType<typeof createSpeaker> {
  const speaker = createSpeaker({
    synth: typeof speechSynthesis === 'undefined' ? null : speechSynthesis,
    makeUtterance: (text) => new SpeechSynthesisUtterance(text),
    // Only reached for ids in RECORDED (none today); the clip key is the line id.
    playFile: (id) => {
      if (!RECORDED.includes(id)) throw new Error(`no recording for ${id}`);
      const s = scene.sound.add(id);
      const done = new Promise<void>((res, rej) => {
        s.once('complete', () => res());
        s.once('loaderror', () => rej(new Error(id)));
      });
      s.play();
      return { done, stop: () => s.destroy(), pause: () => s.pause(), resume: () => s.resume() };
    },
    // delayedCall runs on the scene clock, so it stops with a hidden tab.
    setTimer: (ms, fn) => {
      const ev = scene.time.delayedCall(ms, fn);
      return () => ev.remove(false);
    },
  });
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => speaker.skip());
  return { ...speaker, say: (id) => duckWhile(speaker.say(id)) };
}

export function makeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  opts: { icon?: string; label: string; labelColor?: string; w: number; h: number; onTap: () => void },
): Phaser.GameObjects.Container {
  const w = Math.max(opts.w, TUNING.minHitPx);
  const h = Math.max(opts.h, TUNING.minHitPx);
  // Empty label and no icon = invisible hit area over painted art; the press flash still shows.
  const painted = opts.label !== '' || !!opts.icon;
  const body = scene.add.graphics();
  if (painted) body.fillStyle(0x3aa8ff, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 28);
  const flash = scene.add.graphics().fillStyle(0xffffff, 0.4).fillRoundedRect(-w / 2, -h / 2, w, h, 28).setAlpha(0);
  const kids: Phaser.GameObjects.GameObject[] = [body, flash];
  if (opts.icon) kids.push(scene.add.image(0, 0, opts.icon));
  if (opts.label) kids.push(scene.add.text(0, 0, opts.label, { fontFamily: 'sans-serif', fontSize: '40px', color: opts.labelColor ?? '#16324f', fontStyle: 'bold' }).setOrigin(0.5));
  const c = scene.add.container(x, y, kids).setSize(w, h).setInteractive({ useHandCursor: true });
  let last = -Infinity;
  const release = () => {
    flash.setAlpha(0);
    c.setScale(1);
  };
  c.on('pointerdown', () => {
    flash.setAlpha(1);
    if (!reducedMotion()) c.setScale(TUNING.pressScale);
    const now = scene.time.now;
    if (now - last < TUNING.tapDebounceMs) return;
    last = now;
    playSfx('pop'); // sound with the flash, within 100 ms (spec 9)
    opts.onTap();
  });
  c.on('pointerup', release).on('pointerout', release);
  return c;
}

/** Scale an image so its longer side is `px`. */
export const fitImage = (img: Phaser.GameObjects.Image, px: number): Phaser.GameObjects.Image => img.setScale(px / Math.max(img.width, img.height));

/** Thick clay button: a dark base under a raised face. Acts on press; the face sinks into the base. */
export function makeClayButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  opts: { label?: string; icon?: string; w: number; h: number; variant: 'primary' | 'plain'; ariaName: string; onTap: () => void },
): Phaser.GameObjects.Container {
  const w = Math.max(opts.w, TUNING.minHitPx);
  const h = Math.max(opts.h, TUNING.minHitPx);
  const lip = Math.round(h * 0.1); // visible thickness of the base
  const fh = h - lip;
  const base = scene.add.graphics().fillStyle(COLORS.indigo, 1).fillRoundedRect(-w / 2, -h / 2 + lip, w, fh, 32);
  const face = scene.add.container(0, 0, [
    scene.add.graphics().fillStyle(opts.variant === 'primary' ? COLORS.sun : COLORS.paper, 1).fillRoundedRect(-w / 2, -h / 2, w, fh, 32).lineStyle(6, COLORS.indigo, 1).strokeRoundedRect(-w / 2, -h / 2, w, fh, 32),
  ]);
  const midY = -lip / 2;
  if (opts.icon) face.add(fitImage(scene.add.image(opts.label ? -w * 0.28 : 0, midY, opts.icon), fh * 0.6));
  if (opts.label) face.add(scene.add.text(opts.icon ? w * 0.12 : 0, midY, opts.label, { fontFamily: FONT_DISPLAY, fontStyle: '800', fontSize: `${Math.round(h * 0.4)}px`, color: CSS.ink }).setOrigin(0.5));
  const c = scene.add.container(x, y, [base, face]).setSize(w, h).setInteractive({ useHandCursor: true }).setName(opts.ariaName);
  let last = -Infinity;
  const release = () => {
    face.y = 0;
    c.setScale(1);
  };
  c.on('pointerdown', () => {
    face.y = lip; // the sink stays under reduced motion
    if (!reducedMotion()) c.setScale(TUNING.pressScale);
    const now = scene.time.now;
    if (now - last < TUNING.tapDebounceMs) return;
    last = now;
    playSfx('pop');
    opts.onTap();
  });
  c.on('pointerup', release).on('pointerout', release);
  return c;
}

// Portrait: a drawn phone turning sideways, no text. Hidden when landscape.
export function addRotateOverlay(scene: Phaser.Scene): void {
  const { gameW, gameH } = TUNING;
  const cover = scene.add.rectangle(gameW / 2, gameH / 2, gameW, gameH, 0x16324f).setDepth(999).setInteractive(); // eats taps
  const phone = scene.add.graphics().lineStyle(10, 0xffffff, 1).strokeRoundedRect(-60, -100, 120, 200, 16);
  const arrow = scene.add.graphics().lineStyle(10, 0xffffff, 1).beginPath().arc(0, 0, 190, -0.9, 0.5, false).strokePath();
  const icon = scene.add.container(gameW / 2, gameH / 2, [phone, arrow]).setDepth(1000);
  const sync = () => {
    const portrait = window.innerHeight > window.innerWidth; // FIT keeps game size 16:9, so scale.isPortrait never flips
    icon.setVisible(portrait);
    cover.setVisible(portrait);
    cover.input!.enabled = portrait;
  };
  if (!reducedMotion()) scene.tweens.add({ targets: phone, angle: 90, duration: 900, yoyo: true, repeat: -1, hold: 400 });
  scene.scale.on(Phaser.Scale.Events.ORIENTATION_CHANGE, sync);
  scene.scale.on(Phaser.Scale.Events.RESIZE, sync);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.scale.off(Phaser.Scale.Events.ORIENTATION_CHANGE, sync);
    scene.scale.off(Phaser.Scale.Events.RESIZE, sync);
  });
  sync();
}

/** Icons drawn once into textures (no art file exists for them). Safe to call again. */
export function ensureIcons(scene: Phaser.Scene): void {
  const s = TUNING.home.iconPx;
  const c = s / 2;
  const make = (key: string, draw: (g: Phaser.GameObjects.Graphics) => void) => {
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics().lineStyle(5, COLORS.indigo, 1);
    draw(g);
    g.generateTexture(key, s, s);
    g.destroy();
  };
  make('home_gear', (g) => {
    const pts = Array.from({ length: 16 }, (_, i) => {
      const r = i % 2 ? c * 0.78 : c - 4;
      return new Phaser.Math.Vector2(c + Math.cos((i * Math.PI) / 8) * r, c + Math.sin((i * Math.PI) / 8) * r);
    });
    g.fillStyle(COLORS.sun, 1).fillPoints(pts, true).strokePoints(pts, true).fillStyle(COLORS.paper, 1).fillCircle(c, c, c * 0.35);
  });
  make('home_book', (g) => {
    g.fillStyle(COLORS.skyLight, 1).fillRoundedRect(c * 0.4, c * 0.2, c * 1.2, c * 1.6, 8).strokeRoundedRect(c * 0.4, c * 0.2, c * 1.2, c * 1.6, 8);
    g.fillStyle(COLORS.indigo, 1).fillRect(c * 0.4, c * 0.2, c * 0.18, c * 1.6);
    for (const dy of [0.6, 0.95, 1.3]) g.lineBetween(c * 0.8, c * dy, c * 1.4, c * dy);
  });
  make('home_play', (g) => g.fillStyle(COLORS.indigo, 1).fillTriangle(c * 0.5, c * 0.25, c * 0.5, c * 1.75, c * 1.65, c));
  make('home_house', (g) => {
    g.fillStyle(COLORS.indigo, 1).fillTriangle(c * 0.15, c * 0.95, c, c * 0.15, c * 1.85, c * 0.95);
    g.fillStyle(COLORS.paper, 1).fillRect(c * 0.4, c * 0.95, c * 1.2, c * 0.85).strokeRect(c * 0.4, c * 0.95, c * 1.2, c * 0.85);
    g.fillStyle(COLORS.sun, 1).fillRect(c * 0.85, c * 1.25, c * 0.3, c * 0.55);
  });
}

export type LeafMode = 'known' | 'strong' | 'unknown';

/** One Word Book leaf, centred on (x, y). Known: picture and word. Strong: gold rim and a star. Unknown: a question mark. */
export function drawLeaf(scene: Phaser.Scene, word: WordId, x: number, y: number, mode: LeafMode): Phaser.GameObjects.Container {
  const { w, h, pic, swatch, font, q, border, goldBorder, star } = TUNING.wordBook.leaf;
  const strong = mode === 'strong';
  const g = scene.add.graphics().fillStyle(mode === 'unknown' ? 0xe3f1fb : COLORS.paper, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 30);
  if (strong) g.lineStyle(goldBorder + 8, COLORS.indigo, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 30).lineStyle(goldBorder, COLORS.sun, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 30);
  else g.lineStyle(border, COLORS.indigo, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 30);
  const c = scene.add.container(x, y, [g]);
  if (mode === 'unknown') return c.add(scene.add.text(0, 0, '?', { fontFamily: FONT_DISPLAY, fontStyle: '800', fontSize: `${q}px`, color: CSS.indigo }).setOrigin(0.5).setAlpha(0.55));
  const picY = -h * 0.1;
  if (WORDS.find((d) => d.id === word)?.kind === 'color') {
    const rect = scene.add.graphics().fillStyle(TUNING.trip.layout.swatch[word as 'red' | 'yellow' | 'green'], 1);
    c.add(rect.fillRoundedRect(-swatch / 2, picY - swatch / 2, swatch, swatch, 24).lineStyle(6, COLORS.indigo, 1).strokeRoundedRect(-swatch / 2, picY - swatch / 2, swatch, swatch, 24));
  } else c.add(fitImage(scene.add.image(0, picY, `v2_item_${word}`), pic));
  c.add(scene.add.text(0, h * 0.34, word, { fontFamily: FONT_DISPLAY, fontStyle: '800', fontSize: `${font}px`, color: CSS.indigo }).setOrigin(0.5));
  if (strong) {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 ? star * 0.45 : star;
      return new Phaser.Math.Vector2(w / 2 - star - 10 + Math.sin((i * Math.PI) / 5) * r, -h / 2 + star + 10 - Math.cos((i * Math.PI) / 5) * r);
    });
    c.add(scene.add.graphics().fillStyle(COLORS.sun, 1).lineStyle(4, COLORS.indigo, 1).fillPoints(pts, true).strokePoints(pts, true));
  }
  return c;
}

/** A plain drawn icon, ink only: no colour says yes or no. Centred on (0, dy). */
export function drawGlyph(scene: Phaser.Scene, kind: 'tick' | 'cross' | 'ear', s: number, dy = 0): Phaser.GameObjects.Graphics {
  const G = TUNING.trip.view.look.glyph;
  const g = scene.add.graphics().lineStyle(s * G.line, COLORS.ink, 1).fillStyle(COLORS.ink, 1).setY(dy);
  const path = (pts: readonly (readonly [number, number])[]) => {
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x * s, y * s) : g.moveTo(x * s, y * s)));
  };
  if (kind === 'tick') {
    path(G.tick);
    g.strokePath();
  } else if (kind === 'cross') {
    path([[-G.cross, -G.cross], [G.cross, G.cross]]);
    g.strokePath();
    path([[G.cross, -G.cross], [-G.cross, G.cross]]);
    g.strokePath();
  } else {
    path(G.ear);
    g.closePath().fillPath();
    for (const r of G.earArcs) g.beginPath().arc(G.earX * s, 0, r * s, -G.earAngle, G.earAngle).strokePath();
  }
  return g;
}

export type InviteItem = { objs: { y: number }[]; x: number; top: number };

/**
 * R24: what can be tapped hops slowly, by motion alone. No sound and no clock: it only ever stops. Reduced motion: a still star above it.
 * Returns the stop, which puts everything back where it stood.
 */
export function inviteLoop(scene: Phaser.Scene, items: InviteItem[]): () => void {
  const I = TUNING.trip.view.invite;
  if (reducedMotion()) {
    // The Indigo edge keeps a star seen on a Sun button (Home's Go).
    const stars = items.map(({ x, top }) => scene.add.star(x, top - I.starDy, TUNING.burst.points, I.starPx / 2, I.starPx, COLORS.sun).setStrokeStyle(I.starLine, COLORS.indigo).setDepth(TUNING.trip.layout.depth));
    return () => stars.forEach((s) => s.destroy());
  }
  const held = items.flatMap((it, i) =>
    it.objs.map((o) => ({ o, y: o.y, tw: scene.tweens.add({ targets: o, y: o.y - I.hopPx, duration: I.ms, ease: 'Sine.InOut', yoyo: true, repeat: -1, repeatDelay: I.restMs, delay: i * I.staggerMs }) })),
  );
  return () => {
    for (const { o, y, tw } of held) {
      tw.remove();
      o.y = y;
    }
  };
}
