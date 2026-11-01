import Phaser from 'phaser';
import { LINES, wordLine } from '../content/lines';
import { TUNING } from '../content/tuning';
import { browserStore } from '../core/save';
import { applyTrip, AUTO_PHASES, startTrip, step, type TripEffect, type TripEvent, type TripState } from '../core/trip';
import { loadTripSave, writeTripSave, type TripSave } from '../core/tripSave';
import type { WordId } from '../core/types';
import { Mimi } from '../view/actors';
import { Bubble } from '../view/bubble';
import { Cards } from '../view/cards';
import { Dialogue } from '../view/dialogue';
import { Hud } from '../view/hud';
import { burst, playJoke } from '../view/jokes';
import { RoomView } from '../view/rooms';
import { runEffects, type Handlers } from '../view/runner';
import { playSfx } from '../view/sfx';
import { COLORS, CSS, FONT_DISPLAY } from '../view/theme';
import { addRotateOverlay, fitImage, makeSpeaker, reducedMotion } from '../view/ui';

const V = TUNING.trip.view;
const L = TUNING.trip.layout;
const ENTRY: ReadonlySet<string> = new Set(['gate', 'robot', 'chest']); // rooms whose entry batch may hold one tap (R22)
const noop = (): void => undefined;

/** `?seed=` (an unsigned integer) makes a trip repeatable; otherwise the clock picks one. core/ never reads the clock. */
function pickSeed(): number {
  const s = new URLSearchParams(location.search).get('seed');
  return s !== null && /^\d+$/.test(s) && Number(s) <= 0xffffffff ? Number(s) : Date.now() >>> 0;
}

export class Trip extends Phaser.Scene {
  state?: TripState;
  cards!: Cards; // read by the e2e hook
  rooms!: RoomView; // read by the e2e hook
  private save!: TripSave;
  private busy = false;
  private fresh = false; // true until the microtask after a dispatch, so the tap that started a batch does not skip it
  private left = false;
  private tabHidden = false;
  private mapping = false;
  private fast = false;
  private batch = 0;
  private speaker!: ReturnType<typeof makeSpeaker>;
  private dialogue!: Dialogue;
  private mimi!: Mimi;
  private hud!: Hud;
  private bubble!: Bubble;
  private mapBg!: Phaser.GameObjects.Image;
  private mapPath!: Phaser.GameObjects.Graphics;
  private idleEv: Phaser.Time.TimerEvent | null = null;
  private revealImg: Phaser.GameObjects.Image | null = null;
  private pending: TripEvent | null = null; // one card or chest tap made while a room-entry batch ran (R22)
  private hold = false;

  constructor() {
    super('Trip');
  }

  create(): void {
    // The scene object is reused on restart, so every field is reset here.
    this.busy = this.fresh = this.left = this.tabHidden = this.mapping = this.fast = false;
    this.batch = 0;
    this.idleEv = null;
    this.revealImg = null;
    this.pending = null;
    this.hold = false;
    this.state = undefined;

    const { gameW, gameH } = TUNING;
    this.save = loadTripSave(browserStore());
    this.speaker = makeSpeaker(this);
    this.cameras.main.setBackgroundColor(CSS.indigo);
    this.mapBg = this.add.image(gameW / 2, gameH / 2, 'v2_dusk').setDepth(0).setVisible(false);
    this.mapPath = this.add.graphics().setDepth(5).setVisible(false);
    this.rooms = new RoomView(this, (e) => this.dispatch(e), (w) => this.listenAgain(w));
    this.hud = new Hud(this);
    this.mimi = new Mimi(this, V.mimi.x, V.mimi.y, 'v2_mimi');
    this.mimi.go.setScale(V.mimi.scale).setDepth(V.look.mimiDepth);
    this.bubble = new Bubble(this, this.mimi);
    this.cards = new Cards(this, (word) => this.dispatch({ t: 'tapCard', word }));
    this.dialogue = new Dialogue(this, V.dialogue);
    addRotateOverlay(this);

    this.input.on('pointerdown', this.onPointer, this);
    this.game.events.on(Phaser.Core.Events.HIDDEN, this.onHidden, this);
    this.game.events.on(Phaser.Core.Events.VISIBLE, this.onVisible, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.left = true;
      this.pending = null;
      this.speaker.skip(); // resolves a line in flight; the guarded handlers then do nothing
      this.stopIdle();
      this.input.off('pointerdown', this.onPointer, this);
      this.game.events.off(Phaser.Core.Events.HIDDEN, this.onHidden, this);
      this.game.events.off(Phaser.Core.Events.VISIBLE, this.onVisible, this);
    });

