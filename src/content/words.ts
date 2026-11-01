import type { FruitId, WordId } from '../core/types';

export type ClueId = 'yellow' | 'orange' | 'green' | 'long' | 'round' | FruitId;
export type WordDef = { id: WordId; kind: 'fruit' | 'color'; answer: FruitId; others: [FruitId, FruitId]; clues: ClueId[] };

/** Learning order, spec 8. */
export const WORDS: readonly WordDef[] = [
  { id: 'apple', kind: 'fruit', answer: 'apple', others: ['banana', 'orange'], clues: [] },
  { id: 'banana', kind: 'fruit', answer: 'banana', others: ['apple', 'orange'], clues: ['yellow', 'long'] },
  { id: 'orange', kind: 'fruit', answer: 'orange', others: ['apple', 'banana'], clues: ['orange', 'round'] },
  { id: 'lemon', kind: 'fruit', answer: 'lemon', others: ['banana', 'orange'], clues: ['yellow', 'round'] },
  { id: 'grape', kind: 'fruit', answer: 'grape', others: ['apple', 'lemon'], clues: ['green'] },
  { id: 'red', kind: 'color', answer: 'apple', others: ['banana', 'grape'], clues: ['apple'] },
  { id: 'yellow', kind: 'color', answer: 'banana', others: ['apple', 'grape'], clues: ['banana'] },
  { id: 'green', kind: 'color', answer: 'grape', others: ['apple', 'orange'], clues: ['grape'] },
];

export function wordDef(w: WordId): WordDef {
  const d = WORDS.find((x) => x.id === w);
  if (!d) throw new Error(`unknown word ${w}`);
  return d;
}

export const ITEM_COLOR: Record<FruitId, 'red' | 'yellow' | 'orange' | 'green'> = {
  apple: 'red', banana: 'yellow', lemon: 'yellow', orange: 'orange', grape: 'green',
};
