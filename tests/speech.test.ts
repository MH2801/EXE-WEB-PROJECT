import { describe, it, expect, vi } from 'vitest';
import { createSpeaker, lineDeadlineMs, type SpeechDeps } from '../src/view/speech';
import { LINES } from '../src/content/lines';
import { TUNING } from '../src/content/tuning';

vi.mock('../src/content/audio-manifest', () => ({ RECORDED: ['mom.ask'] }));

function setup(opts: { synth?: boolean; voices?: { lang: string }[]; fileFails?: boolean } = {}) {
  const timers: { ms: number; fn: () => void; live: boolean }[] = [];
  const utterances: Record<string, unknown>[] = [];
  const synth = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => (opts.voices ?? []) as SpeechSynthesisVoice[]),
  };
  const stop = vi.fn();
  const playFile = vi.fn(() => ({
    done: opts.fileFails ? Promise.reject(new Error('x')) : new Promise<void>(() => {}),
    stop,
  }));
  const deps: SpeechDeps = {
    synth: opts.synth === false ? null : synth,
    makeUtterance: (text) => {
      const u: Record<string, unknown> = { text };
      utterances.push(u);
      return u as unknown as SpeechSynthesisUtterance;
    },
    playFile,
    setTimer: (ms, fn) => {
      const t = { ms, fn, live: true };
      timers.push(t);
      return () => void (t.live = false);
    },
  };
  const fire = () => timers.filter((t) => t.live).forEach((t) => ((t.live = false), t.fn()));
  return { speaker: createSpeaker(deps), synth, playFile, stop, timers, utterances, fire };
}

const flush = () => new Promise((r) => setTimeout(r, 0));
const settled = async (p: Promise<void>) => {
  let done = false;
  void p.then(() => (done = true));
  await flush();
  return done;
};
const SYNTH_ID = 'mimi.okay' as const;

describe('speech', () => {
  it('deadline formula', () => {
    expect(lineDeadlineMs('abcd')).toBe(1860);
    expect(lineDeadlineMs('abcd')).toBe(TUNING.speechBaseMs + 4 * TUNING.speechPerCharMs);
  });

  it('resolves on utterance end', async () => {
    const f = setup();
    const p = f.speaker.say(SYNTH_ID);
    expect(await settled(p)).toBe(false);
    (f.utterances[0]!.onend as () => void)();
    expect(await settled(p)).toBe(true);
  });

  it('resolves at deadline when end never fires', async () => {
    const f = setup();
    const p = f.speaker.say(SYNTH_ID);
    expect(f.timers[0]!.ms).toBe(lineDeadlineMs(LINES[SYNTH_ID].en));
    expect(await settled(p)).toBe(false);
    f.fire();
    expect(await settled(p)).toBe(true);
  });

  it('resolves at deadline when synth is null', async () => {
    const f = setup({ synth: false });
    const p = f.speaker.say(SYNTH_ID);
    f.fire();
    expect(await settled(p)).toBe(true);
  });

  it('resolves on utterance error', async () => {
    const f = setup();
    const p = f.speaker.say(SYNTH_ID);
    (f.utterances[0]!.onerror as () => void)();
    expect(await settled(p)).toBe(true);
  });

  it('skip resolves now and cancels speech', async () => {
    const f = setup();
    const p = f.speaker.say(SYNTH_ID);
    f.synth.cancel.mockClear();
    f.speaker.skip();
    expect(await settled(p)).toBe(true);
    expect(f.synth.cancel).toHaveBeenCalled();
    expect(f.timers[0]!.live).toBe(false);
  });

  it('skip twice is safe', async () => {
    const f = setup();
    const p = f.speaker.say(SYNTH_ID);
    f.speaker.skip();
    expect(() => f.speaker.skip()).not.toThrow();
    expect(await settled(p)).toBe(true);
  });

  it('new say cancels previous', async () => {
    const f = setup();
    const p1 = f.speaker.say(SYNTH_ID);
    const p2 = f.speaker.say('mimi.what');
    expect(await settled(p1)).toBe(true);
    expect(await settled(p2)).toBe(false);
    expect(f.synth.cancel).toHaveBeenCalled();
    expect(f.synth.speak).toHaveBeenCalledTimes(2);
  });

  it('recorded line uses file not synth', () => {
    const f = setup();
    void f.speaker.say('mom.ask');
    expect(f.playFile).toHaveBeenCalledWith('mom.ask');
    expect(f.synth.speak).not.toHaveBeenCalled();
  });

  it('failed file falls back to synth', async () => {
    const f = setup({ fileFails: true });
    const p = f.speaker.say('mom.ask');
    await flush();
    expect(f.synth.speak).toHaveBeenCalledTimes(1);
    (f.utterances[0]!.onend as () => void)();
    expect(await settled(p)).toBe(true);
  });

  it('pause then resume calls synth once each', () => {
    const f = setup();
    f.speaker.pause();
    f.speaker.resume();
    expect(f.synth.pause).toHaveBeenCalledTimes(1);
    expect(f.synth.resume).toHaveBeenCalledTimes(1);
  });

  it('deadline only runs through injected timer', async () => {
    vi.useFakeTimers();
    try {
      const f = setup();
      let done = false;
      void f.speaker.say(SYNTH_ID).then(() => (done = true));
      await vi.advanceTimersByTimeAsync(60_000);
      expect(done).toBe(false);
      f.fire();
      await vi.advanceTimersByTimeAsync(0);
      expect(done).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('picks an English voice and the speaker pitch', () => {
    const f = setup({ voices: [{ lang: 'fr-FR' }, { lang: 'en-GB' }, { lang: 'en-US' }] });
    void f.speaker.say(SYNTH_ID);
    const u = f.utterances[0]!;
    expect(u.voice).toEqual({ lang: 'en-US' });
    expect(u.pitch).toBe(TUNING.pitch.mimi);
    expect(u.rate).toBe(TUNING.speechRate);
    const g = setup({ voices: [{ lang: 'fr-FR' }, { lang: 'en-GB' }] });
    void g.speaker.say('mom.thanks');
    expect(g.utterances[0]!.voice).toEqual({ lang: 'en-GB' });
    expect(g.utterances[0]!.pitch).toBe(TUNING.pitch.mom);
    const h = setup({ voices: [{ lang: 'fr-FR' }] });
    void h.speaker.say(SYNTH_ID);
    expect(h.utterances[0]!.voice).toBeUndefined();
  });
});
