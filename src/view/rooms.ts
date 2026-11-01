import Phaser from 'phaser';
import { TUNING } from '../content/tuning';
import { wordDef, type ClueId } from '../content/words';
import type { TripEvent } from '../core/trip';
import type { Room, TeachRoom } from '../core/tripgen';
import type { FruitId, WordId } from '../core/types';
import { playSfx } from './sfx';
import { COLORS, CSS, FONT_DISPLAY } from './theme';
import { fitImage, makeClayButton, reducedMotion } from './ui';

const V = TUNING.trip.view;
const SWATCH = TUNING.trip.layout.swatch;
type Spot = { x: number; y: number };
type Shown = Room | { kind: 'teach'; teach: TeachRoom } | { kind: 'chest'; big: boolean };
type Obj = Phaser.GameObjects.GameObject;
type Box = Phaser.GameObjects.Container;
type Stall = { box: Box; zone: Phaser.GameObjects.Zone; marked: boolean; x: number; y: number };

/** A plain drawn icon on a clay button's raised face (its second child). Ink only: no colour says yes or no. */
function glyph(btn: Box, kind: 'tick' | 'cross' | 'ear', s: number, dy: number): void {
  const g = btn.scene.add.graphics().lineStyle(s * 0.14, COLORS.ink, 1).fillStyle(COLORS.ink, 1).setY(dy);
  if (kind === 'tick') g.beginPath().moveTo(-0.34 * s, 0).lineTo(-0.1 * s, 0.24 * s).lineTo(0.36 * s, -0.26 * s).strokePath();
  else if (kind === 'cross') g.beginPath().moveTo(-0.28 * s, -0.28 * s).lineTo(0.28 * s, 0.28 * s).moveTo(0.28 * s, -0.28 * s).lineTo(-0.28 * s, 0.28 * s).strokePath();
  else {
    g.beginPath().moveTo(-0.38 * s, -0.14 * s).lineTo(-0.18 * s, -0.14 * s).lineTo(0.06 * s, -0.34 * s).lineTo(0.06 * s, 0.34 * s).lineTo(-0.18 * s, 0.14 * s).lineTo(-0.38 * s, 0.14 * s).closePath().fillPath();
    g.beginPath().arc(0.06 * s, 0, 0.26 * s, -0.9, 0.9).strokePath();
    g.beginPath().arc(0.06 * s, 0, 0.46 * s, -0.9, 0.9).strokePath();
  }
  (btn.list[1] as Box).add(g);
}

/**
 * The room behind Mimi. It only draws what the core sent; it never reads a word's answer, so nothing here can hint at right or wrong.
 */
export class RoomView {
  private objs: Obj[] = [];
  private spots = new Map<string, Spot>();
  private doors: Phaser.GameObjects.Zone[] = [];
  private cashier: Phaser.GameObjects.Image | null = null;
  private stalls = new Map<FruitId, Stall>();
  private stallsOn = false;
  private picked: FruitId | null = null; // the stall Mimi is asking about stays lit, right or wrong
  private asks: Box[] = [];
  private book: { word: WordId; root: Box } | null = null;

  constructor(
    private scene: Phaser.Scene,
    private onEvent: (e: TripEvent) => void,
    private onAgain: (word: WordId) => void,
  ) {}

  show(room: Shown): void {
    this.hide();
    const { gameW: w, gameH: h } = TUNING;
    this.add(this.scene.add.rectangle(w / 2, h / 2, w, h, COLORS.indigo).setDepth(0));
    this.add(this.scene.add.rectangle(w / 2, V.floor.y + V.floor.h / 2, w, V.floor.h, COLORS.paper, V.look.floorAlpha).setDepth(1));
    switch (room.kind) {
      case 'stall':
        return this.stall(room.word);
      case 'fork':
        return this.fork();
      case 'chest':
        return this.chest(room.big);
      case 'cashier':
        return this.cashierRoom();
      case 'teach':
        return this.teach(room.teach);
      case 'gate':
      case 'robot':
        this.add(fitImage(this.scene.add.image(V.npc.x, V.npc.y, `v2_${room.kind}`).setOrigin(0.5, 1), V.npc.px).setDepth(10));
        return room.kind === 'gate' ? this.again(room.word) : this.robotBubble(room.word);
    }
  }

  hide(): void {
    for (const o of this.objs) {
      this.scene.tweens.killTweensOf(o);
      o.destroy();
    }
    this.objs = [];
    this.doors = [];
    this.cashier = null;
    this.stalls.clear();
    this.stallsOn = false;
    this.picked = null;
    this.asks = [];
    this.book = null;
    this.spots.clear();
  }

