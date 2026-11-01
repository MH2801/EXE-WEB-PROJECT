export type FruitId = 'lemon' | 'apple' | 'banana' | 'grape' | 'orange';
export const FRUITS: readonly FruitId[] = ['lemon', 'apple', 'banana', 'grape', 'orange'];
export type WordId = FruitId | 'red' | 'yellow' | 'green';
export type WrongFruit = Exclude<FruitId, 'apple'>;
export type Knowledge = {
  apple: 'unknown' | 'learned';
  belief: FruitId | null;
  notApple: WrongFruit[];
  learnedFrom: 'child' | 'mom' | null;
};
export type BookWord = 'apple' | 'red' | 'round';
export type Stats = {
  bookOpens: number;
  heardWords: BookWord[];
  maxSupport: 0 | 1 | 2 | 3;
  wrongTrips: number;
  recallFirstTry: boolean | null;
};
export type Save = {
  knowledge: Omit<Knowledge, 'belief'>;
  missionDone: boolean;
  stats: Stats;
  viSubtitles: boolean;
};
