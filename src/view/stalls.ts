import Phaser from 'phaser';
import layout from '../content/layout.json';
import { TUNING } from '../content/tuning';
import type { FruitId, WrongFruit } from '../core/types';
import { reducedMotion } from './ui';

type Box = { x: number; y: number; w: number; h: number };
const L = (key: string): Box => (layout as Record<string, Box>)[key]!;
const ORDER: FruitId[] = ['lemon', 'apple', 'banana', 'grape', 'orange'];
const FG = ['fg_leaf_a', 'fg_leaf_b', 'fg_banner', 'fg_emblem', 'fg_bush', 'fg_planter'];

type Showable = Phaser.GameObjects.GameObject & { setVisible(v: boolean): unknown };

/** The fruit area: empty background, five stalls with their signs, and the foreground layer (spec 9). */
export class Stalls {
  private all: Showable[] = [];
  private zones = new Map<FruitId, Phaser.GameObjects.Zone>();
  private art = new Map<FruitId, Phaser.GameObjects.Image[]>();
  private marked = new Set<WrongFruit>();
  private enabled = false;
  private shown = false;

  constructor(private scene: Phaser.Scene, onTap: (f: FruitId) => void) {
    const { gameW, gameH } = TUNING;
    this.all.push(scene.add.image(gameW / 2, gameH / 2, 'bg_fruit_empty').setDepth(0));
    ORDER.forEach((f, i) => {
      const s = L(`stall_${f}`);
      const sign = L(`fruit_${f}`);
      const stall = scene.add.image(s.x, s.y, `stall_${f}`).setDepth(10);
      const fruit = scene.add.image(sign.x, sign.y, `fruit_${f}`).setDepth(11);
      this.art.set(f, [stall, fruit]);
      // Stalls overlap in the art, so each hit area stops halfway to its neighbour (spec 9: no overlap).
      const prev = ORDER[i - 1];
      const next = ORDER[i + 1];
      const left = prev ? (L(`stall_${prev}`).x + s.x) / 2 : s.x - s.w / 2;
      const right = next ? (L(`stall_${next}`).x + s.x) / 2 : s.x + s.w / 2;
      const zone = scene.add
        .zone((left + right) / 2, s.y, right - left, s.h)
        .setDepth(12)
        .setInteractive();
      zone.on('pointerdown', () => onTap(f));
      this.zones.set(f, zone);
      this.all.push(stall, fruit, zone);
    });
    for (const k of FG) this.all.push(scene.add.image(L(k).x, L(k).y, k).setDepth(100));
    this.show(false);
  }

  show(on: boolean): void {
    this.shown = on;
    for (const o of this.all) o.setVisible(on);
    this.refresh();
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    this.refresh();
  }

  /** Dim the stall and pin a small shaking Mimi head on it (spec 5.2). */
  mark(f: WrongFruit): void {
    if (this.marked.has(f)) return;
    this.marked.add(f);
    const s = L(`stall_${f}`);
    const t = TUNING.markTag;
    const tag = this.scene.add.image(s.x, s.y - s.h / 2 + t.dy, 'mimi_puzzled').setScale(t.scale).setDepth(13).setVisible(this.shown);
    this.all.push(tag);
    if (!reducedMotion()) this.scene.tweens.add({ targets: tag, angle: t.angle, duration: t.ms, yoyo: true, repeat: t.repeat });
    this.refresh();
  }

  center(f: FruitId): { x: number; y: number } {
    const s = L(`stall_${f}`);
    return { x: s.x, y: s.y };
  }

  private refresh(): void {
    const { stallDimOff, stallDimMarked, stallDimMarkedOff } = TUNING;
    for (const f of ORDER) {
      const m = f !== 'apple' && this.marked.has(f as WrongFruit);
      const alpha = m ? (this.enabled ? stallDimMarked : stallDimMarkedOff) : this.enabled ? 1 : stallDimOff;
      for (const img of this.art.get(f) ?? []) img.setAlpha(alpha);
      this.zones.get(f)!.input!.enabled = this.shown && this.enabled;
    }
  }
}
