import type { Effect } from '../core/mission';

export type Handlers<E extends { t: string } = Effect> = { [K in E['t']]: (e: Extract<E, { t: K }>) => Promise<void> | void };

export async function runEffects<E extends { t: string }>(effects: E[], h: Handlers<E>): Promise<void> {
  for (const e of effects) {
    try {
      await (h[e.t as E['t']] as (e: E) => Promise<void> | void)(e);
    } catch (err) {
      console.error(err); // one bad effect must not stop the run
    }
  }
}