    const r = startTrip(this.save, pickSeed());
    this.state = r.state;
    void this.run(r.effects);
  }

  // ------------------------------------------------------------ event loop

  dispatch(e: TripEvent): void {
    if (this.left || !this.state) return;
    if (this.busy) {
      // A tap during effects skips (onPointer). Only the entry batch of a gate, robot or chest room keeps one card or chest tap; every other batch drops it.
      if (this.hold && (e.t === 'tapCard' || e.t === 'tapChest')) this.pending = e;
      return;
    }
    const before = this.state.phase;
    const r = step(this.state, e);
    this.state = r.state;
    // `effectsDone` that changes nothing would loop forever: stop there.
    if (r.effects.length === 0 && (e.t !== 'effectsDone' || r.state.phase === before)) return;
    void this.run(r.effects, r.state.phase !== before && ENTRY.has(r.state.phase));
  }

  private async run(effects: TripEffect[], hold = false): Promise<void> {
    const batch = ++this.batch;
    this.pending = null;
    this.hold = hold;
    this.setBusy(true);
    this.fresh = true;
    queueMicrotask(() => (this.fresh = false));
    await runEffects(effects, this.handlers);
    if (this.left || batch !== this.batch) return; // stale or finished batch: ignore its late completion
    this.setBusy(false);
    const held = this.pending;
    this.pending = null;
    if (AUTO_PHASES.has(this.state!.phase)) this.dispatch({ t: 'effectsDone' });
    else if (held) this.dispatch(held);
    else this.startIdle();
  }

  private setBusy(b: boolean): void {
    this.busy = b;
    if (b) this.stopIdle();
  }

  /** While busy a tap only skips: it speeds up the map walk or cuts a spoken line. `wait` is never skipped (GDD 6, cashier). */
  private onPointer(): void {
    if (!this.busy) return this.startIdle(); // any tap restarts the count
    if (this.fresh) return;
    if (!this.mapping) return this.speaker.skip();
    if (this.fast) return;
    this.fast = true;
    // The walk and its hop run faster and end by themselves (killTweensOf would skip their onStop and leave the hop running).
    for (const t of [...this.tweens.getTweensOf(this.mimi.go), ...this.tweens.getTweensOf(this.mimi.body)]) t.timeScale = V.mapFast;
  }

  // ------------------------------------------------------------ idle clock (spec 6): only in the "?" room, book open or not

  private startIdle(): void {
    this.stopIdle();
    if (this.state?.phase !== 'teach' || this.busy || this.left) return;
    this.idleEv = this.time.addEvent({
      delay: TUNING.idleMs,
      paused: this.tabHidden,
      callback: () => {
        this.idleEv = null;
        if (!this.busy && this.state?.phase === 'teach') this.dispatch({ t: 'idle' });
      },
    });
  }

  private stopIdle(): void {
    this.idleEv?.remove(false);
    this.idleEv = null;
  }

  private onHidden(): void {
    this.tabHidden = true;
    this.speaker.pause();
    if (this.idleEv) this.idleEv.paused = true;
  }

  private onVisible(): void {
    this.tabHidden = false;
    this.speaker.resume();
    if (this.idleEv) this.idleEv.paused = false;
  }

  // ------------------------------------------------------------ view helpers

  /** Resolves when `p` does, or after `ms` on the scene clock, so no await can hang the runner. */
  private until(p: Promise<void>, ms: number): Promise<void> {
    return new Promise<void>((res) => {
      const ev = this.time.delayedCall(ms, res);
      const done = () => {
        ev.remove(false);
        res();
      };
      p.then(done, done);
    });
  }

  /** On the scene clock, so it stops with a hidden tab. Never skipped by a tap. */
  private wait(ms: number): Promise<void> {
    return new Promise<void>((res) => this.time.delayedCall(ms, res));
  }

  /** A tween that can never hold the runner: it resolves on completion, on stop, or at its deadline. Reduced motion jumps to the end. */
  private tw(cfg: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    const ms = reducedMotion() ? 1 : (cfg.duration as number);
    const total = ms * (cfg.yoyo ? 2 : 1) * (((cfg.repeat as number | undefined) ?? 0) + 1) + ((cfg.delay as number | undefined) ?? 0);
    const p = new Promise<void>((res) => void this.tweens.add({ ...cfg, duration: ms, onComplete: () => res(), onStop: () => res() }));
    return this.until(p, total + TUNING.fallbackPadMs);
  }

  /** Mimi hops in place; she always lands back where she was. */
  private async hop(px: number, ms: number, repeat: number): Promise<void> {
    const y = this.mimi.go.y;
    try {
      await this.tw({ targets: this.mimi.go, y: y - px, duration: ms, yoyo: true, repeat });
    } finally {
      this.tweens.killTweensOf(this.mimi.go);
      this.mimi.go.y = y;
    }
  }

  private clearReveal(): void {
    if (this.revealImg) this.tweens.killTweensOf(this.revealImg);
    this.revealImg?.destroy();
    this.revealImg = null;
  }

  /** The gate button: the same path as any line, so busy, dialogue and skip all apply. No core event. */
  private listenAgain(word: WordId): void {
    if (this.left || this.busy || this.state?.phase !== 'gate') return;
    void this.run([{ t: 'say', line: wordLine('book', word) }]);
  }

  private async sayLine(line: Parameters<Dialogue['show']>[0]): Promise<void> {
    this.dialogue.show(line, this.save.viSubtitles);
    if (LINES[line].speaker === 'mimi') this.mimi.bobWhileTalking(true);
    try {
      await this.speaker.say(line); // has its own deadline
    } finally {
      this.mimi.bobWhileTalking(false);
      this.dialogue.hide();
    }
  }

  private nodeX(i: number): number {
    const n = this.state!.trip.rooms.length;
    return V.map.x0 + (i * (V.map.x1 - V.map.x0)) / Math.max(1, n - 1);
  }

  private drawMap(at: number): void {
    const m = V.map;
    const g = this.mapPath.setVisible(true).clear();
    g.lineStyle(m.line, COLORS.paper, 0.9).lineBetween(0, m.y, TUNING.gameW, m.y);
    for (let i = 0; i < this.state!.trip.rooms.length; i++) {
      g.fillStyle(COLORS.paper, i < at ? 1 : 0).fillCircle(this.nodeX(i), m.y, m.node).lineStyle(m.line / 2, COLORS.paper, 1).strokeCircle(this.nodeX(i), m.y, m.node);
    }
  }

  /** Mimi walks one leg by herself; a tap makes the rest faster. Every wait has a deadline. */
  private async walkLeg(at: number): Promise<void> {
    const to = this.nodeX(at);
    const from = at === 0 ? -TUNING.offscreenPad : this.nodeX(at - 1);
    this.mimi.go.setPosition(from, V.map.y);
    this.mimi.body.setFlipX(false);
    this.mapping = true;
    this.fast = false;
    try {
      if (reducedMotion()) {
        await this.wait(V.mapStillMs);
        return;
      }
      const perMs = TUNING.mimiPxPerSec / 1000;
      const speed = Math.abs(to - from) / (perMs * V.mapMs);
      await this.until(this.mimi.walkTo(to, V.map.y, speed), V.mapMs + TUNING.fallbackPadMs);
    } finally {
      this.mapping = false;
      this.tweens.killTweensOf([this.mimi.go, this.mimi.body]);
      this.mimi.go.x = to;
      this.mimi.body.y = 0;
    }
  }

  // ------------------------------------------------------------ effects

  private handlers: Handlers<TripEffect> = this.guarded({
    say: (e) => this.sayLine(e.line),
    pose: (e) => this.mimi.pose(e.pose),
    bubble: (e) => {
      this.clearReveal();
      this.bubble.set(e.show);
    },
    map: (e) => {
      this.rooms.hide();
      this.cards.clear();
      this.clearReveal();
      this.mapBg.setVisible(true);
      this.drawMap(e.at);
      return this.walkLeg(e.at);
    },
    room: async (e) => {
      this.clearReveal();
      this.mapBg.setVisible(false);
      this.mapPath.setVisible(false);
      this.cards.clear();
      this.rooms.show(e.room);
      this.mimi.body.setFlipX(false); // the challenge is to her right
      const m = V.mimi;
      if (reducedMotion()) return void this.mimi.go.setPosition(m.x, m.y);
      // She walks in from the left, so the end of the map walk leads into the room.
      this.mimi.go.setPosition(-TUNING.offscreenPad, m.y);
      const ms = ((m.x + TUNING.offscreenPad) / (TUNING.mimiPxPerSec * V.enterSpeed)) * 1000;
      await this.until(this.mimi.walkTo(m.x, m.y, V.enterSpeed), ms + TUNING.fallbackPadMs);
      this.tweens.killTweensOf(this.mimi.go);
      this.mimi.go.setPosition(m.x, m.y);
      this.mimi.body.y = 0;
    },
    order: (e) => this.hud.setOrder(e.slots),
    battery: (e) => this.hud.setBattery(e.left),
    gears: (e) => this.hud.addGears(e.n),
    doors: (e) => this.rooms.setDoors(e.on),
    cashierLook: () => this.rooms.cashierLook(),
    wait: (e) => this.wait(e.ms),
    // The save is written once, by goHome: beliefs and basket gears may only reach it through applyTrip.
    save: noop,
    goHome: (e) => {
      this.left = true; // the last effect: nothing may run in this scene after the switch
      try {
        writeTripSave(browserStore(), applyTrip(this.save, this.state!));
      } catch (err) {
        console.error(err);
      } finally {
        this.scene.start('Home', { summary: e.summary });
      }
    },
    hand: (e) =>
      e.words.length
        ? this.until(this.cards.deal(e.words), L.cards.enterMs + e.words.length * L.cards.staggerMs + TUNING.fallbackPadMs)
        : this.cards.clear(),
    stalls: (e) => this.rooms.setStalls(e.enabled),
    ask: (e) => this.rooms.showAsk(e.show),
    markStall: (e) => this.rooms.mark(e.item),
    book: (e) => this.rooms.showBook(e.word),
    dropCard: (e) => {
      playSfx('boing');
      return this.until(this.cards.drop(e.word), L.cards.upMs + L.cards.fadeMs + TUNING.fallbackPadMs);
    },
    // Fruit jokes are the cashier's; the robot's wrong card (null) and an apple get a basic boing hop.
    joke: async (e) => {
      if (e.item !== null && e.item !== 'apple') return playJoke(this, this.mimi, e.item); // has its own deadline
      playSfx('boing');
      await this.hop(V.fx.hop.px, V.fx.hop.ms, V.fx.hop.repeat);
      this.mimi.pose('happy');
    },
    // The item leaves the thought bubble for the order row. Same path and sound for every item.
    collect: async (e) => {
      const c = V.fx.collect;
      const img = fitImage(this.add.image(this.mimi.go.x + L.bubble.dx, this.mimi.go.y + L.bubble.dy, `v2_item_${e.item}`), c.px).setDepth(L.depth + V.look.fxDepth);
      playSfx('pop');
      try {
        await this.tw({ targets: img, x: c.to.x, y: c.to.y, alpha: 0, scale: img.scale * V.look.collectEnd, duration: c.ms });
      } finally {
        img.destroy();
      }
    },
    chest: async (e) => {
      const c = V.fx.chest;
      const at = this.rooms.center('chest') ?? { x: TUNING.gameW / 2, y: TUNING.gameH / 2 };
      const t = this.add.text(at.x, at.y, `+${e.gears}`, { fontFamily: FONT_DISPLAY, fontStyle: '800', fontSize: `${c.font}px`, color: CSS.sun, stroke: CSS.indigo, strokeThickness: V.look.textStroke }).setOrigin(0.5).setDepth(L.depth + V.look.fxDepth);
      playSfx('pop');
      if (!reducedMotion()) burst(this, at.x, at.y, c.stars, TUNING.celebrate.color, c.inner, c.outer, c.rx, c.ry, c.starMs);
      try {
        await this.tw({ targets: t, y: at.y - c.rise, duration: c.ms });
        await this.wait(c.holdMs);
      } finally {
        t.destroy();
      }
    },
    reveal: (e) => {
      this.clearReveal();
      const r = V.fx.reveal;
      const img = fitImage(this.add.image(r.x, r.y, `v2_item_${e.item}`), r.px).setDepth(L.depth + V.look.fxDepth);
      this.revealImg = img;
      playSfx('pop');
      if (reducedMotion()) return;
      const s = img.scale;
      img.setScale(0);
      this.tweens.add({ targets: img, scale: s, duration: r.popMs, ease: 'Back.easeOut' });
    },
    sleep: async () => {
      const s = V.fx.sleep;
      const cart = fitImage(this.add.image(-s.cartPx, s.y, 'v2_cart').setOrigin(0.5, 1), s.cartPx).setDepth(V.look.cartDepth);
      const off = TUNING.gameW + s.cartPx;
      try {
        await this.tw({ targets: cart, x: this.mimi.go.x, duration: s.inMs });
        await Promise.all([this.tw({ targets: cart, x: off, duration: s.outMs }), this.tw({ targets: this.mimi.go, x: off, duration: s.outMs })]);
      } finally {
        cart.destroy();
      }
    },
    // A right item beats any joke: the big peak is the Day 1 burst plus fireworks; the small one is a little burst.
    celebrate: async (e) => {
      const { x, y } = this.mimi.go;
      const hy = y - TUNING.headDy;
      playSfx('sparkle');
      if (e.size === 'small') {
        const s = V.fx.small;
        if (!reducedMotion()) burst(this, x, hy, s.stars, TUNING.celebrate.color, s.inner, s.outer, s.rx, s.ry, s.ms);
        return this.hop(s.hopPx, s.hopMs, 0);
      }
      const c = TUNING.celebrate;
      const f = TUNING.fireworks;
      const motion = !reducedMotion();
      if (motion) burst(this, x, hy, c.stars, c.color, c.inner, c.outer, c.rx, c.ry, TUNING.celebrateMs);
      for (const [dx, dy, color, delay] of motion ? f.shots : []) {
        this.time.delayedCall(delay, () => {
          if (this.left) return;
          playSfx('sparkle');
          burst(this, x + dx, hy + dy, f.sparks, color, f.r / 2, f.r, f.rx, f.ry, f.ms);
        });
      }
      await this.hop(c.hopPx, c.hopMs, c.hopRepeat);
      await this.wait(c.holdMs);
    },
    // The helper robot walks to the stall, says its line and walks back. No notice is shown.
    helper: async (e) => {
      const h = V.helper;
      const img = fitImage(this.add.image(-h.px, h.y, 'v2_helper').setOrigin(0.5, 1), h.px).setDepth(h.depth);
      try {
        await this.tw({ targets: img, x: this.rooms.center(`stall_${e.item}`)?.x ?? TUNING.gameW / 2, duration: h.ms });
        await this.sayLine(e.line);
        img.setFlipX(true);
        await this.tw({ targets: img, x: -h.px, duration: h.ms });
      } finally {
        img.destroy();
      }
    },
  });

  /** Once the scene has shut down, a line that was cut short must not let later effects touch dead objects. */
  private guarded(h: Handlers<TripEffect>): Handlers<TripEffect> {
    return Object.fromEntries(
      Object.entries(h).map(([k, f]) => [k, (e: unknown) => (this.left ? undefined : (f as (e: unknown) => unknown)(e))]),
    ) as unknown as Handlers<TripEffect>;
  }
}
