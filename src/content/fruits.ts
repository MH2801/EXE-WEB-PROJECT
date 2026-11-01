import type { FruitId, WrongFruit } from '../core/types';
import type { LineId } from './lines';

export const NPC_ELIMINATE_ORDER: WrongFruit[] = ['orange', 'lemon', 'grape', 'banana'];
export const RECALL_FRUITS: FruitId[] = ['apple', 'banana', 'grape'];

export function npcLine(fruit: FruitId): LineId {
  return `npc.${fruit}`;
}

export function heardLine(fruit: WrongFruit): LineId {
  return `mimi.heard_${fruit}`;
}
