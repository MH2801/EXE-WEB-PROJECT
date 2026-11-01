import Phaser from 'phaser';
import type { OrderSlot } from '../core/trip';
import { TUNING } from '../content/tuning';
import { COLORS, CSS, FONT_DISPLAY } from './theme';
import { fitImage, reducedMotion } from './ui';

const L = TUNING.trip.layout;
const text = (scene: Phaser.Scene, x: number, y: number, s: string, px: number) =>
  scene.add.text(x, y, s, { fontFamily: FONT_DISPLAY, fontStyle: '800', fontSize: `${px}px`, color: CSS.indigo }).setOrigin(0.5);

/** Order (top left), battery (top right), gears (under it). Reads at a glance and never needs colour alone. */
export class Hud {
  private root: Phaser.GameObjects.Container;
  private order: Phaser.GameObjects.Container;
  private battery: Phaser.GameObjects.Graphics;
  private gearText: Phaser.GameObjects.Text;
  private gearBox: Phaser.GameObjects.Container;
  private left = -1;
  private gears = 0;

  constructor(private scene: Phaser.Scene) {
    const g = L.gears;
    this.order = scene.add.container(L.order.x, L.order.y);
    this.battery = scene.add.graphics();
    const pts: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < 16; i++) {
      const r = i % 2 ? g.icon * 0.8 : g.icon;
      pts.push(new Phaser.Math.Vector2(Math.cos((i * Math.PI) / 8) * r, Math.sin((i * Math.PI) / 8) * r));
    }
    const icon = scene.add.graphics().fillStyle(COLORS.sun, 1).lineStyle(5, COLORS.indigo, 1);
    icon.fillPoints(pts, true).strokePoints(pts, true).fillStyle(COLORS.paper, 1).fillCircle(0, 0, g.icon * 0.35);
    this.gearText = text(scene, -g.icon - 10, 0, '0', g.font).setOrigin(1, 0.5).setColor(CSS.paper); // the trip background is Indigo
    this.gearBox = scene.add.container(g.right - g.icon, g.y, [icon, this.gearText]);
    this.root = scene.add.container(0, 0, [this.order, this.battery, this.gearBox]).setDepth(L.depth);
  }

  setOrder(slots: OrderSlot[]): void {
    const o = L.order;
    const s60 = o.slot * 0.6;
    this.order.removeAll(true);
    slots.forEach((s, i) => {
      const c = this.scene.add.container(i * (o.slot + o.gap) + o.slot / 2, o.slot / 2);
      c.add(this.scene.add.graphics().fillStyle(COLORS.paper, 1).fillRoundedRect(-o.slot / 2, -o.slot / 2, o.slot, o.slot, 22).lineStyle(6, COLORS.indigo, 1).strokeRoundedRect(-o.slot / 2, -o.slot / 2, o.slot, o.slot, 22));
      const w = s.word;
      if (w === null) c.add(text(this.scene, 0, 0, '?', o.slot * 0.6));
      else if (w === 'red' || w === 'yellow' || w === 'green') {
        c.add(this.scene.add.graphics().fillStyle(L.swatch[w], 1).fillRoundedRect(-s60 / 2, -o.slot * 0.38, s60, o.slot * 0.46, 12).lineStyle(4, COLORS.indigo, 1).strokeRoundedRect(-s60 / 2, -o.slot * 0.38, s60, o.slot * 0.46, 12));
        c.add(text(this.scene, 0, o.slot * 0.3, w, o.font)); // the word too, so colour is never alone
      } else c.add(fitImage(this.scene.add.image(0, 0, `v2_item_${w}`), o.slot * 0.7));
      if (s.state === 'filled' && s.word !== null) { // the "?" slot stays "?": a tick before the cashier would praise a pick that may be wrong (GDD 9)
        const m = this.scene.add.graphics().fillStyle(L.swatch.green, 1).fillCircle(0, 0, o.mark / 2).lineStyle(5, COLORS.paper, 1).beginPath().moveTo(-8, 0).lineTo(-2, 7).lineTo(9, -7).strokePath();
        m.setPosition(o.slot / 2 - 6, -o.slot / 2 + 6);
        c.add(m);
      }
      if (s.state === 'skipped') c.setAlpha(0.35); // faded, no penalty look
      this.order.add(c);
    });
  }

  /** Bars are counted: a full bar is solid, an empty one is an outline. */
  setBattery(left: number): void {
    const b = L.battery;
    const max = TUNING.trip.batteryMax;
    const x0 = b.right - max * b.barW - (max - 1) * b.gap;
    if (this.left > left && !reducedMotion()) {
      const lost = this.scene.add.rectangle(x0 + left * (b.barW + b.gap) + b.barW / 2, b.y + b.barH / 2, b.barW, b.barH, COLORS.sun).setStrokeStyle(5, COLORS.indigo).setDepth(L.depth);
      this.scene.tweens.add({ targets: lost, y: lost.y + b.fallPx, alpha: 0, duration: b.fallMs, ease: 'Quad.easeIn', onComplete: () => lost.destroy() });
      this.scene.time.delayedCall(b.fallMs + TUNING.fallbackPadMs, () => lost.destroy());
    }
    this.left = left;
    this.battery.clear().lineStyle(5, COLORS.skyLight, 1); // on Indigo, so an empty bar still counts
    for (let i = 0; i < max; i++) {
      const x = x0 + i * (b.barW + b.gap);
      this.battery.fillStyle(COLORS.sun, i < left ? 1 : 0).fillRoundedRect(x, b.y, b.barW, b.barH, 8).strokeRoundedRect(x, b.y, b.barW, b.barH, 8);
    }
  }

  addGears(n: number): void {
    this.gears += n;
    this.gearText.setText(String(this.gears));
    if (reducedMotion()) return;
    this.scene.tweens.add({ targets: this.gearBox, scale: L.gears.bounce, duration: L.gears.bounceMs, yoyo: true });
  }

  show(on: boolean): void {
    this.root.setVisible(on);
  }
}
