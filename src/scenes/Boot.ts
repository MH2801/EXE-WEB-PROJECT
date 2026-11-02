import Phaser from 'phaser';
import { TUNING } from '../content/tuning';
import { startMusic, loadMusic } from '../view/music';
import { hideLanding, onEnter, ready, showProgress } from '../landing';
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
  'mom', 'robot', 'cashier', 'helper', 'door', 'chest', 'gate', 'cart', 'home', 'dusk', 'hand',
];

const DAY1 = new URLSearchParams(location.search).has('day1');

export class Boot extends Phaser.Scene {
  private finished = false; // placeholders made and the font wait started (once)
  private open = false; // fonts settled: a stored tap may enter
  private target: 'Home' | 'WordBook' | 'Parent' | null = null;

  constructor() {
    super('Boot');
  }

  init(): void {
    if (DAY1) {
      hideLanding();
      return;
    }
    onEnter((t) => {
      try {
        startMusic(this.game); // the tap is the user gesture browsers need: resumes the sound context, starts the music
      } catch (e) {
        console.error(e);
      }
      this.target = t;
      if (this.open) this.go();
    });
    // Entry never depends on the loader past the limit: drop what is still loading, placeholder what is missing.
    setTimeout(() => {
      ready();
      if (this.finished) return;
      for (const f of [...this.load.list, ...this.load.inflight]) {
        const x = (f as unknown as { xhrLoader?: XMLHttpRequest | null }).xhrLoader;
        if (x) {
          x.onload = x.onerror = x.onprogress = x.ontimeout = null; // a late arrival must not reach the loader
          x.abort();
        }
      }
      this.load.reset();
      this.finish();
    }, Math.max(0, TUNING.landing.maxWaitMs - performance.now()));
  }

  preload(): void {
    this.load.on('progress', (p: number) => showProgress(p));
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
    this.finish();
  }

  private finish(): void {
    if (this.finished) return; // create() after a cut, or a cut after create()
    this.finished = true;
    if (!DAY1) loadMusic(this.game); // after the art, so it cannot slow the buttons; a late file just starts late
    // A file that downloads but cannot decode fires no loaderror; a cut leaves files unloaded.
    for (const k of [...IMAGES, ...V2_SVGS.map((v) => `v2_${v}`)]) if (!this.textures.exists(k)) this.placeholder(k);
    // The probe text spans both unicode-range subsets; the default space would leave the Vietnamese files unloaded.
    const fonts = [FONT_DISPLAY, FONT_BODY].flatMap((f) => [700, 800].map((w) => document.fonts.load(`${w} 40px ${f}`, 'Aạ')));
    const limit = new Promise((done) => setTimeout(done, TUNING.fontWaitMs));
    const done = () => {
      if (DAY1) return this.scene.start('Title');
      this.open = true;
      ready();
      this.go(); // a tap stored while fonts were settling
    };
    Promise.race([Promise.all(fonts), limit]).then(done, done); // a late or failed font never blocks entry
  }

  private go(): void {
    if (this.target) {
      const t = this.target;
      this.target = null;
      hideLanding();
      this.scene.start(t, t === 'Parent' ? { from: 'Home' } : undefined);
    }
  }
}