  setDoors(on: boolean): void {
    for (const d of this.doors) d.input!.enabled = on;
  }

  /** Stalls are tappable while on; a marked one never is. */
  setStalls(on: boolean): void {
    this.stallsOn = on;
    if (on) this.picked = null;
    this.stalls.forEach((s) => this.paintStall(s));
  }

  /** Mimi remembers "not this": her head sits on the stall and it is never tappable again. */
  mark(item: FruitId): void {
    const s = this.stalls.get(item);
    if (!s || s.marked) return;
    s.marked = true;
    const m = TUNING.markTag;
    const tag = this.add(this.scene.add.image(s.x, s.y + m.dy, 'v2_mimi_idle').setScale(m.scale).setDepth(12));
    if (!reducedMotion()) this.scene.tweens.add({ targets: tag, angle: { from: -m.angle, to: m.angle }, duration: m.ms, yoyo: true, repeat: m.repeat });
    this.paintStall(s);
  }

  showAsk(show: boolean): void {
    for (const b of this.asks) {
      b.setVisible(show);
      b.input!.enabled = show;
    }
  }

  /** `null` closes the book. The same word again is a short pulse, not a reopen. */
  showBook(word: WordId | null): void {
    const b = V.teach.book;
    if (word !== null && this.book?.word === word) {
      const root = this.book.root;
      if (!reducedMotion()) {
        this.scene.tweens.killTweensOf(root);
        root.setScale(1).setPosition(b.x, b.y);
        this.scene.tweens.add({ targets: root, scale: b.pulse, duration: b.pulseMs, yoyo: true });
      }
      return;
    }
    if (this.book) {
      this.scene.tweens.killTweensOf(this.book.root);
      this.book.root.destroy();
      this.objs = this.objs.filter((o) => o !== this.book!.root);
      this.book = null;
      for (const k of [...this.spots.keys()]) if (k === 'book' || k === 'book_word' || k.startsWith('clue_')) this.spots.delete(k);
    }
    if (word === null) return;
    const s = this.scene;
    const root = this.add(s.add.container(b.x, b.y).setDepth(15));
    const hear = (clue: ClueId | WordId) => () => {
      playSfx('pop');
      this.onEvent({ t: 'bookWord', clue });
    };
    const bg = s.add.rectangle(0, 0, b.w, b.h, b.fill).setStrokeStyle(V.look.lineBook, COLORS.ink).setInteractive();
    bg.on('pointerdown', () => {
      playSfx('pop');
      this.onEvent({ t: 'bookOpen' });
    });
    const plate = s.add.rectangle(0, b.wordY, b.wordW, Math.max(b.wordH, TUNING.minHitPx), COLORS.paper).setStrokeStyle(V.look.lineBold, COLORS.ink).setInteractive();
    plate.on('pointerdown', hear(word));
    root.add([bg, plate, s.add.text(0, b.wordY, word, { fontFamily: FONT_DISPLAY, fontStyle: '800', fontSize: `${b.wordPx}px`, color: CSS.ink }).setOrigin(0.5)]);
    this.spots.set('book', { x: b.x, y: b.y + b.h / 2 - V.look.bookHitDy });
    this.spots.set('book_word', { x: b.x, y: b.y + b.wordY });
    const clues = wordDef(word).clues;
    clues.forEach((c, i) => {
      const x = (i - (clues.length - 1) / 2) * 2 * b.clueDx;
      const tile = s.add.rectangle(x, b.clueY, b.tile, b.tile, COLORS.paper).setStrokeStyle(V.look.line, COLORS.ink).setInteractive();
      tile.on('pointerdown', hear(c));
      root.add([tile, this.clueIcon(c, x, b.clueY, b.clue)]);
      this.spots.set(`clue_${i}`, { x: b.x + x, y: b.y + b.clueY });
    });
    this.book = { word, root };
    if (reducedMotion()) return;
    root.x = b.x + b.openDx;
    s.tweens.add({ targets: root, x: b.x, duration: b.openMs, ease: 'Back.easeOut' });
  }

  center(name: string): Spot | null {
    return this.spots.get(name) ?? null;
  }

  /** The robot leans toward Mimi and holds it through the `wait` that follows. It resolves nothing: the pause is the wait alone. */
  cashierLook(): void {
    const c = this.cashier;
    if (!c || reducedMotion()) return;
    this.scene.tweens.add({ targets: c, angle: V.cashier.leanDeg, y: c.y + V.cashier.leanPx, duration: V.cashier.leanMs, yoyo: true, hold: TUNING.suspenseMs });
  }

  private add<T extends Obj>(o: T): T {
    this.objs.push(o);
    return o;
  }

