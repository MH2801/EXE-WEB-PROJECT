import Phaser from 'phaser';
import { TUNING } from '../content/tuning';
import { wordDef } from '../content/words';
import type { TripEvent } from '../core/trip';
import type { Room, TeachRoom } from '../core/tripgen';
import { playSfx } from './sfx';
import { COLORS, CSS, FONT_DISPLAY } from './theme';
import { fitImage, reducedMotion } from './ui';

const V = TUNING.trip.view;
type Spot = { x: number; y: number };
type Shown = Room | { kind: 'teach'; teach: TeachRoom } | { kind: 'chest'; big: boolean };
type Obj = Phaser.GameObjects.GameObject;

/**
 * The room behind Mimi. It only draws what the core sent; it never reads a word's answer, so nothing here can hint at right or wrong.
 * Gate, robot and the "?" room's stalls are plain placeholders until Task 10.
 */
export class RoomView {
  private objs: Obj[] = [];
  private spots = new Map<string, Spot>();
  private doors: Phaser.GameObjects.Zone[] = [];
  private cashier: Phaser.GameObjects.Image | null = null;

  constructor(private scene: Phaser.Scene, private onEvent: (e: TripEvent) => void) {}

  show(room: Shown): void {
    this.hide();
    const { gameW: w, gameH: h } = TUNING;
    this.add(this.scene.add.rectangle(w / 2, h / 2, w, h, COLORS.indigo).setDepth(0));
    this.add(this.scene.add.rectangle(w / 2, V.floor.y + V.floor.h / 2, w, V.floor.h, COLORS.paper, 0.14).setDepth(1));
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
    this.spots.clear();
  }

  setDoors(on: boolean): void {
    for (const d of this.doors) d.input!.enabled = on;
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
    this.add(this.scene.add.rectangle(c.x, c.y, c.w, c.h, COLORS.paper).setStrokeStyle(6, COLORS.ink).setDepth(10));
    const y = c.y - c.h / 2 - c.itemPx / 2;
    const item: { y: number } & Obj =
      wordDef(word).kind === 'color'
        ? this.add(this.scene.add.rectangle(c.x, y, c.itemPx * 0.8, c.itemPx * 0.8, TUNING.trip.layout.swatch[word as 'red' | 'yellow' | 'green']).setStrokeStyle(6, COLORS.paper).setDepth(11))
        : this.add(fitImage(this.scene.add.image(c.x, y, `v2_item_${word}`), c.itemPx).setDepth(11));
    this.text(c.x, c.y, word, c.label, CSS.ink);
    this.tappable(c.x, y, c.itemPx, c.itemPx, `stall_${word}`, item, () => undefined);
  }

  /** Two doors of the same size and the same tap area (GDD 6). The "?" door glows and has a badge; the other shows a chest. */
  private fork(): void {
    const d = V.door;
    const cy = d.y - d.h / 2;
    const make = (x: number, door: 'safe' | 'mystery') => {
      if (door === 'mystery') this.add(this.scene.add.ellipse(x, cy, d.glowW, d.glowH, COLORS.paper, d.glowAlpha).setDepth(9));
      const img = this.add(this.scene.add.image(x, d.y, 'v2_door').setOrigin(0.5, 1).setDisplaySize(d.w, d.h).setDepth(10));
      if (door === 'safe') this.add(fitImage(this.scene.add.image(x, cy - 40, 'v2_chest'), d.icon).setDepth(11));
      else {
        this.add(this.scene.add.circle(x, cy - 40, d.badge, COLORS.paper).setStrokeStyle(6, COLORS.ink).setDepth(11));
        this.text(x, cy - 40, '?', d.badge * 1.4, CSS.ink);
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

  /** Placeholder: three stalls with their fruit, no taps yet. */
  private teach(t: TeachRoom): void {
    const k = V.teach;
    t.stalls.forEach((f, i) => {
      const x = k.xs[i]!;
      this.add(this.scene.add.rectangle(x, k.y, k.w, k.h, COLORS.paper).setStrokeStyle(6, COLORS.ink).setDepth(10));
      this.add(fitImage(this.scene.add.image(x, k.y - k.h / 2 - k.itemPx / 2, `v2_item_${f}`), k.itemPx).setDepth(11));
      this.spots.set(`stall_${f}`, { x, y: k.y - k.h / 2 - k.itemPx / 2 });
    });
  }
}
