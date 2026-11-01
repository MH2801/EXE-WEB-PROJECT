import Phaser from 'phaser';
import { TUNING } from '../content/tuning';

const IMAGES = [
  'bg_title', 'bg_market', 'bg_memory', 'bg_fruit_empty', 'idea_bubble', 'mom', 'npc',
  'mimi_idle', 'mimi_happy', 'mimi_think', 'mimi_puzzled', 'mimi_surprised',
  'stall_apple', 'stall_banana', 'stall_grape', 'stall_lemon', 'stall_orange',
  'fruit_apple', 'fruit_banana', 'fruit_grape', 'fruit_lemon', 'fruit_orange',
  'fg_banner', 'fg_bush', 'fg_emblem', 'fg_leaf_a', 'fg_leaf_b', 'fg_planter',
];

export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    const { gameW: w, gameH: h } = TUNING;
    const bar = this.add.graphics();
    this.load.on('progress', (p: number) => {
      bar.clear().fillStyle(0x3aa8ff, 1).fillRoundedRect(w / 2 - 300, h / 2 - 20, 600 * p, 40, 20);
    });
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error(`missing asset: ${file.key}`);
      const g = this.add.graphics().fillStyle(0xcccccc, 1).fillRect(0, 0, 160, 160);
      g.generateTexture(file.key, 160, 160); // same key, so scenes still run
      g.destroy();
    });
    this.load.setPath(import.meta.env.BASE_URL + 'assets');
    for (const k of IMAGES) this.load.image(k, `${k}.webp`);
  }

  create(): void {
    this.scene.start(new URLSearchParams(location.search).has('day1') ? 'Title' : 'Home');
  }
}
