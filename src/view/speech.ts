import { LINES, type LineId } from '../content/lines';
import { RECORDED } from '../content/audio-manifest';
import { TUNING } from '../content/tuning';

export type Timer = (ms: number, fn: () => void) => () => void;
export type SpeechDeps = {
  synth: Pick<SpeechSynthesis, 'speak' | 'cancel' | 'pause' | 'resume' | 'getVoices'> | null;
  makeUtterance: (text: string) => SpeechSynthesisUtterance;
  playFile: (id: LineId) => { done: Promise<void>; stop: () => void };
  setTimer: Timer;
};

export const lineDeadlineMs = (text: string): number => TUNING.speechBaseMs + text.length * TUNING.speechPerCharMs;

function pickVoice(synth: NonNullable<SpeechDeps['synth']>): SpeechSynthesisVoice | undefined {
  const en = synth.getVoices().filter((v) => /^en/i.test(v.lang));
  return en.find((v) => v.lang.replace('_', '-').toLowerCase() === 'en-us') ?? en[0];
}

export function createSpeaker(deps: SpeechDeps) {
  const { synth, setTimer } = deps;
  let stopCurrent: (() => void) | null = null;

  function skip(): void {
    const stop = stopCurrent;
    stopCurrent = null;
    stop?.();
  }

  function say(id: LineId): Promise<void> {
    skip();
    const { en, speaker } = LINES[id];
    return new Promise<void>((resolve) => {
      let finished = false;
      let stopFile: (() => void) | null = null;
      // Deadline runs on the scene's game clock, so pause (hidden tab) freezes it with the speech.
      const cancelTimer = setTimer(lineDeadlineMs(en), () => end());
      function end(): void {
        if (finished) return;
        finished = true;
        cancelTimer();
        stopFile?.();
        if (stopCurrent === stop) stopCurrent = null;
        try {
          synth?.cancel();
        } catch (e) {
          console.error(e);
        }
        resolve();
      }
      const stop = end;
      stopCurrent = stop;

      function speak(): void {
        if (finished || !synth) return;
        try {
          const u = deps.makeUtterance(en);
          const voice = pickVoice(synth);
          if (voice) u.voice = voice;
          u.pitch = TUNING.pitch[speaker];
          u.rate = TUNING.speechRate;
          u.onend = end;
          u.onerror = end;
          synth.speak(u);
        } catch (e) {
          console.error(e); // the deadline still ends the line
        }
      }

      if (RECORDED.includes(id)) {
        try {
          const f = deps.playFile(id);
          stopFile = f.stop;
          f.done.then(end, speak);
          return;
        } catch (e) {
          console.error(e);
        }
      }
      speak();
    });
  }

  return {
    say,
    skip,
    pause: () => synth?.pause(),
    resume: () => synth?.resume(),
  };
}
