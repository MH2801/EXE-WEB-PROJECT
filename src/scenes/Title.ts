import Phaser from 'phaser';
import { browserStore, loadSave } from '../core/save';
import { TUNING } from '../content/tuning';
import { Dialogue } from '../view/dialogue';
import { addRotateOverlay, makeButton, makeSpeaker, reducedMotion } from '../view/ui';

export class Title extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    const { gameW, gameH, titleHits: t } = TUNING;
    const vi = loadSave(browserStore()).viSubtitles;
    const speaker = makeSpeaker(this);
    const dialogue = new Dialogue(this);
    this.add.image(gameW / 2, gameH / 2, 'bg_title');

    const hit = (r: { x: number; y: number; w: number; h: number }, onTap: () => void) =>
      makeButton(this, r.x, r.y, { label: '', w: r.w, h: r.h, onTap });
    const soon = (btn: () => Phaser.GameObjects.Container) => () => {
      dialogue.show('mimi.soon', vi);
      if (!reducedMotion()) this.tweens.add({ targets: btn(), y: btn().y - TUNING.hopPx, duration: TUNING.hopMs, yoyo: true });
      void speaker.say('mimi.soon').then(() => dialogue.hide());
    };

    hit(t.start, () => {
      this.sound.unlock?.(); // browsers need a tap before audio plays
      if (typeof speechSynthesis !== 'undefined') {
        try {
          speechSynthesis.getVoices();
          speechSynthesis.speak(new SpeechSynthesisUtterance('')); // wakes iOS speech
        } catch (e) {
          console.error(e);
        }
      }
      this.scene.start('Mission');
    });
    hit(t.memory, () => this.scene.start('Memory'));
    const learn: Phaser.GameObjects.Container = hit(t.learn, soon(() => learn));
    const explore: Phaser.GameObjects.Container = hit(t.explore, soon(() => explore));
    // Small drawn lock in the corner leads to the parent area.
    const lock = makeButton(this, t.lock.x, t.lock.y, { label: '\u{1F512}', w: t.lock.w, h: t.lock.h, onTap: () => this.scene.start('Parent') });
    lock.setAlpha(0.7);
    addRotateOverlay(this);
  }
}
