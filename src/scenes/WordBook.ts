import Phaser from 'phaser';
import { wordLine } from '../content/lines';
import { TUNING } from '../content/tuning';
import { WORDS } from '../content/words';
import { knownWords } from '../core/knowledge';
import { browserStore } from '../core/save';
import { loadTripSave } from '../core/tripSave';
import { Mimi } from '../view/actors';
import { Dialogue } from '../view/dialogue';
import { playSfx } from '../view/sfx';
import { CSS } from '../view/theme';
import { addRotateOverlay, drawLeaf, ensureIcons, makeClayButton, makeSpeaker, reducedMotion, type LeafMode } from '../view/ui';

export class WordBook extends Phaser.Scene {
  constructor() {
    super('WordBook');
  }

  create(): void {
    const B = TUNING.wordBook;
    const { w, h, gapX } = B.leaf;
    const save = loadTripSave(browserStore());
    const known = new Set(knownWords(save.brain));
    const speaker = makeSpeaker(this);
    const dialogue = new Dialogue(this);
    ensureIcons(this);
    this.cameras.main.setBackgroundColor(CSS.sky);
    const x0 = (TUNING.gameW - (4 * w + 3 * gapX)) / 2 + w / 2;
    WORDS.forEach((d, i) => {
      const mode: LeafMode = save.brain[d.id].state === 'strong' ? 'strong' : known.has(d.id) ? 'known' : 'unknown';
      const leaf = drawLeaf(this, d.id, x0 + (i % 4) * (w + gapX), B.leaf.rowY[Math.floor(i / 4)]!, mode).setSize(w, h).setInteractive({ useHandCursor: true });
      leaf.on('pointerdown', () => {
        playSfx('pop');
        if (!reducedMotion()) this.tweens.add({ targets: leaf, scale: TUNING.pressScale, duration: 80, yoyo: true });
        if (mode !== 'unknown') void speaker.say(wordLine('book', d.id)); // a leaf with "?" stays quiet
      });
    });
    makeClayButton(this, B.back.x, B.back.y, {
      icon: 'home_house', w: B.back.w, h: B.back.h, variant: 'plain', ariaName: 'Home',
      onTap: () => {
        speaker.skip();
        this.scene.start('Home');
      },
    });
    const mimi = new Mimi(this, B.mimi.x, B.mimi.y, 'v2_mimi');
    mimi.go.setScale(B.mimi.scale);
    mimi.pose('happy');
    dialogue.show('mimi.next', save.viSubtitles);
    void speaker.say('mimi.next').then(() => this.sys.isActive() && dialogue.hide());
    addRotateOverlay(this);
  }
}
