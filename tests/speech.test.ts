import { describe, it, expect, vi } from 'vitest';
import { createSpeaker, lineDeadlineMs, type SpeechDeps } from '../src/view/speech';
import { LINES } from '../src/content/lines';
import { TUNING } from '../src/content/tuning';

vi.mock('../src/content/audio-manifest', () => ({ RECORDED: ['mom.ask'] }));

function setup(opts: { synth?: boolean; voices?: { lang: string; localService?: boolean }[]; fileFails?: boolean; fileDone?: boolean; stopThrows?: boolean } = {}) {
  const timers: { ms: number; fn: () => void; live: boolean }[] = [];
  const utterances: Record<string, unknown>[] = [];
  const synth = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => (opts.voices ?? [{ lang: 'en-US', localService: true }]) as SpeechSynthesisVoice[]),
  };
  const stop = vi.fn(() => {
    if (opts.stopThrows) throw new Error('stop');
  });
  const filePause = vi.fn();
  const fileResume = vi.fn();
  const playFile = vi.fn(() => ({
    pause: filePause,
    resume: fileResume,
    done: opts.fileFails ? Promise.reject(new Error('x')) : opts.fileDone ? Promise.resolve() : new Promise<void>(() => {}),
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
  return { speaker: createSpeaker(deps), synth, playFile, stop, timers, utterances, fire, filePause, fileResume };
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

  it('pause and resume reach a playing recorded file, not an ended one', () => {
    const f = setup();
    void f.speaker.say('mom.ask');
    f.speaker.pause();
    f.speaker.resume();
    expect(f.filePause).toHaveBeenCalledTimes(1);
    expect(f.fileResume).toHaveBeenCalledTimes(1);
    f.speaker.skip();
    f.speaker.pause();
    expect(f.filePause).toHaveBeenCalledTimes(1);
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
    const f = setup({ voices: [{ lang: 'fr-FR', localService: true }, { lang: 'en-GB', localService: true }, { lang: 'en-US', localService: true }] });
    void f.speaker.say(SYNTH_ID);
    const u = f.utterances[0]!;
    expect(u.voice).toEqual({ lang: 'en-US', localService: true });
    expect(u.pitch).toBe(TUNING.pitch.mimi);
    expect(u.rate).toBe(TUNING.speechRate);
    const g = setup({ voices: [{ lang: 'fr-FR', localService: true }, { lang: 'en-GB', localService: true }] });
    void g.speaker.say('mom.thanks');
    expect(g.utterances[0]!.voice).toEqual({ lang: 'en-GB', localService: true });
    expect(g.utterances[0]!.pitch).toBe(TUNING.pitch.mom);
    const h = setup({ voices: [{ lang: 'fr-FR', localService: true }] });
    void h.speaker.say(SYNTH_ID);
    expect(h.synth.speak).not.toHaveBeenCalled(); // no English local voice
  });

  it('recorded file that finishes resolves the line', async () => {
    const f = setup({ fileDone: true });
    expect(await settled(f.speaker.say('mom.ask'))).toBe(true);
    expect(f.synth.speak).not.toHaveBeenCalled();
  });

  it('throwing file stop still resolves and next say plays', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const f = setup({ stopThrows: true });
    const p1 = f.speaker.say('mom.ask');
    const p2 = f.speaker.say(SYNTH_ID);
    expect(await settled(p1)).toBe(true);
    expect(f.synth.speak).toHaveBeenCalledTimes(1);
    expect(await settled(p2)).toBe(false);
    f.fire();
    expect(await settled(p2)).toBe(true);
    err.mockRestore();
  });

  it('stale end from an earlier line does not resolve the next', async () => {
    const f = setup();
    void f.speaker.say(SYNTH_ID);
    const staleEnd = f.utterances[0]!.onend as () => void;
    const p2 = f.speaker.say('mimi.what');
    staleEnd();
    f.timers[0]!.fn(); // stale deadline of line A
    expect(await settled(p2)).toBe(false);
  });

  it('always sets lang en-US', () => {
    const f = setup();
    void f.speaker.say(SYNTH_ID);
    expect(f.utterances[0]!.lang).toBe('en-US');
  });

  it('network-only voices: never speaks, the line still ends on its deadline', async () => {
    const t = setup({ voices: [{ lang: 'en-US', localService: false }] });
    const p = t.speaker.say(SYNTH_ID);
    expect(t.synth.speak).not.toHaveBeenCalled();
    expect(await settled(p)).toBe(false);
    t.fire();
    expect(await settled(p)).toBe(true);
  });

  it('prefers a local voice over a network one', () => {
    const net = { lang: 'en-US', localService: false };
    const local = { lang: 'en-GB', localService: true };
    const t = setup({ voices: [net, local] });
    void t.speaker.say(SYNTH_ID);
    expect(t.utterances[0]!.voice).toBe(local);
  });
});
