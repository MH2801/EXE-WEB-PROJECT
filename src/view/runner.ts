import type { Effect } from '../core/mission';

export type Handlers = { [K in Effect['t']]: (e: Extract<Effect, { t: K }>) => Promise<void> | void };

export async function runEffects(effects: Effect[], h: Handlers): Promise<void> {
  for (const e of effects) {
    try {
      await (h[e.t] as (e: Effect) => Promise<void> | void)(e);
    } catch (err) {
      console.error(err); // one bad effect must not stop the mission
    }
  }
}