  private bounce(o: { y: number }): void {
    if (!reducedMotion()) this.scene.tweens.add({ targets: o, y: o.y - V.bounce.px, duration: V.bounce.ms, yoyo: true });
  }

  /** A tap area with the same feedback everywhere: pop and a bounce. */
  private tappable(x: number, y: number, w: number, h: number, name: string, bounceTarget: { y: number }, onTap: () => void): Phaser.GameObjects.Zone {
    const z = this.add(this.scene.add.zone(x, y, Math.max(w, TUNING.minHitPx), Math.max(h, TUNING.minHitPx)).setDepth(20).setInteractive());
    this.spots.set(name, { x, y });
    z.on('pointerdown', () => {
      playSfx('pop');
      this.bounce(bounceTarget);
      onTap();
    });
    return z;
  }

  private text(x: number, y: number, s: string, px: number, color: string = CSS.paper): Phaser.GameObjects.Text {
    return this.add(this.scene.add.text(x, y, s, { fontFamily: FONT_DISPLAY, fontStyle: '800', fontSize: `${px}px`, color }).setOrigin(0.5).setDepth(12));
  }

  /** Mimi shows what she knows: the word's own picture (or colour swatch) on a counter. Tapping it is just fun. */
  private stall(word: Parameters<typeof wordDef>[0]): void {
    const c = V.counter;
    this.add(this.scene.add.rectangle(c.x, c.y, c.w, c.h, COLORS.paper).setStrokeStyle(V.look.lineBold, COLORS.ink).setDepth(10));
    const y = c.y - c.h / 2 - c.itemPx / 2;
    const item: { y: number } & Obj =
      wordDef(word).kind === 'color'
        ? this.add(this.scene.add.rectangle(c.x, y, c.itemPx * V.look.stallSwatch, c.itemPx * V.look.stallSwatch, SWATCH[word as 'red' | 'yellow' | 'green']).setStrokeStyle(V.look.lineBold, COLORS.paper).setDepth(11))
        : this.add(fitImage(this.scene.add.image(c.x, y, `v2_item_${word}`), c.itemPx).setDepth(11));
    this.text(c.x, c.y, word, c.label, CSS.ink);
    this.tappable(c.x, y, c.itemPx, c.itemPx, `stall_${word}`, item, () => undefined);
  }

  /** Two doors of the same size and the same tap area (GDD 6). The "?" door glows (Sun) and has a badge; the other shows a chest. */
  private fork(): void {
    const d = V.door;
    const cy = d.y - d.h / 2;
    const make = (x: number, door: 'safe' | 'mystery') => {
      if (door === 'mystery') this.add(this.scene.add.ellipse(x, cy, d.glowW, d.glowH, COLORS.sun, d.glowAlpha).setDepth(9));
      const img = this.add(this.scene.add.image(x, d.y, 'v2_door').setOrigin(0.5, 1).setDisplaySize(d.w, d.h).setDepth(10));
      if (door === 'safe') this.add(fitImage(this.scene.add.image(x, cy - V.look.doorIconDy, 'v2_chest'), d.icon).setDepth(11));
      else {
        this.add(this.scene.add.circle(x, cy - V.look.doorIconDy, d.badge, COLORS.paper).setStrokeStyle(V.look.lineBold, COLORS.ink).setDepth(11));
        this.text(x, cy - V.look.doorIconDy, '?', d.badge * 1.4, CSS.ink);
      }
      const z = this.tappable(x, cy, d.w, d.h, `door_${door}`, img, () => this.onEvent({ t: 'tapDoor', door }));
      z.input!.enabled = false; // the `doors` effect turns them on
      this.doors.push(z);
    };
    make(d.safeX, 'safe');
    make(d.mysteryX, 'mystery');
  }

  private chest(big: boolean): void {
    const c = V.chest;
    const px = big ? c.bigPx : c.px;
    const img = this.add(fitImage(this.scene.add.image(c.x, c.y, 'v2_chest').setOrigin(0.5, 1), px).setDepth(10));
    this.tappable(c.x, c.y - img.displayHeight / 2, img.displayWidth, img.displayHeight, 'chest', img, () => this.onEvent({ t: 'tapChest' }));
  }

  private cashierRoom(): void {
    const c = V.cashier;
    this.cashier = this.add(fitImage(this.scene.add.image(c.x, c.y, 'v2_cashier').setOrigin(0.5, 1), c.px).setDepth(10));
  }

