import Phaser from 'phaser';
import { LABELS } from '../content/lines';
import { TUNING } from '../content/tuning';
import type { BookWord } from '../core/types';
import type { MissionEvent } from '../core/mission';
import { makeButton, reducedMotion } from './ui';

type Obj = Phaser.GameObjects.GameObject & { setVisible(v: boolean): unknown };
type Btn = Phaser.GameObjects.Container;

/**
 * Only the child sees the book (spec 6). The line for a tapped word is a `say` effect of the core, so the
 * view never speaks by itself; `onToggle` tells the scene when to pause or restart the idle clock.
 */
export class MissionBook {
  /** The scene sets this while effects run: a busy tap only skips the current line. */
  locked = false;
  private open = false;
  private state: 'hidden' | 'pulse' | 'idle' = 'hidden';
  private icon: Btn;
  private art: Phaser.GameObjects.Graphics;
  private halo: Phaser.GameObjects.Graphics;
  private pulse: Phaser.Tweens.Tween | null = null;
  private panel: Obj[] = [];

  constructor(private scene: Phaser.Scene, private onEvent: (e: MissionEvent) => void, private onToggle: (open: boolean) => void) {
    const { x, y, size: s, panelX: px, panelY: py, panelW: pw, panelH: ph, cell, closeSize } = TUNING.book;
    this.icon = makeButton(scene, x, y, { label: '', w: s, h: s, onTap: () => this.show() }).setDepth(300);
    this.halo = scene.add.graphics().lineStyle(12, 0xffd23f, 1).strokeCircle(0, 0, s * 0.72).setVisible(false);
    this.art = scene.add.graphics();
    this.art.fillStyle(0xe8884a, 1).fillRoundedRect(-s * 0.4, -s * 0.4, s * 0.8, s * 0.8, 18);
    this.art.fillStyle(0xffffff, 1).fillRoundedRect(-s * 0.3, -s * 0.3, s * 0.6, s * 0.6, 10);
    this.art.fillStyle(0x3aa8ff, 1).fillRect(-s * 0.4, -s * 0.4, s * 0.1, s * 0.8);
    this.icon.addAt(this.halo, 0).addAt(this.art, 1);

    const veil = scene.add.rectangle(TUNING.gameW / 2, TUNING.gameH / 2, TUNING.gameW, TUNING.gameH, 0x16324f, 0.45).setDepth(398).setInteractive();
    veil.on('pointerdown', () => this.hide()); // taps outside the book close it and never reach the stalls
    const card = scene.add.graphics().setDepth(399);
    card.fillStyle(0xe8f6ff, 1).fillRoundedRect(px - pw / 2, py - ph / 2, pw, ph, 40);
    card.lineStyle(8, 0x3aa8ff, 1).strokeRoundedRect(px - pw / 2, py - ph / 2, pw, ph, 40);
    this.panel.push(veil, card);

    const word = (dx: number, w: BookWord, draw: (c: Btn) => void) => {
      const b = makeButton(scene, px + dx, py + 20, { label: '', w: cell, h: cell, onTap: () => this.word(w) }).setDepth(401);
      const g = scene.add.graphics().fillStyle(0xffffff, 1).fillRoundedRect(-cell / 2, -cell / 2, cell, cell, 28);
      g.lineStyle(6, 0x3aa8ff, 1).strokeRoundedRect(-cell / 2, -cell / 2, cell, cell, 28);
      b.addAt(g, 0);
      draw(b);
      this.panel.push(b);
    };
    const gap = cell + 60;
    word(-gap, 'apple', (b) => b.add(scene.add.text(0, 0, LABELS.apple, { fontFamily: 'sans-serif', fontStyle: 'bold', fontSize: '56px', color: '#16324f' }).setOrigin(0.5)));
    word(0, 'red', (b) => b.add(scene.add.rectangle(0, 0, cell * 0.6, cell * 0.6, 0xe53935)));
    word(gap, 'round', (b) => b.add(scene.add.circle(0, 0, cell * 0.3, 0xffb300)));

    const close = makeButton(scene, px + pw / 2 - closeSize / 2 - 10, py - ph / 2 + closeSize / 2 + 10, { label: '', w: closeSize, h: closeSize, onTap: () => this.hide() }).setDepth(401);
    const x0 = closeSize * 0.22;
    close.addAt(scene.add.circle(0, 0, closeSize / 2 - 10, 0xd9534f), 0);
    close.add(scene.add.graphics().lineStyle(14, 0xffffff, 1).lineBetween(-x0, -x0, x0, x0).lineBetween(-x0, x0, x0, -x0));
    this.panel.push(close);
    this.setState('hidden');
    this.hide();
  }

  get isOpen(): boolean {
    return this.open;
  }

  setState(s: 'hidden' | 'pulse' | 'idle'): void {
    this.state = s;
    this.pulse?.remove();
    this.pulse = null;
    this.art.setScale(1);
    this.icon.setVisible(s !== 'hidden');
    this.icon.input!.enabled = s !== 'hidden';
    this.halo.setVisible(s === 'pulse'); // reduced motion keeps this static ring instead of the beat
    if (s === 'pulse' && !reducedMotion()) {
      this.pulse = this.scene.tweens.add({ targets: this.art, scale: TUNING.pulseScale, duration: TUNING.pulseMs, yoyo: true, repeat: -1 });
    }
    if (s === 'hidden') this.hide();
  }

  private show(): void {
    if (this.locked || this.open || this.state === 'hidden') return;
    this.open = true;
    this.toggle(true);
    this.onToggle(true);
    this.onEvent({ t: 'bookOpen' }); // every open is sent (spec 6, the first open is Mimi's question)
  }

  private hide(): void {
    const was = this.open;
    this.open = false;
    this.toggle(false);
    if (was) this.onToggle(false);
  }

  private word(w: BookWord): void {
    if (this.locked) return;
    this.onEvent({ t: 'bookWord', word: w });
  }

  private toggle(on: boolean): void {
    for (const o of this.panel) {
      o.setVisible(on);
      if (o.input) o.input.enabled = on;
    }
  }
}
