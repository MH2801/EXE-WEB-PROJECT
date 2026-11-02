import Phaser from 'phaser';
import { LINES, wordLine, type Line } from '../content/lines';
import { TUNING } from '../content/tuning';
import { browserStore } from '../core/save';
import { applyTrip, AUTO_PHASES, startTrip, step, type TripEffect, type TripEvent, type TripPhase, type TripState } from '../core/trip';
import { loadTripSave, writeTripSave, type TripSave } from '../core/tripSave';
import type { WordId } from '../core/types';
import { Mimi } from '../view/actors';
import { Bubble } from '../view/bubble';
import { Cards } from '../view/cards';
import { Dialogue } from '../view/dialogue';
import { Hud } from '../view/hud';
import { burst, playJoke } from '../view/jokes';
import { leanTiming, RoomView, type InviteKind, type Tw } from '../view/rooms';
import { runEffects, type Handlers } from '../view/runner';
import { playSfx } from '../view/sfx';
import { COLORS, CSS, FONT_DISPLAY } from '../view/theme';
import { hushMusic } from '../view/music';
import { addRotateOverlay, drawLeaf, ensureIcons, fitImage, makeSpeaker, reducedMotion } from '../view/ui';

const V = TUNING.trip.view;
const L = TUNING.trip.layout;
const ENTRY: ReadonlySet<string> = new Set(['gate', 'robot', 'chest']); // rooms whose entry batch may hold one tap (R22)
const noop = (): void => undefined;
// R24: what each waiting phase invites the child to tap. Once that kind of tap is done in this trip it never invites again.
const INVITE: Partial<Record<TripPhase, InviteKind | 'card'>> = { fork: 'door', teach: 'stall', asking: 'ask', chest: 'chest', gate: 'card', robot: 'card' };

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
  private hushing = false; // the music is silent for the Cashier's wait
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
  private did = new Set<string>(); // kinds of action the child has done in this trip
  private collected = 0; // items in a row, for the rising pitch
  private lean: Phaser.Tweens.Tween | null = null;
  private tail!: Phaser.GameObjects.Graphics;
  private tween: Tw = (cfg) => this.tw(cfg);

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
    this.did = new Set();
    this.collected = 0;
    this.lean = null;
    ensureIcons(this);

    const { gameW, gameH } = TUNING;
    this.save = loadTripSave(browserStore());
    this.speaker = makeSpeaker(this);
    this.cameras.main.setBackgroundColor(CSS.indigo);
    this.mapBg = this.add.image(gameW / 2, gameH / 2, 'v2_dusk').setDepth(0).setVisible(false);
    this.mapPath = this.add.graphics().setDepth(5).setVisible(false);
    this.rooms = new RoomView(this, (e) => this.dispatch(e), (w) => this.listenAgain(w));
    this.rooms.showMom();
    this.hud = new Hud(this);
    this.mimi = new Mimi(this, V.mimi.x, V.mimi.y, 'v2_mimi');
    this.mimi.go.setScale(V.mimi.scale).setDepth(V.look.mimiDepth);
    this.bubble = new Bubble(this, this.mimi);
    this.cards = new Cards(this, (word) => this.dispatch({ t: 'tapCard', word }));
    this.dialogue = new Dialogue(this, V.dialogue);
    this.tail = this.add.graphics().setDepth(V.tail.depth);
    addRotateOverlay(this);

    this.input.on('pointerdown', this.onPointer, this);
    this.game.events.on(Phaser.Core.Events.HIDDEN, this.onHidden, this);
    this.game.events.on(Phaser.Core.Events.VISIBLE, this.onVisible, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.left = true;
      this.unhush(); // the wait's timer dies with the scene
      this.pending = null;
      this.speaker.skip(); // resolves a line in flight; the guarded handlers then do nothing
      this.stopIdle();
      this.endInvite();
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
    if (e.t.startsWith('tap')) this.did.add(INVITE[before] ?? '');
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
    else {
      this.startIdle();
      this.invite();
    }
  }

  private setBusy(b: boolean): void {
    this.busy = b;
    if (!b) return;
    this.stopIdle();
    this.endInvite();
  }

  // ------------------------------------------------------------ invitation (R24): motion only, no sound, no clock

  private invite(): void {
    const kind = INVITE[this.state!.phase];
    if (!kind || this.did.has(kind)) return;
    if (kind === 'card') this.cards.invite();
    else this.rooms.invite(kind);
    if (kind === 'stall') this.bubble.wobble(true); // the "?" room: her question waits for the child
    // Every target stands to her right, so a lean is Mimi looking at it. Same lean for every card and stall: it hints at nothing.
    const I = V.invite;
    if (reducedMotion()) this.mimi.body.setAngle(I.leanDeg);
    else this.lean = this.tweens.add({ targets: this.mimi.body, angle: I.leanDeg, duration: I.ms, ease: 'Sine.InOut', yoyo: true, repeat: -1, repeatDelay: I.restMs });
  }

  private endInvite(): void {
    this.rooms.endInvite();
    this.cards.endInvite();
    this.bubble.wobble(false);
    this.lean?.remove();
    this.lean = null;
    this.mimi.body.setAngle(0);
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
  private unhush(): void {
    this.hushing = false;
    hushMusic(false);
  }

  private wait(ms: number): Promise<void> {
    return new Promise<void>((res) => this.time.delayedCall(ms, res));
  }

  /** A tween that can never hold the runner: it resolves on completion, on stop, or at its deadline. Reduced motion jumps to the end. */
  private tw(cfg: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    const ms = reducedMotion() ? 1 : (cfg.duration as number);
    const total = ms * (cfg.yoyo ? 2 : 1) * (((cfg.repeat as number | undefined) ?? 0) + 1) + ((cfg.delay as number | undefined) ?? 0) + ((cfg.hold as number | undefined) ?? 0);
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

  /** Who is on stage for this voice: never the child's own, and Mom only in the opening. The helper passes its own place. */
  private standing(who: Line['speaker']): { x: number; y: number } | null {
    if (who === 'kid' || who === 'npc' || who === 'mimi' || (who === 'mom' && this.state?.phase !== 'intro')) return null;
    return this.rooms.center('source') ?? this.rooms.center('book');
  }

  /** The box's tail points at whoever speaks, so a child who cannot read still sees who it is. */
  private pointTail(x: number | null): void {
    const t = V.tail;
    const d = V.dialogue;
    this.tail.clear();
    if (x === null) return;
    const y = d.y + TUNING.dialogue.h / 2 - t.line / 2;
    const root = Phaser.Math.Clamp(x, d.x - d.w / 2 + t.margin, d.x + d.w / 2 - t.margin);
    const tip = root + Phaser.Math.Clamp(x - root, -t.lean, t.lean);
    this.tail.fillStyle(t.fill, 1).lineStyle(t.line, t.edge, 1).fillTriangle(root - t.w / 2, y, root + t.w / 2, y, tip, y + t.len);
    this.tail.lineBetween(root - t.w / 2, y, tip, y + t.len).lineBetween(root + t.w / 2, y, tip, y + t.len);
  }

  private async sayLine(line: Parameters<Dialogue['show']>[0], at?: number): Promise<void> {
    const who = LINES[line].speaker;
    const spot = this.standing(who);
    this.dialogue.show(line, this.save.viSubtitles);
    this.pointTail(who === 'mimi' ? this.mimi.go.x : at ?? spot?.x ?? null);
    if (who === 'mimi') this.mimi.bobWhileTalking(true);
    else if (spot) this.rooms.talk(true);
    try {
      await this.speaker.say(line); // has its own deadline
    } finally {
      this.mimi.bobWhileTalking(false);
      if (spot) this.rooms.talk(false);
      this.dialogue.hide();
      this.tail.clear();
    }
  }

  /** "So sleepy": the stretch and the round mouth of a yawn. Never the happy face before she sleeps. */
  private async yawn(): Promise<void> {
    const y = V.fx.yawn;
    this.mimi.pose('puzzled');
    void this.tw({ targets: this.mimi.body, scaleX: y.sx, scaleY: y.sy, angle: y.deg, duration: y.ms, yoyo: true, hold: y.holdMs });
    await this.sayLine('mimi.sleepy');
  }

  /** Mimi runs to the stall to take what she knows herself: this is her showing off (GDD 6). */
  private async dash(): Promise<void> {
    const d = V.fx.dash;
    const ms = ((d.x - V.mimi.x) / (TUNING.mimiPxPerSec * d.speed)) * 1000;
    await this.until(this.mimi.walkTo(d.x, V.mimi.y, d.speed), ms + TUNING.fallbackPadMs);
    this.tweens.killTweensOf([this.mimi.go, this.mimi.body]);
    this.mimi.go.x = d.x;
    this.mimi.body.y = 0;
  }

  /** The right card reaches its target: a short beat, a spark, then the way opens. */
  private async spendCard(): Promise<void> {
    const s = V.fx.small;
    const to = this.rooms.center('source');
    await this.until(this.cards.spend(to), L.cards.flyMs + TUNING.fallbackPadMs);
    if (to) {
      playSfx('sparkle');
      if (!reducedMotion()) burst(this, to.x, to.y, s.stars, TUNING.celebrate.color, s.inner, s.outer, s.rx, s.ry, s.ms);
    }
    await this.rooms.clearPath(this.tween);
  }

  /** The new word's leaf rises in a ring of rays: the top of the peak (GDD 9). Stays until the hold ends, also under reduced motion. */
  private async leafUp(word: WordId): Promise<void> {
    const l = V.fx.peak.leaf;
    const depth = L.depth + V.look.fxDepth;
    const rays = this.add.graphics({ x: l.x, y: l.y }).lineStyle(l.rayLine, COLORS.sun, 1).setDepth(depth);
    for (let k = 0; k < l.rays; k++) {
      const a = (k / l.rays) * Math.PI * 2;
      rays.lineBetween(Math.cos(a) * l.rayInner, Math.sin(a) * l.rayInner, Math.cos(a) * l.rayOuter, Math.sin(a) * l.rayOuter);
    }
    const leaf = drawLeaf(this, word, this.mimi.go.x, this.mimi.go.y - TUNING.headDy, 'known').setDepth(depth);
    if (!reducedMotion()) this.tweens.add({ targets: rays, angle: l.spin, duration: l.riseMs + l.holdMs });
    try {
      await this.tw({ targets: leaf, x: l.x, y: l.y, scale: { from: l.from, to: 1 }, duration: l.riseMs, ease: 'Back.easeOut' });
      await this.wait(l.holdMs);
    } finally {
      this.tweens.killTweensOf(rays);
      rays.destroy();
      leaf.destroy();
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
    say: (e) => {
      if (e.line === 'mimi.sleepy') return this.yawn();
      if (e.line === 'robot.yum') void this.cards.spend(this.rooms.center('source')); // the card goes in as the robot says it
      if (e.line.startsWith('ok.')) this.mimi.pose('happy'); // a verdict: she lets her breath go on "Yes!"
      return this.sayLine(e.line);
    },
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
      if (e.room.kind === 'cashier') this.collected = 0; // the items she brought climb again toward the new word
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
    // The gate's word keeps its picture off the list until the gate is passed, so the gate is won by ear (GDD 6).
    order: (e) => this.hud.setOrder(e.slots, new Set(this.state!.trip.rooms.flatMap((r) => (r.kind === 'gate' ? [r.word] : [])))),
    battery: (e) => this.hud.setBattery(e.left),
    gears: async (e) => {
      const f = V.fx.gearFly;
      const g = L.gears;
      const from = this.rooms.center('chest') ?? this.rooms.center('source') ?? V.mimi;
      const imgs = Array.from({ length: e.n }, () => fitImage(this.add.image(from.x, from.y, 'home_gear'), f.px).setDepth(L.depth + V.look.fxDepth));
      try {
        await Promise.all(imgs.map((img, i) => this.tw({ targets: img, x: g.right - g.icon, y: g.y, scale: img.scale * V.look.collectEnd, duration: f.ms, delay: i * f.staggerMs, ease: 'Quad.easeIn' })));
      } finally {
        for (const img of imgs) img.destroy();
      }
      playSfx('pop', this.collected++);
      this.hud.addGears(e.n);
    },
    doors: (e) => {
      this.rooms.setDoors(e.on);
      if (e.on) return this.mimi.pose('think'); // she wonders too: the choice is the child's
      return this.rooms.openDoor(this.tween);
    },
    // Every item, right or wrong, the same: still, tense, not happy. Both she and the robot are back by the verdict; the pause is the `wait` alone.
    cashierLook: () => {
      const c = V.cashier;
      this.mimi.pose('puzzled');
      this.rooms.cashierLook();
      this.hushing = true;
      hushMusic(true);
      this.tweens.add({ targets: this.mimi.body, scaleX: c.breathX, scaleY: c.breathY, yoyo: true, ...leanTiming() });
    },
    // Hush covers the Cashier's suspense only (cashierLook then this wait); the stall's wait stays musical.
    wait: (e) => {
      if (!this.hushing) return this.wait(e.ms);
      return this.wait(e.ms).then(() => this.unhush());
    },
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
    hand: (e) => {
      if (e.words.length) return this.until(this.cards.deal(e.words), L.cards.enterMs + e.words.length * L.cards.staggerMs + TUNING.fallbackPadMs);
      return this.state!.phase === 'asleep' ? this.cards.clear() : this.spendCard();
    },
    stalls: (e) => this.rooms.setStalls(e.enabled),
    ask: (e) => this.rooms.showAsk(e.show),
    markStall: (e) => this.rooms.mark(e.item),
    book: (e) => this.rooms.showBook(e.word),
    dropCard: (e) => {
      playSfx('boing');
      return this.until(this.cards.drop(e.word), L.cards.upMs + L.cards.fadeMs + TUNING.fallbackPadMs);
    },
    joke: (e) => playJoke(this, this.mimi, e.item), // has its own deadline
    // The item goes from the room to its order slot. Same path and sound for every item, right or wrong; only the count raises the pitch.
    collect: async (e) => {
      const c = V.fx.collect;
      if (this.state!.phase === 'stall' && !reducedMotion()) await this.dash();
      const from = this.rooms.take(e.item) ?? { x: this.mimi.go.x + L.bubble.dx, y: this.mimi.go.y + L.bubble.dy };
      const to = this.hud.openSlot() ?? c.to;
      const img = fitImage(this.add.image(from.x, from.y, `v2_item_${e.item}`), c.px).setDepth(L.depth + V.look.fxDepth);
      playSfx('pop', this.collected++);
      try {
        await this.tw({ targets: img, x: to.x, y: to.y, scale: img.scale * V.look.collectEnd, duration: c.ms, ease: 'Quad.easeIn' });
      } finally {
        img.destroy();
      }
      this.hud.bump();
    },
    chest: async (e) => {
      const c = V.fx.chest;
      await this.rooms.openChest(this.tween);
      const at = this.rooms.center('chest') ?? c;
      playSfx('sparkle');
      if (!reducedMotion()) burst(this, at.x, at.y, c.stars, TUNING.celebrate.color, c.inner, c.outer, c.rx, c.ry, c.starMs);
      const plate = this.add.container(c.x, c.y, [
        this.add.graphics().fillStyle(COLORS.paper, 1).fillRoundedRect(-c.w / 2, -c.h / 2, c.w, c.h, c.r).lineStyle(V.look.lineBold, COLORS.indigo, 1).strokeRoundedRect(-c.w / 2, -c.h / 2, c.w, c.h, c.r),
        this.add.text(0, 0, `+${e.gears}`, { fontFamily: FONT_DISPLAY, fontStyle: '800', fontSize: `${c.font}px`, color: CSS.ink }).setOrigin(0.5),
      ]).setDepth(L.depth + V.look.fxDepth);
      try {
        await this.tw({ targets: plate, y: c.y - c.rise, scale: { from: V.look.popFrom, to: 1 }, duration: c.ms, ease: 'Back.easeOut' });
        await this.wait(c.holdMs);
      } finally {
        plate.destroy();
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
      const z = s.z;
      this.mimi.body.setScale(1).setAngle(0);
      // The letters ride on Mimi, so they leave with her. Reduced motion: they stand still in a rising row.
      const zs = Array.from({ length: z.n }, (_, i) => {
        const t = this.add.text(z.x, z.y + i * z.stepY, 'z', { fontFamily: FONT_DISPLAY, fontStyle: '800', fontSize: `${z.font}px`, color: CSS.paper, stroke: CSS.indigo, strokeThickness: V.look.textStroke }).setOrigin(0.5);
        this.mimi.go.add(t);
        if (!reducedMotion()) this.tweens.add({ targets: t, y: t.y + z.stepY - z.rise, alpha: { from: 1, to: 0 }, duration: z.ms, delay: i * z.staggerMs, repeat: -1 });
        return t;
      });
      const cart = fitImage(this.add.image(-s.cartPx, s.y, 'v2_cart').setOrigin(0.5, 1), s.cartPx).setDepth(V.look.cartDepth);
      const off = TUNING.gameW + s.cartPx;
      try {
        await this.wait(s.napMs);
        await this.tw({ targets: cart, x: this.mimi.go.x, duration: s.inMs, ease: 'Quad.easeOut' });
        await this.tw({ targets: this.mimi.go, y: s.seatY, duration: s.hopMs, ease: 'Back.easeOut' });
        await Promise.all([this.tw({ targets: cart, x: off, duration: s.outMs, ease: 'Quad.easeIn' }), this.tw({ targets: this.mimi.go, x: off, duration: s.outMs, ease: 'Quad.easeIn' })]);
      } finally {
        cart.destroy();
        this.tweens.killTweensOf(zs);
        for (const t of zs) t.destroy();
      }
    },
    // Every size beats the joke it stands against: small tops the wrong card; big, on the new word, is the top of the trip (GDD 2, 9).
    celebrate: async (e) => {
      const { x, y } = this.mimi.go;
      const hy = y - TUNING.headDy;
      playSfx('sparkle');
      if (e.size === 'small') {
        const s = V.fx.small;
        if (!reducedMotion()) burst(this, x, hy, s.stars, TUNING.celebrate.color, s.inner, s.outer, s.rx, s.ry, s.ms);
        return this.hop(s.hopPx, s.hopMs, 0);
      }
      const p = V.fx.peak;
      const f = TUNING.fireworks;
      const motion = !reducedMotion();
      if (motion) burst(this, x, hy, p.stars, TUNING.celebrate.color, p.inner, p.outer, p.rx, p.ry, p.ms);
      (motion ? p.shots : []).forEach(([dx, dy, color, delay], i) => {
        this.time.delayedCall(delay, () => {
          if (this.left) return;
          playSfx('sparkle', i + 1); // the sparkles climb
          burst(this, x + dx, hy + dy, f.sparks, color, f.r / 2, f.r, f.rx, f.ry, f.ms);
        });
      });
      await Promise.all([this.hop(p.hopPx, p.hopMs, p.hopRepeat), this.leafUp(this.state!.summary!.newWord!)]);
    },
    // The helper robot walks to the stall, says its line and walks back. No notice is shown.
    helper: async (e) => {
      const h = V.helper;
      const img = fitImage(this.add.image(-h.px, h.y, 'v2_helper').setOrigin(0.5, 1), h.px).setDepth(h.depth);
      try {
        await this.tw({ targets: img, x: this.rooms.center(`stall_${e.item}`)?.x ?? TUNING.gameW / 2, duration: h.ms });
        await this.sayLine(e.line, img.x);
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