  /** Three stalls, hidden Yes and No at the bottom. The book arrives with the `book` effect. */
  private teach(t: TeachRoom): void {
    const k = V.teach;
    t.stalls.forEach((f, i) => {
      const x = k.xs[i]!;
      const iy = k.y - k.h / 2 - k.itemPx / 2;
      const box = this.add(
        this.scene.add.container(x, 0, [
          this.scene.add.rectangle(0, k.y, k.w, k.h, COLORS.paper).setStrokeStyle(V.look.lineBold, COLORS.ink),
          fitImage(this.scene.add.image(0, iy, `v2_item_${f}`), k.itemPx),
        ]).setDepth(10),
      );
      // The tap area covers the counter and the fruit; its centre is where the e2e hook clicks.
      const zone = this.tappable(x, k.y - k.itemPx / 2, k.w, k.itemPx + k.h, `stall_${f}`, box, () => {
        this.picked = f;
        this.onEvent({ t: 'tapStall', fruit: f });
      });
      const stall = { box, zone, marked: false, x, y: iy };
      this.stalls.set(f, stall);
      this.paintStall(stall);
    });
    const a = k.ask;
    const mk = (x: number, kind: 'tick' | 'cross', name: string, ev: TripEvent): void => {
      const b = this.add(makeClayButton(this.scene, x, a.y, { w: a.w, h: a.h, variant: 'plain', ariaName: name, onTap: () => this.onEvent(ev) }).setDepth(20));
      glyph(b, kind, a.glyph, -a.h * V.look.glyphDy);
      this.spots.set(name.toLowerCase(), { x, y: a.y });
      this.asks.push(b);
    };
    mk(TUNING.gameW / 2 - a.gap / 2, 'tick', 'Yes', { t: 'tapYes' });
    mk(TUNING.gameW / 2 + a.gap / 2, 'cross', 'No', { t: 'tapNo' });
    this.showAsk(false);
  }

  private paintStall(s: Stall): void {
    s.zone.input!.enabled = this.stallsOn && !s.marked;
    s.box.setAlpha(this.stallsOn ? (s.marked ? TUNING.stallDimMarked : 1) : s.marked ? TUNING.stallDimMarkedOff : this.picked && this.stalls.get(this.picked) === s ? 1 : TUNING.stallDimOff);
  }

  /** Colour clues are swatches, "long" and "round" are drawn shapes, a colour word's clue is its fruit. Never the answer for a fruit word. */
  private clueIcon(c: ClueId, x: number, y: number, size: number): Obj {
    const s = this.scene;
    if (c === 'yellow' || c === 'orange' || c === 'green') return s.add.rectangle(x, y, size, size, SWATCH[c]).setStrokeStyle(V.look.line, COLORS.ink);
    if (c === 'long') return s.add.rectangle(x, y, size * V.look.clueLongW, size * V.look.clueLongH, COLORS.skyLight).setStrokeStyle(V.look.line, COLORS.ink);
    if (c === 'round') return s.add.circle(x, y, size * V.look.clueRound, COLORS.skyLight).setStrokeStyle(V.look.line, COLORS.ink);
    return fitImage(s.add.image(x, y, `v2_item_${c}`), size);
  }

  /** Gate: the listen-again button. The gate itself shows no picture and no text of its word. */
  private again(word: WordId): void {
    const g = V.gate.again;
    const b = this.add(makeClayButton(this.scene, g.x, g.y, { w: g.size, h: g.size, variant: 'plain', ariaName: 'Listen again', onTap: () => this.onAgain(word) }).setDepth(20));
    glyph(b, 'ear', g.glyph, -g.size * V.look.glyphDy);
    this.spots.set('again', { x: g.x, y: g.y });
  }

  /** Robot: a speech bubble with the item's picture (a swatch for a colour). */
  private robotBubble(word: WordId): void {
    const r = V.robot.bubble;
    const s = this.scene;
    const g = s.add.graphics().fillStyle(COLORS.paper, 1).lineStyle(V.look.lineBold, COLORS.indigo, 1);
    g.fillEllipse(0, 0, r.w, r.h).strokeEllipse(0, 0, r.w, r.h);
    g.fillTriangle(-r.w * 0.4, r.h * 0.1, -r.w * 0.62, r.h * 0.32, -r.w * 0.28, r.h * 0.3);
    const pic =
      wordDef(word).kind === 'color'
        ? s.add.rectangle(0, 0, r.pic, r.pic, SWATCH[word as 'red' | 'yellow' | 'green']).setStrokeStyle(V.look.lineBold, COLORS.indigo)
        : fitImage(s.add.image(0, 0, `v2_item_${word}`), r.pic);
    const root = this.add(s.add.container(r.x, r.y, [g, pic]).setDepth(12));
    if (reducedMotion()) return;
    root.setScale(V.look.popFrom);
    s.tweens.add({ targets: root, scale: 1, duration: r.popMs, ease: 'Back.easeOut' });
  }
}
