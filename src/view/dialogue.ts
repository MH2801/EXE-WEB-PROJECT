import Phaser from 'phaser';
import { LINES, type LineId } from '../content/lines';
import { TUNING } from '../content/tuning';

const STYLE = { fontFamily: 'sans-serif', fontStyle: 'bold' };

export class Dialogue {
  onTap: (() => void) | null = null;
  private box: Phaser.GameObjects.Container;
  private en: Phaser.GameObjects.Text;
  private vi: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, at: { x: number; y: number; w?: number } = TUNING.dialogue) {
    const { x, y } = at;
    const { h, enPx } = TUNING.dialogue;
    const w = at.w ?? TUNING.dialogue.w;
    const g = scene.add.graphics();
    g.fillStyle(0xe8f6ff, 0.96).fillRoundedRect(-w / 2, -h / 2, w, h, 36);
    g.lineStyle(8, 0x3aa8ff, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 36);
    this.en = scene.add.text(0, -h * 0.12, '', { ...STYLE, fontSize: `${enPx}px`, color: '#16324f', align: 'center', wordWrap: { width: w - 80 } }).setOrigin(0.5);
    this.vi = scene.add.text(0, h * 0.28, '', { ...STYLE, fontSize: '34px', color: '#4a6a85', align: 'center', wordWrap: { width: w - 80 } }).setOrigin(0.5);
    this.box = scene.add.container(x, y, [g, this.en, this.vi]).setSize(w, h).setDepth(500).setVisible(false);
    this.box.setInteractive().on('pointerdown', () => this.onTap?.());
    this.box.input!.enabled = false;
  }

  show(id: LineId, viSubtitles: boolean): void {
    const { h, enPx, enWrapPx } = TUNING.dialogue;
    this.en.setFontSize(enPx).setText(LINES[id].en);
    const wrapped = this.en.getWrappedText().length > 1;
    if (wrapped) this.en.setFontSize(enWrapPx); // two lines must stay inside the box, clear of the subtitle
    this.en.setY(wrapped ? -h * 0.2 : -h * 0.12);
    this.vi.setY(wrapped ? h * 0.3 : h * 0.28);
    this.vi.setText(viSubtitles ? LINES[id].vi : '');
    this.box.setVisible(true);
    this.box.input!.enabled = true;
  }

  hide(): void {
    this.box.setVisible(false);
    this.box.input!.enabled = false;
  }
}
