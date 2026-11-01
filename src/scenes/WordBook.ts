import Phaser from 'phaser';
import { wordLine } from '../content/lines';
import { TUNING } from '../content/tuning';
import { WORDS } from '../content/words';
import { knownWords } from '../core/knowledge';
import { browserStore } from '../core/save';
import { loadTripSave } from '../core/tripSave';
import type { WordId } from '../core/types';
import { Mimi } from '../view/actors';
import { Dialogue } from '../view/dialogue';
import { playSfx } from '../view/sfx';
import { COLORS, CSS, FONT_DISPLAY } from '../view/theme';
import { addRotateOverlay, fitImage, makeClayButton, makeSpeaker, reducedMotion } from '../view/ui';

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

export class WordBook extends Phaser.Scene {
  constructor() {
    super('WordBook');
  }

  create(): void {
    const B = TUNING.wordBook;
    const { w, h, gapX } = B.leaf;
    const save = loadTripSave(browserStore());
    const known = new Set(knownWords(save.brain));
    const speaker = makeSpeaker(this);
    const dialogue = new Dialogue(this);
    ensureIcons(this);
    this.cameras.main.setBackgroundColor(CSS.sky);
    const x0 = (TUNING.gameW - (4 * w + 3 * gapX)) / 2 + w / 2;
    WORDS.forEach((d, i) => {
      const mode: LeafMode = save.brain[d.id].state === 'strong' ? 'strong' : known.has(d.id) ? 'known' : 'unknown';
      const leaf = drawLeaf(this, d.id, x0 + (i % 4) * (w + gapX), B.leaf.rowY[Math.floor(i / 4)]!, mode).setSize(w, h).setInteractive({ useHandCursor: true });
      leaf.on('pointerdown', () => {
        playSfx('pop');
        if (!reducedMotion()) this.tweens.add({ targets: leaf, scale: TUNING.pressScale, duration: 80, yoyo: true });
        if (mode !== 'unknown') void speaker.say(wordLine('book', d.id)); // a leaf with "?" stays quiet
      });
    });
    makeClayButton(this, B.back.x, B.back.y, {
      icon: 'home_house', w: B.back.w, h: B.back.h, variant: 'plain', ariaName: 'Home',
      onTap: () => {
        speaker.skip();
        this.scene.start('Home');
      },
    });
    const mimi = new Mimi(this, B.mimi.x, B.mimi.y, 'v2_mimi');
    mimi.go.setScale(B.mimi.scale);
    mimi.pose('happy');
    dialogue.show('mimi.next', save.viSubtitles);
    void speaker.say('mimi.next').then(() => this.sys.isActive() && dialogue.hide());
    addRotateOverlay(this);
  }
}
