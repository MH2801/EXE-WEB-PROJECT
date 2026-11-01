import Phaser from 'phaser';
import { LINES } from '../content/lines';
import { TUNING } from '../content/tuning';
import { browserStore } from '../core/save';
import { applyTrip, AUTO_PHASES, startTrip, step, type TripEffect, type TripEvent, type TripState } from '../core/trip';
import { loadTripSave, writeTripSave, type TripSave } from '../core/tripSave';
import { Mimi } from '../view/actors';
import { Bubble } from '../view/bubble';
import { Cards } from '../view/cards';
import { Dialogue } from '../view/dialogue';
import { Hud } from '../view/hud';
import { RoomView } from '../view/rooms';
import { runEffects, type Handlers } from '../view/runner';
import { COLORS, CSS } from '../view/theme';
import { addRotateOverlay, makeSpeaker, reducedMotion } from '../view/ui';

const V = TUNING.trip.view;
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

  constructor() {
    super('Trip');
  }

  create(): void {
    // The scene object is reused on restart, so every field is reset here.
    this.busy = this.fresh = this.left = this.tabHidden = this.mapping = this.fast = false;
    this.batch = 0;
    this.idleEv = null;
    this.state = undefined;

    const { gameW, gameH } = TUNING;
    this.save = loadTripSave(browserStore());
    this.speaker = makeSpeaker(this);
    this.cameras.main.setBackgroundColor(CSS.indigo);
    this.mapBg = this.add.image(gameW / 2, gameH / 2, 'v2_dusk').setDepth(0).setVisible(false);
    this.mapPath = this.add.graphics().setDepth(5).setVisible(false);
    this.rooms = new RoomView(this, (e) => this.dispatch(e));
    this.hud = new Hud(this);
    this.mimi = new Mimi(this, V.mimi.x, V.mimi.y, 'v2_mimi');
    this.mimi.go.setScale(V.mimi.scale).setDepth(30);
    this.bubble = new Bubble(this, this.mimi);
    this.cards = new Cards(this, (word) => this.dispatch({ t: 'tapCard', word }));
    this.dialogue = new Dialogue(this, V.dialogue);
    addRotateOverlay(this);

    this.input.on('pointerdown', this.onPointer, this);
    this.game.events.on(Phaser.Core.Events.HIDDEN, this.onHidden, this);
    this.game.events.on(Phaser.Core.Events.VISIBLE, this.onVisible, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.left = true;
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
    if (this.left || this.busy || !this.state) return; // a tap during effects only skips (onPointer)
    const before = this.state.phase;
    const r = step(this.state, e);
    this.state = r.state;
    // `effectsDone` that changes nothing would loop forever: stop there.
    if (r.effects.length === 0 && (e.t !== 'effectsDone' || r.state.phase === before)) return;
    void this.run(r.effects);
  }

  private async run(effects: TripEffect[]): Promise<void> {
    const batch = ++this.batch;
    this.setBusy(true);
    this.fresh = true;
    queueMicrotask(() => (this.fresh = false));
    await runEffects(effects, this.handlers);
    if (this.left || batch !== this.batch) return; // stale or finished batch: ignore its late completion
    this.setBusy(false);
    if (AUTO_PHASES.has(this.state!.phase)) this.dispatch({ t: 'effectsDone' });
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
    this.tweens.killTweensOf(this.mimi.go); // the walk ends here and finishes again, faster
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
      const rest = Math.abs(to - this.mimi.go.x);
      if (this.fast && rest > 1) {
        const ms = rest / (perMs * speed * V.mapFast);
        await this.until(this.mimi.walkTo(to, V.map.y, speed * V.mapFast), ms + TUNING.fallbackPadMs);
      }
    } finally {
      this.mapping = false;
      this.tweens.killTweensOf(this.mimi.go);
      this.mimi.go.x = to;
      this.mimi.body.y = 0;
    }
  }

  // ------------------------------------------------------------ effects

  private handlers: Handlers<TripEffect> = this.guarded({
    say: async (e) => {
      this.dialogue.show(e.line, this.save.viSubtitles);
      if (LINES[e.line].speaker === 'mimi') this.mimi.bobWhileTalking(true);
      try {
        await this.speaker.say(e.line); // has its own deadline
      } finally {
        this.mimi.bobWhileTalking(false);
        this.dialogue.hide();
      }
    },
    pose: (e) => this.mimi.pose(e.pose),
    bubble: (e) => this.bubble.set(e.show),
    map: (e) => {
      this.rooms.hide();
      this.mapBg.setVisible(true);
      this.drawMap(e.at);
      return this.walkLeg(e.at);
    },
    room: (e) => {
      this.mapBg.setVisible(false);
      this.mapPath.setVisible(false);
      this.rooms.show(e.room);
      this.mimi.go.setPosition(V.mimi.x, V.mimi.y);
      this.mimi.body.setFlipX(true); // faces the room
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
      writeTripSave(browserStore(), applyTrip(this.save, this.state!));
      this.scene.start('Home', { summary: e.summary });
    },
    // Task 10 fills these.
    dropCard: noop,
    joke: noop,
    collect: noop,
    chest: noop,
    reveal: noop,
    sleep: noop,
    celebrate: noop,
    hand: noop,
    stalls: noop,
    ask: noop,
    markStall: noop,
    book: noop,
    helper: noop,
  });

  /** Once the scene has shut down, a line that was cut short must not let later effects touch dead objects. */
  private guarded(h: Handlers<TripEffect>): Handlers<TripEffect> {
    return Object.fromEntries(
      Object.entries(h).map(([k, f]) => [k, (e: unknown) => (this.left ? undefined : (f as (e: unknown) => unknown)(e))]),
    ) as unknown as Handlers<TripEffect>;
  }
}
