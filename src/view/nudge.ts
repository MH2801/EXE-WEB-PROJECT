import Phaser from 'phaser';
import { TUNING } from '../content/tuning';
import type { LineId } from '../content/lines';
import { reducedMotion } from './ui';
import { COLORS } from './theme';

type Pt = { x: number; y: number };

/**
 * Ladder steps 2 and 3 of the onboarding addendum (5.3): idle nudgeHandMs shows a pointing hand, idle nudgeVoiceMs says the cue once.
 * Step 1 is the invite (inviteLoop). Silent and clockless by itself; never points at an answer, so the caller chooses the targets.
 * Reduced motion: a still star over each target instead of the hand.
 */
export class Nudge {
  private targets: Pt[] = [];
  private voice: LineId | null = null;
  private say: (id: LineId) => void = () => {};
  private timers: Phaser.Time.TimerEvent[] = [];
  private tween: Phaser.Tweens.TweenChain | null = null;
  private shown: Phaser.GameObjects.GameObject[] = [];
  private running = false;

  constructor(private scene: Phaser.Scene) {
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stop());
  }

  start(targets: Pt[], voiceLine: LineId | null, say: (id: LineId) => void): void {
    this.stop();
    if (targets.length === 0) return;
    this.targets = targets;
    this.voice = voiceLine;
    this.say = say;
    this.running = true;
    this.arm();
  }

  /** The child did something: hide the help and count idle time from zero. */
  poke(): void {
    if (!this.running) return;
    this.clear();
    this.arm();
  }

  stop(): void {
    this.running = false;
    this.clear();
  }

  private arm(): void {
    const N = TUNING.onboarding;
    this.timers = [this.scene.time.delayedCall(N.nudgeHandMs, () => this.showHand())];
    if (this.voice) this.timers.push(this.scene.time.delayedCall(N.nudgeVoiceMs, () => this.voice && this.say(this.voice)));
  }

  private clear(): void {
    this.timers.forEach((t) => t.remove(false));
    this.timers = [];
    this.tween?.stop();
    this.tween = null;
    this.shown.forEach((o) => o.destroy());
    this.shown = [];
  }

  private showHand(): void {
    const H = TUNING.onboarding.hand;
    if (reducedMotion()) {
      const I = TUNING.trip.view.invite;
      this.shown = this.targets.map(({ x, y }) => this.scene.add.star(x, y - I.starDy, TUNING.burst.points, I.starPx / 2, I.starPx, COLORS.sun).setStrokeStyle(I.starLine, COLORS.indigo).setDepth(H.depth));
      return;
    }
    const base = H.px / this.scene.textures.get('v2_hand').getSourceImage().height;
    // A low target (Go, Yes/No, cards) leaves no room for a hand hanging below it. Then the hand comes from the right, pointing left:
    // its fingertip sits on the target's centre and its body covers no button above it (Word Book) and no stall (the picked fruit).
    const side = this.targets.some((t) => t.y + H.pressPx + H.px > TUNING.gameH);
    // From the right, unless that would leave the screen (Go sits at the right edge): then from below-left, over Go's own face and the grass,
    // clear of the Word Book above and the shelf to the left. u points from the fingertip along the hand's body.
    const u = !side ? { x: 0, y: 1 } : this.targets.some((t) => t.x + H.pressPx + H.px > TUNING.gameW) ? { x: -Math.SQRT1_2, y: Math.SQRT1_2 } : { x: 1, y: 0 };
    const rest = (t: Pt): Pt => ({ x: t.x + u.x * H.pressPx, y: t.y + u.y * H.pressPx });
    // Each sweep starts at a random option, so the first press is not always the same one (Yes, the safe door). The order stays cyclic.
    const n = this.targets.length;
    const s0 = Math.floor(Math.random() * n);
    const order = this.targets.map((_, i) => this.targets[(s0 + i) % n]!);
    const first = rest(order[0]!);
    const hand = this.scene.add.image(first.x, first.y, 'v2_hand').setOrigin(0.5, 0).setAngle(Phaser.Math.RadToDeg(Math.atan2(-u.x, u.y))).setScale(base).setDepth(H.depth);
    this.shown = [hand];
    // Each target: glide to it, press onto it, lift. The chain loops forever, so the hand never settles on one target.
    const steps = order.flatMap((t, i): Phaser.Types.Tweens.TweenBuilderConfig[] => {
      const from = rest(order[(i + n - 1) % n]!);
      const at = rest(t);
      return [
        ...(n > 1 ? [{ targets: hand, x: { from: from.x, to: at.x }, y: { from: from.y, to: at.y }, duration: H.sweepMs, ease: 'Sine.InOut' }] : []),
        { targets: hand, x: { from: at.x, to: t.x }, y: { from: at.y, to: t.y }, scale: { from: base, to: base * H.pressScale }, duration: H.pressMs, ease: 'Sine.Out' },
        { targets: hand, x: { from: t.x, to: at.x }, y: { from: t.y, to: at.y }, scale: { from: base * H.pressScale, to: base }, duration: H.liftMs, ease: 'Sine.In', completeDelay: H.restMs },
      ];
    });
    this.tween = this.scene.tweens.chain({ tweens: steps, loop: -1 });
  }
}
