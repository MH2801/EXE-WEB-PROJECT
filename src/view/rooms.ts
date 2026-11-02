import Phaser from 'phaser';
import { TUNING } from '../content/tuning';
import { wordDef, type ClueId } from '../content/words';
import type { TripEvent } from '../core/trip';
import type { Room, TeachRoom } from '../core/tripgen';
import type { FruitId, WordId } from '../core/types';
import { playSfx } from './sfx';
import { COLORS, CSS, FONT_DISPLAY } from './theme';
import { drawGlyph, fitImage, inviteLoop, makeClayButton, reducedMotion, type InviteItem } from './ui';

const V = TUNING.trip.view;
export type Tw = (cfg: Phaser.Types.Tweens.TweenBuilderConfig) => Promise<void>;
export type InviteKind = 'door' | 'stall' | 'ask' | 'chest';
type Hideable = { setVisible(v: boolean): unknown };

/** The cashier's lean and Mimi's held breath run on this one clock: in, hold, back, done before the verdict (suspenseMs never changes). */
export function leanTiming(): { duration: number; hold: number } {
  const duration = reducedMotion() ? 1 : V.cashier.leanMs;
  return { duration, hold: TUNING.suspenseMs - V.cashier.settleMs - 2 * duration };
}
const SWATCH = TUNING.trip.layout.swatch;
type Spot = { x: number; y: number };
type Shown = Room | { kind: 'teach'; teach: TeachRoom } | { kind: 'chest'; big: boolean };
type Obj = Phaser.GameObjects.GameObject;
type Box = Phaser.GameObjects.Container;
type Stall = { box: Box; zone: Phaser.GameObjects.Zone; marked: boolean; x: number; y: number };

/**
 * The room behind Mimi. It only draws what the core sent; it never reads a word's answer, so nothing here can hint at right or wrong.
 */
