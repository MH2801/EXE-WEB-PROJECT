import Phaser from 'phaser';
import layout from '../content/layout.json';
import { RECALL_FRUITS } from '../content/fruits';
import { LABELS, LINES } from '../content/lines';
import { TUNING } from '../content/tuning';
import { start, step, toSave, type Effect, type MissionEvent, type MissionState, type Phase, type Spot } from '../core/mission';
import { browserStore, loadSave, writeSave } from '../core/save';
import type { FruitId } from '../core/types';
import { MissionBook } from '../view/book';
import { Mimi } from '../view/actors';
import { Dialogue } from '../view/dialogue';
import { runEffects, type Handlers } from '../view/runner';
import { Stalls } from '../view/stalls';
import { addRotateOverlay, makeButton, makeSpeaker, reducedMotion } from '../view/ui';

type Box = { x: number; y: number; w: number; h: number };
const LAY = layout as Record<string, Box>;

/** Phases that end by themselves: when their effects finish the scene sends `effectsDone`. */
const AUTO: ReadonlySet<Phase> = new Set<Phase>([
  'intro', 'arrive', 'believed', 'said_no', 'to_mom', 'mom_no', 'mom_thanks',
  'npc_eliminate', 'npc_apple', 'tricked', 'memory_reveal', 'replay',
]);

