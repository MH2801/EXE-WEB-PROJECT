import Phaser from 'phaser';
import { browserStore, loadSave } from '../core/save';
import { MEMORY } from '../content/lines';
import { TUNING } from '../content/tuning';
import { Dialogue } from '../view/dialogue';
import { addRotateOverlay, makeButton, makeSpeaker, reducedMotion } from '../view/ui';

const PANEL = 0xeaf5ff;

export class Memory extends Phaser.Scene {
  constructor() {
    super('Memory');
  }

  // The core was told everything before goMemory (save written, last effect): this scene sends it nothing.
  create(data: { reveal?: boolean }): void {
    const { gameW, gameH, memory: m } = TUNING;
    const save = loadSave(browserStore());
    const learned = save.knowledge.apple === 'learned';
    const speaker = makeSpeaker(this); // skips its speech on SHUTDOWN
    const dialogue = new Dialogue(this);
    let left = false;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => (left = true));
    this.add.image(gameW / 2, gameH / 2, 'bg_memory');

    const cover = (r: { x: number; y: number; w: number; h: number }) => this.add.rectangle(r.x, r.y, r.w, r.h, PANEL);
    const text = (x: number, y: number, s: string, size: number) =>
      this.add.text(x, y, s, { fontFamily: 'sans-serif', fontSize: `${size}px`, fontStyle: 'bold', color: '#16324f' }).setOrigin(0.5);
    cover(m.pill);
    text(m.pill.x, m.pill.y, MEMORY.title, m.pill.font);

    makeButton(this, m.back.x, m.back.y, { label: '', w: m.back.w, h: m.back.h, onTap: () => this.scene.start('Title') });

    if (learned) {
      const appleH = this.textures.get('fruit_apple').getSourceImage().height;
      cover(m.head);
      text(m.head.x, m.head.y, MEMORY.remembered, m.head.font);
      cover(m.sub);
      this.add.image(m.sub.x, m.sub.y, 'fruit_apple').setScale(m.subFruitPx / appleH);

      const c = m.cell1;
      this.add.rectangle(c.x, c.y, c.w, c.h, 0xffffff);
      const glow = this.add.rectangle(c.x, c.y, c.w + 16, c.h + 16, 0xffe066, 0).setStrokeStyle(10, 0xffb300);
      const base = m.fruitPx / appleH;
      const apple = this.add.image(c.x, c.y, 'fruit_apple').setScale(base);
      const say = (id: 'book.apple' | 'mimi.remember' | 'mimi.next') => {
        dialogue.show(id, save.viSubtitles);
        return speaker.say(id).then(() => {
          if (!left) dialogue.hide();
        });
      };
      makeButton(this, c.x, c.y, { label: '', w: c.w, h: c.h, onTap: () => void say('book.apple') });

      if (data?.reveal) {
        // Waits are on the scene clock, not on tween completion, so nothing can hang.
        const still = reducedMotion();
        glow.setStrokeStyle(10, 0xffb300).setFillStyle(0xffe066, 0.5);
        if (!still) {
          apple.setScale(0);
          this.tweens.add({ targets: apple, scale: base, duration: m.popMs, ease: 'Back.Out' });
          this.tweens.add({ targets: glow, alpha: 0.3, duration: m.glowMs, yoyo: true, repeat: m.glowRepeat });
        }
        this.time.delayedCall(still ? 0 : m.popMs, () => {
          void say('mimi.remember').then(() => {
            if (left) return;
            // Mimi looks at the next, dim cell while she asks what comes next.
            const n = m.cell2;
            const look = this.add.rectangle(n.x, n.y, n.w, n.h, 0xffe066, 0).setStrokeStyle(8, 0xffb300);
            if (!still) this.tweens.add({ targets: look, alpha: 0.4, duration: m.lookMs, yoyo: true, repeat: 1 });
            return say('mimi.next');
          });
        });
      }
    }
    addRotateOverlay(this);
  }
}
