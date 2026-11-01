import Phaser from 'phaser';
import { LABELS, wordLine } from '../content/lines';
import { TUNING } from '../content/tuning';
import { WORDS } from '../content/words';
import { knownWords } from '../core/knowledge';
import { browserStore } from '../core/save';
import type { TripSummary } from '../core/trip';
import { loadTripSave } from '../core/tripSave';
import type { WordId } from '../core/types';
import { Mimi } from '../view/actors';
import { playSfx } from '../view/sfx';
import { COLORS, CSS, FONT_DISPLAY } from '../view/theme';
import { addRotateOverlay, fitImage, makeClayButton, makeSpeaker, reducedMotion } from '../view/ui';
import { drawLeaf, ensureIcons } from './WordBook';

const H = TUNING.home;
type Speaker = ReturnType<typeof makeSpeaker>;
type Shelf = { obj: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics; name: Phaser.GameObjects.Text };
const label = (s: Phaser.Scene, x: number, y: number, t: string, px: number) =>
  s.add.text(x, y, t, { fontFamily: FONT_DISPLAY, fontStyle: '800', fontSize: `${px}px`, color: CSS.indigo }).setOrigin(0.5);

export class Home extends Phaser.Scene {
  constructor() {
    super('Home');
  }

  /** Home ends every trip. `summary` is set when a trip just finished: then it is the return screen (spec 11). */
  create(data?: { summary?: TripSummary }): void {
    const { gameW: w, gameH: h } = TUNING;
    const summary = data?.summary;
    const save = loadTripSave(browserStore());
    const speaker = makeSpeaker(this);
    ensureIcons(this);
    // Only a word Mimi really took in earns a card and a first light; a refused word stays dark (summary.learned).
    const fresh = summary?.learned ? summary.newWord : null;
    const known = new Set(knownWords(save.brain));
    if (fresh) known.delete(fresh);

    this.add.image(w / 2, h / 2, 'v2_home');
    for (const p of H.panels) this.add.rectangle(p.x, p.y, p.w, p.h, p.fill);

    // One window and one shelf object per word: lit when Mimi knows the word, dark when not.
    const lit: Phaser.GameObjects.Container[] = [];
    const shelf: Shelf[] = [];
    this.add.rectangle(H.shelf.plankX, H.shelf.plankY, H.shelf.plankW, H.shelf.plankH, COLORS.indigo);
    WORDS.forEach((d, i) => {
      const r = H.windows[i]!;
      const off = this.add.graphics().fillStyle(H.windowOff, 1).fillRoundedRect(-r.w / 2, -r.h / 2, r.w, r.h, 16).lineStyle(4, H.windowOffEdge, 1).strokeRoundedRect(-r.w / 2, -r.h / 2, r.w, r.h, 16);
      const on = this.add.graphics().fillStyle(COLORS.sun, 1).fillRoundedRect(-r.w / 2, -r.h / 2, r.w, r.h, 16).lineStyle(4, COLORS.indigo, 1).strokeRoundedRect(-r.w / 2, -r.h / 2, r.w, r.h, 16);
      lit.push(this.add.container(r.x, r.y, [off, on.setAlpha(known.has(d.id) ? 1 : 0)]));
      const sx = H.shelf.x0 + i * H.shelf.step;
      const obj =
        d.kind === 'fruit'
          ? fitImage(this.add.image(sx, H.shelf.itemY, `v2_item_${d.id}`), H.shelf.itemPx)
          : this.add.graphics().fillStyle(TUNING.trip.layout.swatch[d.id as 'red' | 'yellow' | 'green'], 1).lineStyle(5, COLORS.indigo, 1).fillCircle(sx, H.shelf.itemY, H.shelf.itemPx / 2.2).strokeCircle(sx, H.shelf.itemY, H.shelf.itemPx / 2.2);
      shelf.push({ obj, name: label(this, sx, H.shelf.labelY, d.id, H.shelf.labelFont) });
      if (!known.has(d.id)) this.dimShelf(shelf[i]!, true);
    });

    const mimi = new Mimi(this, H.mimi.x, H.mimi.y, 'v2_mimi');
    mimi.go.setScale(H.mimi.scale);
    mimi.pose(summary?.outcome === 'asleep' ? 'sleep' : summary ? 'happy' : 'idle');
    if (summary?.outcome === 'asleep') {
      // Spec 7: Mimi wakes up on Home and ends smiling. No words, no look of losing.
      this.time.delayedCall(H.mimi.wakeMs, () => {
        mimi.pose('happy');
        if (!reducedMotion()) this.tweens.add({ targets: mimi.go, y: H.mimi.y - TUNING.hopPx * 2, duration: TUNING.hopMs, yoyo: true });
      });
    }

    if (save.gears > 0) {
      const g = H.gears;
      fitImage(this.add.image(g.right - g.icon, g.y, 'home_gear'), g.icon * 2);
      label(this, g.right - g.icon * 2 - 12, g.y, String(save.gears), g.font).setOrigin(1, 0.5);
      if (summary && summary.gears > 0) {
        const gain = label(this, g.right - g.icon, g.y + g.gainDy, `+${summary.gears}`, g.gainFont);
        if (!reducedMotion()) this.tweens.add({ targets: gain, scale: TUNING.trip.layout.gears.bounce, duration: TUNING.trip.layout.gears.bounceMs, yoyo: true });
      }
    }

    const second = H.second;
    if (summary) {
      if (knownWords(save.brain).length < WORDS.length) this.ajarDoor();
      if (fresh) this.time.delayedCall(H.light.delayMs, () => this.firstLight(fresh, lit, shelf, mimi, speaker));
      // Two equal buttons, Home and Go; nothing runs on by itself.
      makeClayButton(this, second.x, second.y, { icon: 'home_house', w: second.w, h: second.h, variant: 'primary', ariaName: 'Home', onTap: () => this.leave(speaker, 'Home') });
    } else {
      const lock = makeClayButton(this, H.lock.x, H.lock.y, { label: '\u{1F512}', w: H.lock.w, h: H.lock.h, variant: 'plain', ariaName: 'Parents', onTap: () => this.leave(speaker, 'Parent', { from: 'Home' }) });
      lock.setAlpha(0.8);
      makeClayButton(this, second.x, second.y, { icon: 'home_book', w: second.w, h: second.h, variant: 'plain', ariaName: 'Word Book', onTap: () => this.leave(speaker, 'WordBook') });
    }
    makeClayButton(this, H.go.x, H.go.y, { label: LABELS.go, icon: 'home_play', w: H.go.w, h: H.go.h, variant: 'primary', ariaName: 'Go', onTap: () => this.leave(speaker, 'Trip') });
    addRotateOverlay(this);
  }

