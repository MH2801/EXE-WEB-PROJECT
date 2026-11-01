import Phaser from 'phaser';
import { TUNING } from '../content/tuning';
import { FONT_BODY, FONT_DISPLAY } from '../view/theme';

const IMAGES = [
  'bg_title', 'bg_market', 'bg_memory', 'bg_fruit_empty', 'idea_bubble', 'mom', 'npc',
  'mimi_idle', 'mimi_happy', 'mimi_think', 'mimi_puzzled', 'mimi_surprised',
  'stall_apple', 'stall_banana', 'stall_grape', 'stall_lemon', 'stall_orange',
  'fruit_apple', 'fruit_banana', 'fruit_grape', 'fruit_lemon', 'fruit_orange',
  'fg_banner', 'fg_bush', 'fg_emblem', 'fg_leaf_a', 'fg_leaf_b', 'fg_planter',
];

const V2_SVGS = [
  'mimi_idle', 'mimi_happy', 'mimi_think', 'mimi_puzzled', 'mimi_surprised', 'mimi_sleep',
  'item_apple', 'item_banana', 'item_orange', 'item_lemon', 'item_grape',
  'mom', 'robot', 'cashier', 'helper', 'door', 'chest', 'gate', 'cart', 'home', 'dusk',
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
    this.load.on('loaderror', (file: Phaser.Loader.File) => this.placeholder(file.key));
    this.load.setPath(import.meta.env.BASE_URL + 'assets');
    for (const k of IMAGES) this.load.image(k, `${k}.webp`);
    this.load.setPath(import.meta.env.BASE_URL + 'assets/v2');
    for (const k of V2_SVGS) this.load.svg(`v2_${k}`, `${k}.svg`);
  }

  private placeholder(key: string): void {
    console.error(`missing asset: ${key}`);
    const g = this.add.graphics().fillStyle(0xcccccc, 1).fillRect(0, 0, 160, 160);
    g.generateTexture(key, 160, 160); // same key, so scenes still run
    g.destroy();
  }

  create(): void {
    // A file that downloads but cannot decode fires no loaderror.
    for (const k of V2_SVGS) if (!this.textures.exists(`v2_${k}`)) this.placeholder(`v2_${k}`);
    const enter = () => this.scene.start(new URLSearchParams(location.search).has('day1') ? 'Title' : 'Home');
    // The probe text spans both unicode-range subsets; the default space would leave the Vietnamese files unloaded.
    const fonts = [FONT_DISPLAY, FONT_BODY].flatMap((f) => [700, 800].map((w) => document.fonts.load(`${w} 40px ${f}`, 'Aạ')));
    const limit = new Promise((done) => setTimeout(done, TUNING.fontWaitMs));
    Promise.race([Promise.all(fonts), limit]).then(enter, enter); // a late or failed font never blocks entry
  }
}
