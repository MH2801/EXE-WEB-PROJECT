import Phaser from 'phaser';
import type { Pose } from '../core/mission';
import { TUNING } from '../content/tuning';
import { reducedMotion } from './ui';

export class Mimi {
  readonly go: Phaser.GameObjects.Container;
  private body: Phaser.GameObjects.Image;
  private held: Phaser.GameObjects.Image | null = null;
  private bob: Phaser.Tweens.Tween | null = null;

  constructor(private scene: Phaser.Scene, x: number, y: number) {
    this.body = scene.add.image(0, 0, 'mimi_idle').setOrigin(0.5, 1); // feet at the container origin
    this.go = scene.add.container(x, y, [this.body]);
  }

  pose(p: Pose): void {
    this.body.setTexture(`mimi_${p}`);
  }

  walkTo(x: number, y: number, speed: number): Promise<void> {
    const dist = Phaser.Math.Distance.Between(this.go.x, this.go.y, x, y);
    const duration = Math.max(1, (dist / (TUNING.mimiPxPerSec * speed)) * 1000);
    return new Promise<void>((resolve) => {
      const hop = reducedMotion()
        ? null
        : this.scene.tweens.add({ targets: this.body, y: -TUNING.hopPx, duration: TUNING.hopMs, yoyo: true, repeat: -1 });
      const end = () => {
        hop?.remove();
        this.body.y = 0;
        resolve();
      };
      this.scene.tweens.add({ targets: this.go, x, y, duration, onComplete: end, onStop: end });
    });
  }

  carry(texture: string | null): void {
    this.held?.destroy();
    this.held = null;
    if (texture) {
      this.held = this.scene.add.image(0, -this.body.height * 0.55, texture);
      this.go.add(this.held);
    }
  }

  bobWhileTalking(on: boolean): void {
    this.bob?.remove();
    this.bob = null;
    this.body.y = 0;
    if (on && !reducedMotion()) {
      this.bob = this.scene.tweens.add({ targets: this.body, y: -TUNING.bobPx, duration: TUNING.bobMs, yoyo: true, repeat: -1 });
    }
  }
}
