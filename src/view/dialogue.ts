import Phaser from 'phaser';
import { LINES, type LineId } from '../content/lines';
import { TUNING } from '../content/tuning';

const STYLE = { fontFamily: 'sans-serif', fontStyle: 'bold' };

export class Dialogue {
  onTap: (() => void) | null = null;
  private box: Phaser.GameObjects.Container;
  private en: Phaser.GameObjects.Text;
  private vi: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const { x, y, w, h } = TUNING.dialogue;
    const g = scene.add.graphics();
    g.fillStyle(0xe8f6ff, 0.96).fillRoundedRect(-w / 2, -h / 2, w, h, 36);
    g.lineStyle(8, 0x3aa8ff, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 36);
    this.en = scene.add.text(0, -h * 0.12, '', { ...STYLE, fontSize: '56px', color: '#16324f', align: 'center', wordWrap: { width: w - 80 } }).setOrigin(0.5);
    this.vi = scene.add.text(0, h * 0.28, '', { ...STYLE, fontSize: '34px', color: '#4a6a85', align: 'center', wordWrap: { width: w - 80 } }).setOrigin(0.5);
    this.box = scene.add.container(x, y, [g, this.en, this.vi]).setSize(w, h).setDepth(500).setVisible(false);
    this.box.setInteractive().on('pointerdown', () => this.onTap?.());
    this.box.input!.enabled = false;
  }

  show(id: LineId, viSubtitles: boolean): void {
    this.en.setText(LINES[id].en);
    this.vi.setText(viSubtitles ? LINES[id].vi : '');
    this.box.setVisible(true);
    this.box.input!.enabled = true;
  }

  hide(): void {
    this.box.setVisible(false);
    this.box.input!.enabled = false;
  }
}
