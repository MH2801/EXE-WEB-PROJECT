import { describe, it, expect, vi } from 'vitest';
import { runEffects, type Handlers } from '../src/view/runner';

const noop = () => {};
// Any effect without a handler in `over` is a no-op.
function handlers(over: Partial<Handlers>): Handlers {
  return new Proxy(over as Handlers, { get: (t, k) => (t as never)[k] ?? noop });
}

describe('runEffects', () => {
  it('runs effects in order', async () => {
    const log: string[] = [];
    await runEffects(
      [{ t: 'save' }, { t: 'celebrate' }, { t: 'save' }],
      handlers({ save: () => void log.push('save'), celebrate: () => void log.push('celebrate') }),
    );
    expect(log).toEqual(['save', 'celebrate', 'save']);
  });

  it('waits for async handler', async () => {
    const log: string[] = [];
    await runEffects(
      [{ t: 'wait', ms: 1 }, { t: 'save' }],
      handlers({
        wait: async () => {
          await new Promise((r) => setTimeout(r, 10));
          log.push('wait');
        },
        save: () => void log.push('save'),
      }),
    );
    expect(log).toEqual(['wait', 'save']);
  });

  it('throwing handler does not stop the rest', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(noop);
    const log: string[] = [];
    await runEffects(
      [{ t: 'celebrate' }, { t: 'wait', ms: 1 }, { t: 'save' }],
      handlers({
        celebrate: () => {
          throw new Error('boom');
        },
        wait: () => Promise.reject(new Error('async boom')),
        save: () => void log.push('save'),
      }),
    );
    expect(log).toEqual(['save']);
    expect(err).toHaveBeenCalledTimes(2);
    err.mockRestore();
  });

  it('empty list resolves', async () => {
    await expect(runEffects([], handlers({}))).resolves.toBeUndefined();
  });
});

describe('runEffects generic', () => {
  type Own = { t: 'a'; n: number } | { t: 'b' };
  it('runs a custom effect union and survives a throw', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(noop);
    const log: number[] = [];
    await runEffects<Own>([{ t: 'a', n: 1 }, { t: 'b' }, { t: 'a', n: 2 }], {
      a: (e) => void log.push(e.n),
      b: () => {
        throw new Error('boom');
      },
    });
    expect(log).toEqual([1, 2]);
    expect(err).toHaveBeenCalledTimes(1);
    err.mockRestore();
  });
});
