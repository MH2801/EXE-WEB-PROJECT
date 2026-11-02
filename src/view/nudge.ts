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
      this.shown = this.targets.map(({ x, y }) => this.scene.add.star(x, y - I.starDy, TUNING.burst.points, I.starPx / 2, I.starPx, COLORS.sun).setDepth(H.depth));
      return;
    }
    const base = H.px / this.scene.textures.get('v2_hand').getSourceImage().height;
    // A target near the bottom edge (Yes/No, cards) would push the hand off screen: then it comes from above, pointing down.
    const down = this.targets.some((t) => t.y + H.pressPx + H.px > TUNING.gameH);
    const rest = (t: Pt): Pt => ({ x: t.x, y: t.y + (down ? -H.pressPx : H.pressPx) });
    const first = rest(this.targets[0]!);
    const hand = this.scene.add.image(first.x, first.y, 'v2_hand').setOrigin(0.5, down ? 1 : 0).setFlipY(down).setScale(base).setDepth(H.depth);
    this.shown = [hand];
    // Each target: glide under it, press onto it, lift. The chain loops forever, so the hand never settles on one target.
    const steps = this.targets.flatMap((t, i): Phaser.Types.Tweens.TweenBuilderConfig[] => {
      const from = rest(this.targets[(i + this.targets.length - 1) % this.targets.length]!);
      const at = rest(t);
      return [
        ...(this.targets.length > 1 ? [{ targets: hand, x: { from: from.x, to: at.x }, y: { from: from.y, to: at.y }, duration: H.sweepMs, ease: 'Sine.InOut' }] : []),
        { targets: hand, y: { from: at.y, to: t.y }, scale: { from: base, to: base * H.pressScale }, duration: H.pressMs, ease: 'Sine.Out' },
        { targets: hand, y: { from: t.y, to: at.y }, scale: { from: base * H.pressScale, to: base }, duration: H.liftMs, ease: 'Sine.In', completeDelay: H.restMs },
      ];
    });
    this.tween = this.scene.tweens.chain({ tweens: steps, loop: -1 });
  }
}
