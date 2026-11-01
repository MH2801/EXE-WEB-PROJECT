import Phaser from 'phaser';
import { buildReport } from '../core/report';
import { browserStore, clearSave, loadSave, writeSave } from '../core/save';
import { PARENT } from '../content/lines';
import { TUNING } from '../content/tuning';
import { addRotateOverlay, makeButton, makeSpeaker } from '../view/ui';

const INK = '#16324f'; // on #fff4dc: about 11:1
const FONT = 'Arial, sans-serif'; // renders Vietnamese diacritics

export class Parent extends Phaser.Scene {
  private page: Phaser.GameObjects.GameObject[] = [];
  private depth = 0;

  constructor() {
    super('Parent');
  }

  create(): void {
    makeSpeaker(this); // so SHUTDOWN skips any speech still running
    this.page = [];
    this.depth = 0;
    this.cameras.main.setBackgroundColor('#FFF4DC');
    this.showGate();
    addRotateOverlay(this);
  }

  private text(x: number, y: number, s: string, size: number, style: Phaser.Types.GameObjects.Text.TextStyle = {}) {
    const t = this.add.text(x, y, s, { fontFamily: FONT, fontSize: `${size}px`, color: INK, ...style });
    this.page.push(t);
    return t;
  }

  /** Light button, dark text; makeButton supplies the 120 px hit area and the press flash. */
  private btn(x: number, y: number, w: number, h: number, label: string, size: number, onTap: () => void): void {
    const W = Math.max(w, TUNING.minHitPx);
    const H = Math.max(h, TUNING.minHitPx);
    const g = this.add.graphics().fillStyle(0xffffff, 1).fillRoundedRect(x - W / 2, y - H / 2, W, H, 28).lineStyle(6, 0x16324f, 1).strokeRoundedRect(x - W / 2, y - H / 2, W, H, 28);
    const t = this.add.text(x, y, label, { fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color: INK, align: 'center', wordWrap: { width: W - 20 } }).setOrigin(0.5);
    const b = makeButton(this, x, y, { label: '', w: W, h: H, onTap });
    for (const o of [g, t, b]) {
      o.setDepth(this.depth);
      this.page.push(o);
    }
  }

  private clear(): void {
    this.page.forEach((o) => o.destroy());
    this.page = [];
  }

  private backBtn(): void {
    const p = TUNING.parent;
    this.btn(p.back.x, p.back.y, p.back.w, p.back.h, PARENT.back, p.btnFont, () => this.scene.start('Title'));
  }

  private showGate(): void {
    this.clear();
    const p = TUNING.parent;
    const cx = TUNING.gameW / 2;
    const a = Phaser.Math.Between(p.gateMin, p.gateMax);
    const b = Phaser.Math.Between(p.gateMin, p.gateMax);
    const right = a * b;
    const near = [...new Set([right + a, right - a, right + b, right - b, right + 10, right - 10])].filter((n) => n !== right && n > 0);
    const answers = Phaser.Utils.Array.Shuffle([right, ...Phaser.Utils.Array.Shuffle(near).slice(0, 2)]);
    this.backBtn();
    this.text(cx, p.gateAskY, PARENT.gateAsk, p.gateAskFont).setOrigin(0.5);
    this.text(cx, p.gateQY, `${a} × ${b} = ?`, p.gateQFont, { fontStyle: 'bold' }).setOrigin(0.5);
    answers.forEach((n, i) =>
      // Wrong answer: silently a new question. No sound, no message, no lock.
      this.btn(cx + (i - 1) * p.gateGap, p.gateY, p.gateW, p.gateH, String(n), p.gateFont, () => (n === right ? this.showReport() : this.showGate())),
    );
  }

  private showReport(): void {
    this.clear();
    const p = TUNING.parent;
    const save = loadSave(browserStore());
    this.backBtn();
    this.text(p.title.x, p.title.y, PARENT.title, p.title.font, { fontStyle: 'bold' }).setOrigin(0.5);
    this.btn(p.toggle.x, p.toggle.y, p.toggle.w, p.toggle.h, save.viSubtitles ? PARENT.subOn : PARENT.subOff, p.btnFont, () => {
      writeSave(browserStore(), { ...save, viSubtitles: !save.viSubtitles });
      this.showReport();
    });
    this.btn(p.reset.x, p.reset.y, p.reset.w, p.reset.h, PARENT.reset, p.btnFont, () => this.confirmReset());
    buildReport(save).forEach((r, i) => {
      const y = p.rowsY + i * p.rowStep;
      this.text(p.rowX, y, r.label, p.labelFont, { fontStyle: 'bold', color: '#3a5a75' }); // 6.7:1 on the cream
      this.text(p.rowX, y + 38, r.value, p.valueFont, { wordWrap: { width: p.wrapW } });
    });
    this.text(p.rowX, p.noteY, PARENT.disclaimer, p.noteFont, { wordWrap: { width: p.noteWrap } });
  }

  private confirmReset(): void {
    const c = TUNING.parent.confirm;
    const { gameW, gameH } = TUNING;
    const mark = this.page.length;
    const shade = this.add.rectangle(gameW / 2, gameH / 2, gameW, gameH, 0x16324f, 0.7).setDepth(10).setInteractive(); // eats taps
    const box = this.add.rectangle(gameW / 2, gameH / 2, c.w, c.h, 0xffffff).setDepth(11).setStrokeStyle(6, 0x16324f);
    const ask = this.add.text(gameW / 2, gameH / 2 - 90, PARENT.resetAsk, { fontFamily: FONT, fontSize: `${c.askFont}px`, fontStyle: 'bold', color: INK, align: 'center', wordWrap: { width: c.w - 100 } }).setOrigin(0.5).setDepth(12);
    this.page.push(shade, box, ask);
    this.depth = 13;
    const close = () => {
      this.depth = 0;
      this.page.splice(mark).forEach((o) => o.destroy());
    };
    this.btn(gameW / 2 - c.btnGap, c.btnY, c.btnW, TUNING.minHitPx, PARENT.resetYes, TUNING.parent.btnFont, () => {
      clearSave(browserStore());
      this.depth = 0;
      this.showReport();
    });
    this.btn(gameW / 2 + c.btnGap, c.btnY, c.btnW, TUNING.minHitPx, PARENT.resetNo, TUNING.parent.btnFont, close);
  }
}