export class Mission extends Phaser.Scene {
  private state!: MissionState;
  private vi = false;
  private busy = false;
  private fresh = false; // true until the microtask after a dispatch, so the tap that started a batch does not skip it
  private left = false;
  private tabHidden = false;
  private picked = false;
  private batch = 0;
  private bg: 'market' | 'fruit' | null = null;
  private bookWanted: 'hidden' | 'pulse' | 'idle' = 'hidden';
  private speaker!: ReturnType<typeof makeSpeaker>;
  private dialogue!: Dialogue;
  private mimi!: Mimi;
  private stalls!: Stalls;
  private book!: MissionBook;
  private marketLayer: Phaser.GameObjects.Image[] = [];
  private mom!: Phaser.GameObjects.Image;
  private choices: Phaser.GameObjects.Container[] = [];
  private choicesShown = false;
  private lifted: Phaser.GameObjects.Image | null = null;
  private npc: Phaser.GameObjects.Container | null = null;
  private recallObjs: Phaser.GameObjects.GameObject[] = [];
  private idleEv: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super('Mission');
  }

  create(): void {
    // The scene object is reused on restart, so every field is reset here.
    this.busy = this.fresh = this.left = this.tabHidden = this.picked = false;
    this.batch = 0;
    this.bg = null;
    this.bookWanted = 'hidden';
    this.choices = [];
    this.choicesShown = false;
    this.lifted = this.npc = this.idleEv = null;
    this.recallObjs = [];

    const { gameW, gameH } = TUNING;
    const save = loadSave(browserStore());
    this.vi = save.viSubtitles;
    this.speaker = makeSpeaker(this);

    const mom = LAY.mom!;
    this.marketLayer = [
      this.add.image(gameW / 2, gameH / 2, 'bg_market').setDepth(0),
      (this.mom = this.add.image(mom.x, mom.y, 'mom').setDisplaySize(mom.w, mom.h).setDepth(5)),
    ];
    this.stalls = new Stalls(this, (f) => this.onStall(f));
    this.mimi = new Mimi(this, 0, 0);
    this.mimi.go.setScale(TUNING.mimiScale).setDepth(50);
    this.dialogue = new Dialogue(this);
    this.book = new MissionBook(this, (e) => this.dispatch(e), (open) => (open ? this.stopIdle() : this.startIdle()));
    this.choices = [
      this.makeChoice(TUNING.yes, LABELS.yes, 'yes'),
      this.makeChoice(TUNING.no, LABELS.no, 'no'),
    ];
    this.setBg(null);
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

    const r = start(save);
    this.state = r.state;
    void this.run(r.effects);
  }

  // ------------------------------------------------------------ event loop

  private dispatch(e: MissionEvent): void {
    if (this.left || this.busy) return; // a tap during effects only skips (onPointer)
    const before = this.state.phase;
    const r = step(this.state, e);
    this.state = r.state;
    // `effectsDone` that changes nothing would loop forever: stop there.
    if (r.effects.length === 0 && (e.t !== 'effectsDone' || r.state.phase === before)) return;
    void this.run(r.effects);
  }

  private async run(effects: Effect[]): Promise<void> {
    const batch = ++this.batch;
    this.setBusy(true);
    this.fresh = true;
    queueMicrotask(() => (this.fresh = false));
    await runEffects(effects, this.handlers);
    if (this.left || batch !== this.batch) return; // stale or finished batch: ignore its late completion
    this.setBusy(false);
    this.afterEffects();
  }

  private afterEffects(): void {
    if (AUTO.has(this.state.phase)) this.dispatch({ t: 'effectsDone' });
    else this.startIdle();
  }

  private setBusy(b: boolean): void {
    this.busy = b;
    this.book.locked = b;
    this.syncChoices();
    if (b) this.stopIdle();
  }

  private onPointer(): void {
    if (this.busy) {
      if (!this.fresh) this.speaker.skip();
    } else this.startIdle(); // any tap restarts the count
  }

  // ------------------------------------------------------------ idle clock (spec 6)

  private startIdle(): void {
    this.stopIdle();
    if (this.state.phase !== 'choosing' || this.book.isOpen || this.busy || this.left) return;
    this.idleEv = this.time.addEvent({
      delay: TUNING.idleMs,
      paused: this.tabHidden,
      callback: () => {
        this.idleEv = null;
        if (!this.busy && !this.book.isOpen && this.state.phase === 'choosing') this.dispatch({ t: 'idle' });
      },
    });
  }

  private stopIdle(): void {
    this.idleEv?.remove(false);
    this.idleEv = null;
  }

  private onHidden(): void {
    this.tabHidden = true;
    this.speaker.pause(); // note: a recorded clip (RECORDED is empty today) cannot be paused
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

  private wait(ms: number): Promise<void> {
    return new Promise<void>((res) => this.time.delayedCall(ms, res));
  }

  /** One tween that always finishes: onComplete/onStop, or a timer a little after its total length. */
  private tw(config: Phaser.Types.Tweens.TweenBuilderConfig, total: number): Promise<void> {
    if (reducedMotion()) return Promise.resolve();
    return this.until(
      new Promise<void>((res) => {
        this.tweens.add({ ...config, onComplete: () => res(), onStop: () => res() });
      }),
      total + TUNING.fallbackPadMs,
    );
  }

  private spot(s: Spot): { x: number; y: number } {
    if (s === 'mom') return TUNING.momSpot;
    if (s === 'fruit_area') return TUNING.fruitSpot;
    if (s === 'offscreen') return { x: -TUNING.offscreenPad, y: TUNING.feetY };
    return { x: this.stalls.center(s.slice(6) as FruitId).x, y: TUNING.feetY };
  }

  private setBg(bg: 'market' | 'fruit' | null): void {
    const first = this.bg === null;
    const changed = this.bg !== bg;
    this.bg = bg;
    for (const o of this.marketLayer) o.setVisible(bg === 'market');
    this.stalls.show(bg === 'fruit');
    this.book.setState(bg === 'fruit' ? this.bookWanted : 'hidden');
    if (bg && changed) {
      // First scene, or `arrive` (no walk follows it): Mimi is already there. Else she walks in from the side she left by.
      const there = first || (bg === 'fruit' && this.state.phase === 'arrive');
      const pos = there
        ? bg === 'market' ? TUNING.momSpot : TUNING.fruitSpot
        : { x: bg === 'market' ? TUNING.gameW + TUNING.offscreenPad : -TUNING.offscreenPad, y: TUNING.feetY };
      this.mimi.go.setPosition(pos.x, pos.y);
    }
  }

  private onStall(f: FruitId): void {
    if (this.busy) return;
    this.dispatch({ t: 'tapStall', fruit: f });
  }

  private syncChoices(): void {
    for (const c of this.choices) c.input!.enabled = this.choicesShown && !this.busy;
  }

  private makeChoice(at: { x: number; y: number }, label: string, kind: 'yes' | 'no'): Phaser.GameObjects.Container {
    const { choiceW: w, choiceH: h } = TUNING;
    const b = makeButton(this, at.x, at.y, {
      label,
      labelColor: TUNING.choiceLabel,
      w,
      h,
      onTap: () => {
        if (!this.busy) this.dispatch({ t: kind === 'yes' ? 'tapYes' : 'tapNo' });
      },
    }).setDepth(200);
    const fill = this.add.graphics().fillStyle(kind === 'yes' ? TUNING.yesFill : TUNING.noFill, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 28);
    // Not colour alone (spec 9): a tick and a cross, always in the same place.
    const mark = this.add.graphics().lineStyle(14, 0xffffff, 1);
    const cx = -w / 2 + 80;
    if (kind === 'yes') mark.beginPath().moveTo(cx - 30, 4).lineTo(cx - 6, 30).lineTo(cx + 34, -26).strokePath();
    else mark.lineBetween(cx - 26, -26, cx + 26, 26).lineBetween(cx - 26, 26, cx + 26, -26);
    b.addAt(fill, 1).add(mark);
    b.setVisible(false).input!.enabled = false;
    return b;
  }

  private onRecall(f: FruitId): void {
    if (this.busy || this.picked) return; // the first tap is the result (spec 7)
    this.picked = true;
    this.dispatch({ t: 'recallPick', fruit: f });
  }

  // ------------------------------------------------------------ effects

  private handlers: Handlers = this.guarded({
    say: async (e) => {
      this.dialogue.show(e.line, this.vi);
      if (LINES[e.line].speaker === 'mimi') this.mimi.bobWhileTalking(true);
      try {
        await this.speaker.say(e.line); // has its own deadline
      } finally {
        this.mimi.bobWhileTalking(false);
        this.dialogue.hide();
      }
    },
    pose: (e) => this.mimi.pose(e.pose),
    walk: async (e) => {
      const p = this.spot(e.to);
      const dist = Phaser.Math.Distance.Between(this.mimi.go.x, this.mimi.go.y, p.x, p.y);
      const ms = (dist / (TUNING.mimiPxPerSec * e.speed)) * 1000;
      await this.until(this.mimi.walkTo(p.x, p.y, e.speed), ms + TUNING.fallbackPadMs);
    },
    bg: (e) => this.setBg(e.bg),
    lift: async (e) => {
      this.lifted?.destroy();
      this.lifted = null;
      if (!e.fruit) return;
      const { x, y, scale, ms } = TUNING.lift;
      const from = this.bg === 'fruit' ? this.stalls.center(e.fruit) : { x: this.mimi.go.x, y: this.mimi.go.y - TUNING.headDy };
      const img = this.add.image(from.x, from.y, `fruit_${e.fruit}`).setDepth(60);
      this.lifted = img;
      if (reducedMotion()) img.setPosition(x, y).setScale(scale);
      else await this.tw({ targets: img, x, y, scaleX: scale, scaleY: scale, duration: ms, ease: 'Back.Out' }, ms);
    },
    carry: (e) => this.mimi.carry(e.fruit ? `fruit_${e.fruit}` : null),
    mark: (e) => this.stalls.mark(e.fruit),
    yesNo: (e) => {
      this.choicesShown = e.show;
      for (const c of this.choices) c.setVisible(e.show);
      this.syncChoices();
    },
    book: (e) => {
      this.bookWanted = e.state;
      this.book.setState(this.bg === 'fruit' ? e.state : 'hidden');
    },
    stalls: (e) => this.stalls.setEnabled(e.enabled),
    npc: async (e) => {
      this.npc?.destroy();
      const tints = TUNING.npcTint;
      const w = TUNING.npcWant;
      const body = this.add.image(0, 0, 'npc').setTint(tints[e.visit % tints.length] ?? 0xffffff);
      const want = this.add.image(w.x, w.y, `fruit_${e.fruit}`).setScale(w.scale); // what this customer buys
      const c = this.add.container(TUNING.npcOffX, TUNING.npcY, [body, want]).setDepth(60);
      this.npc = c;
      await this.tw({ targets: c, x: TUNING.npcX, duration: TUNING.npcMs }, TUNING.npcMs);
      c.x = TUNING.npcX;
    },
    npcLeave: async () => {
      const c = this.npc;
      if (!c) return;
      await this.tw({ targets: c, x: TUNING.npcOffX, duration: TUNING.npcMs }, TUNING.npcMs);
      c.destroy();
      if (this.npc === c) this.npc = null;
    },
    momLook: async () => {
      await this.tw({ targets: this.mom, y: this.mom.y + TUNING.momNodPx, duration: TUNING.momNodMs / 2, yoyo: true }, TUNING.momNodMs);
    },
    // Placeholder joke: a wobble. The per-fruit scenes of spec 9 come with their own task.
    joke: async () => {
      this.mimi.pose('surprised');
      const j = TUNING.joke;
      await this.tw({ targets: this.mimi.go, angle: j.angle, duration: j.stepMs, yoyo: true, repeat: j.repeat }, j.stepMs * 2 * (j.repeat + 1));
      this.mimi.go.setAngle(0);
      if (reducedMotion()) await this.wait(TUNING.jokeMs);
    },
    wait: (e) => this.wait(e.ms),
    // Placeholder celebration: two hops and a burst of stars.
    celebrate: async () => {
      const { x, y } = this.mimi.go;
      const c = TUNING.celebrate;
      const top = y - TUNING.headDy;
      if (!reducedMotion()) {
        for (let i = 0; i < c.stars; i++) {
          const star = this.add.star(x, top, 5, c.inner, c.outer, 0xffd23f).setDepth(70);
          const a = (i / c.stars) * Math.PI * 2;
          this.tweens.add({ targets: star, x: x + Math.cos(a) * c.rx, y: top + Math.sin(a) * c.ry, alpha: 0, duration: TUNING.celebrateMs, onComplete: () => star.destroy() });
          this.time.delayedCall(TUNING.celebrateMs + TUNING.fallbackPadMs, () => star.destroy());
        }
      }
      await this.tw({ targets: this.mimi.go, y: y - c.hopPx, duration: c.hopMs, yoyo: true, repeat: c.hopRepeat }, c.hopMs * 2 * (c.hopRepeat + 1));
      await this.wait(c.holdMs);
    },
    recall: (e) => {
      for (const o of this.recallObjs) o.destroy();
      this.recallObjs = [];
      if (!e.show) return;
      this.picked = false;
      const { y, gap, scale, card } = TUNING.recall;
      const order = Phaser.Utils.Array.Shuffle([...RECALL_FRUITS]); // random order lives here, never in core/
      order.forEach((f, i) => {
        const x = TUNING.gameW / 2 + (i - 1) * gap;
        const bg = this.add.graphics().setDepth(200).fillStyle(0xffffff, 0.92).fillRoundedRect(x - card / 2, y - card / 2, card, card, 40);
        const img = this.add.image(x, y, `fruit_${f}`).setScale(scale).setDepth(201);
        const zone = this.add.zone(x, y, card, card).setDepth(202).setInteractive();
        zone.on('pointerdown', () => this.onRecall(f));
        this.recallObjs.push(bg, img, zone);
      });
    },
    save: () => writeSave(browserStore(), toSave(this.state, this.vi)),
    goMemory: () => {
      this.left = true; // the last effect: nothing may run in this scene after the switch
      this.scene.start('Memory', { reveal: true });
    },
  });

  /** Once the scene has shut down, a line that was cut short must not let later effects touch dead objects. */
  private guarded(h: Handlers): Handlers {
    return Object.fromEntries(
      Object.entries(h).map(([k, f]) => [k, (e: unknown) => (this.left ? undefined : (f as (e: unknown) => unknown)(e))]),
    ) as unknown as Handlers;
  }
}
