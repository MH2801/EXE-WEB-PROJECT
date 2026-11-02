import Phaser from 'phaser';
import { LABELS, wordLine } from '../content/lines';
import { TUNING } from '../content/tuning';
import { WORDS } from '../content/words';
import { knownWords } from '../core/knowledge';
import { browserStore } from '../core/save';
import type { TripSummary } from '../core/trip';
import { loadTripSave, markSeen, needsNudge, writeTripSave, type OnboardingStep } from '../core/tripSave';
import type { WordId } from '../core/types';
import { Mimi } from '../view/actors';
import { Nudge } from '../view/nudge';
import { playSfx } from '../view/sfx';
import { COLORS, CSS, FONT_DISPLAY } from '../view/theme';
import { addRotateOverlay, drawLeaf, ensureIcons, fitImage, inviteLoop, makeClayButton, makeSpeaker, reducedMotion } from '../view/ui';

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
    // Addendum 5.4: Home writes a step's mark itself; Trip loads the save again when it starts.
    const mark = (step: OnboardingStep): void => {
      if (needsNudge(save, step)) writeTripSave(browserStore(), markSeen(save, step));
    };
    if (summary) {
      if (knownWords(save.brain).length < WORDS.length) this.ajarDoor();
      if (fresh) this.time.delayedCall(H.light.delayMs, () => this.firstLight(fresh, lit, shelf, mimi, speaker));
      // Two equal buttons, Home and Go; nothing runs on by itself. Deliberate exception to the one-Sun rule (ui-ux 2):
      // stopping must be as bright as going on, so the game never leans on the child to continue.
      makeClayButton(this, second.x, second.y, { label: LABELS.home, icon: 'home_house', w: second.w, h: second.h, variant: 'primary', ariaName: 'Home', onTap: () => this.leave(speaker, 'Home') });
    } else {
      const lock = makeClayButton(this, H.lock.x, H.lock.y, { label: '\u{1F512}', w: H.lock.w, h: H.lock.h, variant: 'plain', ariaName: 'Parents', onTap: () => this.leave(speaker, 'Parent', { from: 'Home' }) });
      lock.setAlpha(0.8);
      const book = makeClayButton(this, second.x, second.y, { icon: 'home_book', w: second.w, h: second.h, variant: 'plain', ariaName: 'Word Book', onTap: () => {
        mark('wordBook');
        this.leave(speaker, 'WordBook');
      } });
      // Beat 8: after a trip her new word lives in the Word Book, so its button hops once until it was opened learnAfter times.
      if (save.trips > 0 && needsNudge(save, 'wordBook') && !reducedMotion()) this.tweens.add({ targets: book, y: book.y - TUNING.hopPx * 2, duration: TUNING.hopMs, yoyo: true, delay: TUNING.onboarding.bookMs });
    }
    const go = makeClayButton(this, H.go.x, H.go.y, { label: LABELS.go, icon: 'home_play', w: H.go.w, h: H.go.h, variant: 'primary', ariaName: 'Go', onTap: () => {
      mark('go');
      this.leave(speaker, 'Trip');
    } });
    // Never on the return screen: there Home and Go stay equal and nothing leans on the child to go on.
    if (!summary && needsNudge(save, 'go')) this.teachGo(go, !save.seen.go && known.has('apple'), lit, mimi, speaker);
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
    this.glow(win);
    const card = drawLeaf(this, word, H.card.x, H.card.y, 'known');
    playSfx('sparkle');
    this.reach(mimi, win.x); // beat 8: she points at the window the child just lit
    if (!reducedMotion()) {
      this.tweens.add({ targets: card, scale: { from: 0.2, to: 1 }, duration: L.popMs, ease: 'Back.easeOut' });
      this.tweens.add({ targets: mimi.go, y: H.mimi.y - TUNING.hopPx * 2, duration: TUNING.hopMs, yoyo: true });
    }
    void speaker.say(wordLine('book', word)); // the sixth hearing, once (GDD 11)
  }

  /** A window pops in a ring of rays: its first light, or the window Mimi shows off on the first visit. */
  private glow(win: Phaser.GameObjects.Container): void {
    const L = H.light;
    const rays = this.add.graphics({ x: win.x, y: win.y }).lineStyle(8, COLORS.sun, 1);
    for (let k = 0; k < L.rays; k++) {
      const a = (k / L.rays) * Math.PI * 2;
      rays.lineBetween(Math.cos(a) * L.rayInner, Math.sin(a) * L.rayInner, Math.cos(a) * L.rayOuter, Math.sin(a) * L.rayOuter);
    }
    if (reducedMotion()) return void rays.destroy();
    this.tweens.add({ targets: win, scale: L.popScale, duration: L.popMs / 2, yoyo: true });
    this.tweens.add({ targets: rays, alpha: 0, duration: L.rayMs, onComplete: () => rays.destroy() });
  }

  /** Mimi leans toward what she shows, holds, and comes back. */
  private reach(mimi: Mimi, x: number): void {
    const r = TUNING.onboarding.reach;
    if (!reducedMotion()) this.tweens.add({ targets: mimi.body, angle: Math.sign(x - mimi.go.x) * r.deg, duration: r.ms, yoyo: true, hold: r.holdMs });
  }

  /**
   * Beat 2 (addendum 5.4). First visit: Mimi taps the window she knows and says so (model, then do). Then Go hops; idle brings the hand, then her cue.
   * Go is live the whole time and its tap ends all of it (R6); every timer and tween dies with the scene.
   */
  private teachGo(go: Phaser.GameObjects.Container, first: boolean, lit: Phaser.GameObjects.Container[], mimi: Mimi, speaker: Speaker): void {
    const O = TUNING.onboarding;
    if (first) {
      const win = lit[WORDS.findIndex((d) => d.id === 'apple')]!;
      this.time.delayedCall(O.appleMs, () => {
        this.reach(mimi, win.x);
        playSfx('pop');
        this.glow(win);
        void speaker.say('mimi.apple_know');
      });
    }
    this.time.delayedCall(first ? O.appleMs + O.goAfterMs : 0, () => {
      // top = Go's centre, so the reduced-motion star sits on Go's own face, where the nudge star goes, clear of the Word Book button above.
      inviteLoop(this, [{ objs: [go], x: go.x, top: go.y }]);
      const nudge = new Nudge(this);
      this.input.on('pointerdown', () => nudge.poke());
      nudge.start([{ x: go.x, y: go.y }], 'mimi.tap_here', (id) => {
        if (!reducedMotion()) this.tweens.add({ targets: mimi.body, y: -TUNING.hopPx, duration: TUNING.hopMs, yoyo: true });
        void speaker.say(id);
      });
    });
  }
}
