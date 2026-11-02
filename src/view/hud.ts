import Phaser from 'phaser';
import type { OrderSlot } from '../core/trip';
import type { WordId } from '../core/types';
import { TUNING } from '../content/tuning';
import { COLORS, CSS, FONT_DISPLAY } from './theme';
import { drawGlyph, fitImage, reducedMotion } from './ui';

const L = TUNING.trip.layout;
const text = (scene: Phaser.Scene, x: number, y: number, s: string, px: number) =>
  scene.add.text(x, y, s, { fontFamily: FONT_DISPLAY, fontStyle: '800', fontSize: `${px}px`, color: CSS.indigo }).setOrigin(0.5);

/** Order (top left), battery (top right), gears (under it). Reads at a glance and never needs colour alone. */
export class Hud {
  private order: Phaser.GameObjects.Container;
  private battery: Phaser.GameObjects.Graphics;
  private gearText: Phaser.GameObjects.Text;
  private gearBox: Phaser.GameObjects.Container;
  private left = -1;
  private gears = 0;
  private slots: OrderSlot[] = [];

  constructor(private scene: Phaser.Scene) {
    const g = L.gears;
    this.order = scene.add.container(L.order.x, L.order.y);
    this.battery = scene.add.graphics();
    const pts: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < g.teeth; i++) {
      const r = i % 2 ? g.icon * g.inner : g.icon;
      const a = (i * Math.PI * 2) / g.teeth;
      pts.push(new Phaser.Math.Vector2(Math.cos(a) * r, Math.sin(a) * r));
    }
    const icon = scene.add.graphics().fillStyle(COLORS.sun, 1).lineStyle(g.line, COLORS.indigo, 1);
    icon.fillPoints(pts, true).strokePoints(pts, true).fillStyle(COLORS.paper, 1).fillCircle(0, 0, g.icon * g.hole);
    this.gearText = text(scene, -g.icon - g.textGap, 0, '0', g.font).setOrigin(1, 0.5).setColor(CSS.paper); // the trip background is Indigo
    this.gearBox = scene.add.container(g.right - g.icon, g.y, [icon, this.gearText]);
    scene.add.container(0, 0, [this.order, this.battery, this.gearBox]).setDepth(L.depth);
  }

  /** `hide`: words whose picture stays off an open slot, so the gate is won by listening, not by matching pictures (GDD 6). */
  setOrder(slots: OrderSlot[], hide: ReadonlySet<WordId>): void {
    const o = L.order;
    const sw = o.slot * o.swW;
    const prev = this.slots;
    this.slots = slots;
    this.order.removeAll(true);
    slots.forEach((s, i) => {
      const c = this.scene.add.container(i * (o.slot + o.gap) + o.slot / 2, o.slot / 2);
      c.add(this.scene.add.graphics().fillStyle(COLORS.paper, 1).fillRoundedRect(-o.slot / 2, -o.slot / 2, o.slot, o.slot, o.r).lineStyle(o.line, COLORS.indigo, 1).strokeRoundedRect(-o.slot / 2, -o.slot / 2, o.slot, o.slot, o.r));
      const w = s.word;
      if (w === null) c.add(text(this.scene, 0, 0, '?', o.slot * o.qFont));
      else if (s.state === 'open' && hide.has(w)) c.add(drawGlyph(this.scene, 'ear', o.slot * o.ear));
      else if (w === 'red' || w === 'yellow' || w === 'green') {
        c.add(this.scene.add.graphics().fillStyle(L.swatch[w], 1).fillRoundedRect(-sw / 2, -o.slot * o.swTop, sw, o.slot * o.swH, o.swR).lineStyle(o.swLine, COLORS.indigo, 1).strokeRoundedRect(-sw / 2, -o.slot * o.swTop, sw, o.slot * o.swH, o.swR));
        c.add(text(this.scene, 0, o.slot * o.wordY, w, o.font)); // the word too, so colour is never alone
      } else c.add(fitImage(this.scene.add.image(0, 0, `v2_item_${w}`), o.slot * o.pic));
      if (s.state === 'filled' && s.word !== null) { // the "?" slot stays "?": a tick before the cashier would praise a pick that may be wrong (GDD 9)
        const [a, b, d] = o.tick;
        const m = this.scene.add.graphics().fillStyle(L.swatch.green, 1).fillCircle(0, 0, o.mark / 2).lineStyle(o.markLine, COLORS.paper, 1).beginPath().moveTo(...a).lineTo(...b).lineTo(...d).strokePath();
        m.setPosition(o.slot / 2 - o.markInset, -o.slot / 2 + o.markInset);
        c.add(m);
      }
      if (s.state === 'skipped') c.setAlpha(o.skipAlpha); // faded, no penalty look
      this.order.add(c);
      if (reducedMotion()) return;
      if (!prev.length) { // Mom hands over the list: the slots arrive one by one
        c.setScale(0);
        this.scene.tweens.add({ targets: c, scale: 1, duration: o.popMs, delay: i * o.staggerMs, ease: 'Back.easeOut' });
      } else if (prev[i]?.state !== s.state) this.scene.tweens.add({ targets: c, scale: { from: o.bump, to: 1 }, duration: o.popMs, ease: 'Back.easeOut' });
    });
  }

  private openIndex(): number {
    return this.slots.findIndex((s) => s.state === 'open');
  }

  /** The slot being worked on: where a collected item flies. Same for right and wrong. */
  openSlot(): { x: number; y: number } | null {
    const i = this.openIndex();
    const o = L.order;
    return i < 0 ? null : { x: o.x + i * (o.slot + o.gap) + o.slot / 2, y: o.y + o.slot / 2 };
  }

  /** The item landed. The "?" slot stays "?" and only nods: it may be wrong (GDD 9). */
  bump(): void {
    const c = this.order.list[this.openIndex()];
    if (c && !reducedMotion()) this.scene.tweens.add({ targets: c, scale: L.order.bump, duration: L.order.bumpMs, yoyo: true });
  }

  /** Bars are counted: a full bar is solid, an empty one is an outline. */
  setBattery(left: number, fallMs: number = L.battery.fallMs): void {
    const b = L.battery;
    const max = TUNING.trip.batteryMax;
    const x0 = b.right - max * b.barW - (max - 1) * b.gap;
    if (this.left > left && !reducedMotion()) {
      const lost = this.scene.add.rectangle(x0 + left * (b.barW + b.gap) + b.barW / 2, b.y + b.barH / 2, b.barW, b.barH, COLORS.sun).setStrokeStyle(b.line, COLORS.indigo).setDepth(L.depth);
      this.scene.tweens.add({ targets: lost, y: lost.y + b.fallPx, alpha: 0, duration: fallMs, ease: 'Quad.easeIn', onComplete: () => lost.destroy() });
      this.scene.time.delayedCall(fallMs + TUNING.fallbackPadMs, () => lost.destroy());
    }
    this.left = left;
    this.battery.clear().lineStyle(b.line, COLORS.skyLight, 1); // on Indigo, so an empty bar still counts
    for (let i = 0; i < max; i++) {
      const x = x0 + i * (b.barW + b.gap);
      this.battery.fillStyle(COLORS.sun, i < left ? 1 : 0).fillRoundedRect(x, b.y, b.barW, b.barH, b.r).strokeRoundedRect(x, b.y, b.barW, b.barH, b.r);
    }
  }

  addGears(n: number): void {
    this.gears += n;
    this.gearText.setText(String(this.gears));
    if (reducedMotion()) return;
    this.scene.tweens.add({ targets: this.gearBox, scale: L.gears.bounce, duration: L.gears.bounceMs, yoyo: true });
  }
}
