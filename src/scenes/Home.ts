import Phaser from 'phaser';
import { TUNING } from '../content/tuning';

export class Home extends Phaser.Scene {
  constructor() {
    super('Home');
  }

  create(): void {
    const { gameW: w, gameH: h } = TUNING;
    this.add.rectangle(w / 2, h / 2, w, h, 0xfff4dc);
    this.add.text(w / 2, h / 2, 'Home', { fontSize: '64px', color: '#333333' }).setOrigin(0.5);
  }
}