  private leave(speaker: Speaker, to: string, data?: object): void {
    speaker.skip();
    this.scene.start(to, data);
  }

  private dimShelf(s: Shelf, dim: boolean): void {
    if (s.obj instanceof Phaser.GameObjects.Image) {
      if (dim) s.obj.setTint(COLORS.indigo);
      else s.obj.clearTint();
    }
    s.obj.setAlpha(dim ? H.shelf.dimAlpha : 1);
    s.name.setVisible(!dim); // an unknown word shows only a dark shape, no name
  }

  /** The door left ajar with a "?" because there is still a word to learn. */
  private ajarDoor(): void {
    const d = H.door;
    const s = d.px / 420; // door.svg is 300x420
    this.add.ellipse(d.x, d.y - d.px * 0.45, d.px * 0.95, d.px * 1.15, COLORS.sun, 0.45);
    this.add.image(d.x, d.y, 'v2_door').setOrigin(0.5, 1).setScale(s);
    label(this, d.x, d.y - 270 * s, '?', d.q);
  }

  /** The first time a window lights: pop, rays, the shelf object appears, the card shows and the word is read once. */
  private firstLight(word: WordId, lit: Phaser.GameObjects.Container[], shelf: Shelf[], mimi: Mimi, speaker: Speaker): void {
    const i = WORDS.findIndex((d) => d.id === word);
    const win = lit[i]!;
    const L = H.light;
    (win.list[1] as Phaser.GameObjects.Graphics).setAlpha(1);
    this.dimShelf(shelf[i]!, false);
    const rays = this.add.graphics({ x: win.x, y: win.y }).lineStyle(8, COLORS.sun, 1);
    for (let k = 0; k < L.rays; k++) {
      const a = (k / L.rays) * Math.PI * 2;
      rays.lineBetween(Math.cos(a) * L.rayInner, Math.sin(a) * L.rayInner, Math.cos(a) * L.rayOuter, Math.sin(a) * L.rayOuter);
    }
    const card = drawLeaf(this, word, H.card.x, H.card.y, 'known');
    playSfx('sparkle');
    if (reducedMotion()) {
      rays.destroy();
    } else {
      this.tweens.add({ targets: win, scale: L.popScale, duration: L.popMs / 2, yoyo: true });
      this.tweens.add({ targets: rays, alpha: 0, duration: L.rayMs, onComplete: () => rays.destroy() });
      this.tweens.add({ targets: card, scale: { from: 0.2, to: 1 }, duration: L.popMs, ease: 'Back.easeOut' });
      this.tweens.add({ targets: mimi.go, y: H.mimi.y - TUNING.hopPx * 2, duration: TUNING.hopMs, yoyo: true });
    }
    void speaker.say(wordLine('book', word)); // the sixth hearing, once (GDD 11)
  }
}
