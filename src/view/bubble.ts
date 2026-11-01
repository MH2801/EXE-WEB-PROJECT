import Phaser from 'phaser';
import type { FruitId } from '../core/types';
import { TUNING } from '../content/tuning';
import type { Mimi } from './actors';
import { COLORS, CSS, FONT_DISPLAY } from './theme';
import { fitImage, reducedMotion } from './ui';

const L = TUNING.trip.layout;

/** Mimi's thought: what she believes. Rides on Mimi every frame and changes the moment `set` is called. */
export class Bubble {
  private root: Phaser.GameObjects.Container;
  private content: Phaser.GameObjects.GameObject | null = null;

  constructor(private scene: Phaser.Scene, follow: Mimi) {
    const { w, h } = L.bubble;
    const g = scene.add.graphics().fillStyle(COLORS.paper, 1).lineStyle(6, COLORS.indigo, 1);
    g.fillEllipse(0, 0, w, h).strokeEllipse(0, 0, w, h);
    g.fillCircle(-w * 0.38, h * 0.55, 16).strokeCircle(-w * 0.38, h * 0.55, 16);
    g.fillCircle(-w * 0.5, h * 0.8, 9).strokeCircle(-w * 0.5, h * 0.8, 9);
    this.root = scene.add.container(0, 0, [g]).setDepth(L.depth).setVisible(false);
    const track = () => {
      const x = Phaser.Math.Clamp(follow.go.x + L.bubble.dx, w / 2 + 8, TUNING.gameW - w / 2 - 8);
      this.root.setPosition(x, follow.go.y + L.bubble.dy);
    };
    scene.events.on(Phaser.Scenes.Events.UPDATE, track);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, track));
    track();
  }

  set(show: FruitId | '?' | null): void {
    this.content?.destroy();
    this.content = null;
    this.root.setVisible(show !== null);
    if (show === null) return;
    this.content =
      show === '?'
        ? this.scene.add.text(0, 0, '?', { fontFamily: FONT_DISPLAY, fontStyle: '800', fontSize: `${L.bubble.font}px`, color: CSS.indigo }).setOrigin(0.5)
        : fitImage(this.scene.add.image(0, 0, `v2_item_${show}`), L.bubble.pic);
    this.root.add(this.content);
    if (reducedMotion()) return;
    this.root.setScale(0.8);
    this.scene.tweens.add({ targets: this.root, scale: 1, duration: L.bubble.popMs, ease: 'Back.easeOut' });
  }
}