export class RoomView {
  private objs: Obj[] = [];
  private spots = new Map<string, Spot>();
  private doors: Phaser.GameObjects.Zone[] = [];
  private doorItems: InviteItem[] = [];
  private chosen: { img: Phaser.GameObjects.Image; parts: Hideable[] } | null = null; // the door just tapped
  private npc: Phaser.GameObjects.Image | null = null; // who stands in the room
  private npcY = 0;
  private extras: Hideable[] = []; // leave with the npc
  private talkTw: Phaser.Tweens.Tween | null = null;
  private leanTw: Phaser.Tweens.Tween | null = null;
  private lid: { lid: Phaser.GameObjects.Image; img: Phaser.GameObjects.Image; mouthY: number } | null = null;
  private pics = new Map<string, Hideable>(); // pictures Mimi can take
  private stopInvite: (() => void) | null = null;
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
    this.stage();
    switch (room.kind) {
      case 'stall':
        return this.stall(room.word);
      case 'fork':
        return this.fork(room.safeOpen);
      case 'chest':
        return this.chest(room.big);
      case 'cashier':
        return this.cashierRoom();
      case 'teach':
        return this.teach(room.teach);
      case 'gate':
      case 'robot':
        this.stand(`v2_${room.kind}`, V.npc);
        return room.kind === 'gate' ? this.again(room.word) : this.robotRoom(room.word);
    }
  }

  /** The trip opens with Mom holding the list: who asks, and for what. */
  showMom(): void {
    this.stage();
    this.stand('v2_mom', V.mom);
  }

  private stage(): void {
    this.hide();
    const { gameW: w, gameH: h } = TUNING;
    this.add(this.scene.add.rectangle(w / 2, h / 2, w, h, COLORS.indigo).setDepth(0));
    this.add(this.scene.add.rectangle(w / 2, V.floor.y + V.floor.h / 2, w, V.floor.h, COLORS.paper, V.look.floorAlpha).setDepth(1));
  }

  private stand(key: string, c: { x: number; y: number; px: number }): void {
    this.npc = this.add(fitImage(this.scene.add.image(c.x, c.y, key).setOrigin(0.5, 1), c.px).setDepth(10));
    this.npcY = c.y;
    this.spots.set('source', { x: c.x, y: c.y - this.npc.displayHeight / 2 });
  }

  hide(): void {
    this.endInvite();
    for (const o of this.objs) {
      this.scene.tweens.killTweensOf(o);
      o.destroy();
    }
    this.objs = [];
    this.doors = [];
    this.doorItems = [];
    this.chosen = null;
    this.npc = null;
    this.extras = [];
    this.talkTw = this.leanTw = null;
    this.lid = null;
    this.pics.clear();
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

  /** Where a collected item starts: its stall, or what stands in the room. Mimi takes the picture off a stall. */
  take(item: FruitId): Spot | null {
    (this.pics.get(`stall_${item}`) ?? this.pics.get('source'))?.setVisible(false);
    return this.spots.get(`stall_${item}`) ?? this.spots.get('source') ?? null;
  }

  /** The cashier leans toward Mimi and is back upright by the verdict, right or wrong. It resolves nothing: the pause is the wait alone. */
  cashierLook(): void {
    const c = this.npc;
    if (!c) return;
    this.leanTw?.remove(); // never two leans on the next item (M5)
    c.setAngle(0).setY(this.npcY);
    this.leanTw = this.scene.tweens.add({ targets: c, angle: V.cashier.leanDeg, y: c.y + V.cashier.leanPx, yoyo: true, ...leanTiming() });
  }

  /** Whoever stands in the room bobs while its line plays, so a child sees who speaks. */
  talk(on: boolean): void {
    this.talkTw?.remove();
    this.talkTw = null;
    const n = this.npc;
    if (!n) return;
    n.y = this.npcY;
    if (on && !reducedMotion()) this.talkTw = this.scene.tweens.add({ targets: n, y: n.y - V.talk.px, duration: V.talk.ms, yoyo: true, repeat: -1 });
  }

  /** The way opens: the gate rolls up, the robot hops off. */
  clearPath(tw: Tw): Promise<void> {
    const n = this.npc;
    if (!n) return Promise.resolve();
    this.scene.tweens.killTweensOf(n);
    n.setAngle(0).setY(this.npcY);
    for (const o of this.extras) o.setVisible(false);
    if (n.texture.key !== 'v2_gate') return tw({ targets: n, x: n.x + V.robot.aside, duration: V.robot.asideMs, ease: 'Back.easeIn' });
    n.setOrigin(0.5, 0).setY(n.y - n.displayHeight);
    return tw({ targets: n, scaleY: n.scaleY * V.gate.liftTo, alpha: 0, duration: V.gate.liftMs, ease: 'Quad.easeIn' });
  }

  /** The tapped door shakes a little, then swings open with light behind it (GDD 9). */
  async openDoor(tw: Tw): Promise<void> {
    const d = this.chosen;
    if (!d) return;
    const k = V.door;
    await tw({ targets: d.img, angle: { from: -k.shakeDeg, to: k.shakeDeg }, duration: k.shakeMs, yoyo: true, repeat: k.shakes });
    d.img.setAngle(0).setOrigin(0, 1).setX(d.img.x - k.w / 2);
    for (const p of d.parts) p.setVisible(false);
    const light = this.add(this.scene.add.ellipse(d.img.x + k.w / 2, k.y - k.h / 2, k.w * k.lightW, k.h * k.lightH, COLORS.sun).setDepth(9));
    playSfx('pop');
    await Promise.all([
      tw({ targets: d.img, scaleX: d.img.scaleX * k.openX, duration: k.openMs, ease: 'Quad.easeOut' }),
      tw({ targets: light, scale: k.lightScale, alpha: k.lightAlpha, duration: k.openMs }),
    ]);
  }

  /** Anticipation, then the lid jumps open on a glow. Reduced motion lands on the open chest. */
  async openChest(tw: Tw): Promise<void> {
    if (!this.lid) return;
    const { lid, img, mouthY } = this.lid;
    const c = V.chest;
    await tw({ targets: [img, lid], x: { from: c.x - c.shakePx, to: c.x + c.shakePx }, duration: c.shakeMs, yoyo: true, repeat: c.shakes });
    img.x = lid.x = c.x;
    this.add(this.scene.add.ellipse(c.x, mouthY, img.displayWidth * c.glowW, img.displayHeight * c.glowH, COLORS.sun).setDepth(10));
    playSfx('pop');
    await tw({ targets: lid, y: lid.y - c.lidRise, angle: c.lidDeg, duration: c.openMs, ease: 'Back.easeOut' });
  }

  invite(kind: InviteKind): void {
    this.endInvite();
    const k = V.teach;
    const items: InviteItem[] =
      kind === 'door' ? this.doorItems
      : kind === 'stall' ? [...this.stalls.values()].filter((s) => !s.marked).map((s) => ({ objs: [s.box], x: s.x, top: s.y - k.itemPx / 2 }))
      : kind === 'ask' ? this.asks.map((b) => ({ objs: [b], x: b.x, top: k.ask.y - k.ask.h / 2 }))
      : this.lid ? [{ objs: [this.lid.img, this.lid.lid], x: V.chest.x, top: this.lid.img.y - this.lid.img.displayHeight }] : [];
    this.stopInvite = inviteLoop(this.scene, items);
  }

  endInvite(): void {
    this.stopInvite?.();
    this.stopInvite = null;
  }

  private add<T extends Obj>(o: T): T {
    this.objs.push(o);
    return o;
  }

  private bounce(o: object): void {
    if (!reducedMotion()) this.scene.tweens.add({ targets: o, y: `-=${V.bounce.px}`, duration: V.bounce.ms, yoyo: true });
  }

  /** A tap area with the same feedback everywhere: pop and a bounce. */
  private tappable(x: number, y: number, w: number, h: number, name: string, bounceTarget: object, onTap: () => void): Phaser.GameObjects.Zone {
    const z = this.add(this.scene.add.zone(x, y, Math.max(w, TUNING.minHitPx), Math.max(h, TUNING.minHitPx)).setDepth(20).setInteractive());
    this.spots.set(name, { x, y });
    z.on('pointerdown', () => {
      this.endInvite();
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
    const item: { y: number } & Obj & Hideable =
      wordDef(word).kind === 'color'
        ? this.add(this.scene.add.rectangle(c.x, y, c.itemPx * V.look.stallSwatch, c.itemPx * V.look.stallSwatch, SWATCH[word as 'red' | 'yellow' | 'green']).setStrokeStyle(V.look.lineBold, COLORS.paper).setDepth(11))
        : this.add(fitImage(this.scene.add.image(c.x, y, `v2_item_${word}`), c.itemPx).setDepth(11));
    this.text(c.x, c.y, word, c.label, CSS.ink);
    this.tappable(c.x, y, c.itemPx, c.itemPx, `stall_${word}`, item, () => undefined);
    this.spots.set('source', { x: c.x, y });
    this.pics.set('source', item);
  }

  /** Two doors of the same size, tap area and badge (GDD 6). The "?" door also glows (Sun, clear of the dialogue box); the other shows a chest. */
  private fork(safeOpen: boolean): void {
    const d = V.door;
    const cy = d.y - d.h / 2;
    const make = (x: number, door: 'safe' | 'mystery') => {
      if (door === 'safe' && !safeOpen) return this.lockedDoor(x, cy);
      if (door === 'mystery') this.add(this.scene.add.ellipse(x, cy + d.glowDy, d.glowW, d.glowH, COLORS.sun, d.glowAlpha).setDepth(9));
      const img = this.add(this.scene.add.image(x, d.y, 'v2_door').setOrigin(0.5, 1).setDisplaySize(d.w, d.h).setDepth(10));
      const iy = cy - V.look.doorIconDy;
      const badge = this.add(this.scene.add.circle(x, iy, d.badge, COLORS.paper).setStrokeStyle(V.look.lineBold, COLORS.ink).setDepth(11));
      const mark = door === 'safe' ? this.add(fitImage(this.scene.add.image(x, iy, 'v2_chest'), d.icon).setDepth(11)) : this.text(x, iy, '?', d.badge * V.look.badgeFont, CSS.ink);
      const parts = [badge, mark];
      const all = [img, ...parts];
      const z = this.tappable(x, cy, d.w, d.h, `door_${door}`, all, () => {
        this.chosen = { img, parts };
        this.onEvent({ t: 'tapDoor', door });
      });
      z.input!.enabled = false; // the `doors` effect turns them on
      this.doors.push(z);
      this.doorItems.push({ objs: all, x, top: d.y - d.h });
    };
    make(d.safeX, 'safe');
    make(d.mysteryX, 'mystery');
  }

  /** Trip 1's safe door: closed, a small lock, no glow, no hop. A tap only jiggles the lock: no event, no sound, never a "wrong" signal. */
  private lockedDoor(x: number, cy: number): void {
    const d = V.door;
    const k = d.lock;
    const s = this.scene;
    this.add(s.add.image(x, d.y, 'v2_door').setOrigin(0.5, 1).setDisplaySize(d.w, d.h).setDepth(10));
    const iy = cy - V.look.doorIconDy;
    this.add(s.add.circle(x, iy, d.badge, COLORS.paper).setStrokeStyle(V.look.lineBold, COLORS.ink).setDepth(11));
    this.add(fitImage(s.add.image(x, iy, 'v2_chest'), d.icon).setDepth(11));
    const lock = this.add(
      s.add.graphics({ x, y: cy + k.dy }).setDepth(12)
        .lineStyle(V.look.lineBold, COLORS.ink).beginPath().arc(0, -k.h / 2, k.shackle, Math.PI, 2 * Math.PI).strokePath()
        .fillStyle(COLORS.paper).fillRoundedRect(-k.w / 2, -k.h / 2, k.w, k.h, k.r).strokeRoundedRect(-k.w / 2, -k.h / 2, k.w, k.h, k.r)
        .fillStyle(COLORS.ink).fillCircle(0, 0, k.keyhole),
    );
    const z = this.add(s.add.zone(x, cy, d.w, d.h).setDepth(20).setInteractive());
    this.spots.set('door_safe', { x, y: cy });
    z.on('pointerdown', () => {
      if (reducedMotion()) return;
      s.tweens.killTweensOf(lock);
      lock.setAngle(0);
      s.tweens.add({ targets: lock, angle: { from: -k.jiggleDeg, to: k.jiggleDeg }, duration: k.jiggleMs, yoyo: true, repeat: 1, onComplete: () => lock.setAngle(0) });
    });
  }

  private chest(big: boolean): void {
    const c = V.chest;
    const px = big ? c.bigPx : c.px;
    // One picture cut in two along the lid's edge: that is how the chest opens without new art.
    const img = this.add(fitImage(this.scene.add.image(c.x, c.y, 'v2_chest').setOrigin(0.5, 1), px).setDepth(10));
    const mouthY = c.y - img.displayHeight * (1 - c.lidCut);
    const lid = this.add(fitImage(this.scene.add.image(c.x, mouthY, 'v2_chest').setOrigin(0.5, c.lidCut), px).setDepth(11));
    lid.setCrop(0, 0, lid.width, lid.height * c.lidCut);
    img.setCrop(0, img.height * c.lidCut, img.width, img.height * (1 - c.lidCut));
    this.lid = { lid, img, mouthY };
    this.tappable(c.x, c.y - img.displayHeight / 2, img.displayWidth, img.displayHeight, 'chest', [img, lid], () => this.onEvent({ t: 'tapChest' }));
  }

  private cashierRoom(): void {
    this.stand('v2_cashier', V.cashier);
  }

  /** Three stalls, hidden Yes and No at the bottom. The book arrives with the `book` effect. */
  private teach(t: TeachRoom): void {
    const k = V.teach;
    t.stalls.forEach((f, i) => {
      const x = k.xs[i]!;
      const iy = k.y - k.h / 2 - k.itemPx / 2;
      const pic = fitImage(this.scene.add.image(0, iy, `v2_item_${f}`), k.itemPx);
      this.pics.set(`stall_${f}`, pic);
      const box = this.add(
        this.scene.add.container(x, 0, [
          this.scene.add.rectangle(0, k.y, k.w, k.h, COLORS.paper).setStrokeStyle(V.look.lineBold, COLORS.ink),
          pic,
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
      (b.list[1] as Box).add(drawGlyph(this.scene, kind, a.glyph, -a.h * V.look.glyphDy));
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
    (b.list[1] as Box).add(drawGlyph(this.scene, 'ear', g.glyph, -g.size * V.look.glyphDy));
    this.spots.set('again', { x: g.x, y: g.y });
    this.extras.push(b);
  }

  /** Robot: drops in to block the way, sways, and wants the item in its bubble (a swatch for a colour). */
  private robotRoom(word: WordId): void {
    const r = V.robot.bubble;
    const s = this.scene;
    const n = this.npc!;
    if (!reducedMotion()) {
      n.y = this.npcY - V.robot.dropPx;
      s.tweens.add({ targets: n, y: this.npcY, duration: V.robot.dropMs, ease: 'Bounce.easeOut' });
      s.tweens.add({ targets: n, angle: { from: -V.robot.swayDeg, to: V.robot.swayDeg }, duration: V.robot.swayMs, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    const g = s.add.graphics().fillStyle(COLORS.paper, 1).lineStyle(V.look.lineBold, COLORS.indigo, 1);
    g.fillEllipse(0, 0, r.w, r.h).strokeEllipse(0, 0, r.w, r.h);
    const [ax, ay, bx, by, cx, cy] = r.tail;
    g.fillTriangle(r.w * ax, r.h * ay, r.w * bx, r.h * by, r.w * cx, r.h * cy);
    const pic =
      wordDef(word).kind === 'color'
        ? s.add.rectangle(0, 0, r.pic, r.pic, SWATCH[word as 'red' | 'yellow' | 'green']).setStrokeStyle(V.look.lineBold, COLORS.indigo)
        : fitImage(s.add.image(0, 0, `v2_item_${word}`), r.pic);
    const root = this.add(s.add.container(r.x, r.y, [g, pic]).setDepth(12));
    this.extras.push(root);
    if (reducedMotion()) return;
    root.setScale(V.look.popFrom);
    s.tweens.add({ targets: root, scale: 1, duration: r.popMs, ease: 'Back.easeOut' });
  }
}
