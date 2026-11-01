import Phaser from 'phaser';
import { createSpeaker } from './speech';
import { RECORDED } from '../content/audio-manifest';
import { TUNING } from '../content/tuning';
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
  return speaker;
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
  if (opts.icon) face.add(fitImage(scene.add.image(opts.label ? -w * 0.22 : 0, midY, opts.icon), fh * 0.6));
  if (opts.label) face.add(scene.add.text(opts.icon ? w * 0.08 : 0, midY, opts.label, { fontFamily: FONT_DISPLAY, fontStyle: '800', fontSize: `${Math.round(h * 0.4)}px`, color: CSS.ink }).setOrigin(0.5));
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
