export const SINGLES = [...Array(20)].map((_, i) => ({ score: 20 - i, display: `${20 - i}` }));
export const DOUBLES = [...Array(20)].map((_, i) => ({ score: 2 * (20 - i), display: `D${20 - i}` }));
export const TRIPLES = [...Array(20)].map((_, i) => ({ score: 3 * (20 - i), display: `T${20 - i}` }));
export const ALL_DARTS = [
  { score: 50, display: 'DB' },
  { score: 25, display: 'B' },
  ...TRIPLES,
  ...DOUBLES,
  ...SINGLES,
];
ALL_DARTS.sort((a, b) => (a.score > b.score ? -1 : 1));

export interface IDart {
  score: number;
  display: string;
}

export const DARTS_TO_CLOSE: Partial<Record<number, IDart[]>> = {};

for (let first of ALL_DARTS) {
  if (!DARTS_TO_CLOSE[first.score]) {
    DARTS_TO_CLOSE[first.score] = [first];
  }
}

for (let first of ALL_DARTS) {
  for (let second of ALL_DARTS) {
    if (!DARTS_TO_CLOSE[first.score + second.score]) {
      DARTS_TO_CLOSE[first.score + second.score] = [first, second];
    }
  }
}

for (let first of ALL_DARTS) {
  for (let second of ALL_DARTS) {
    for (let third of ALL_DARTS) {
      if (!DARTS_TO_CLOSE[first.score + second.score + third.score]) {
        DARTS_TO_CLOSE[first.score + second.score + third.score] = [first, second, third];
      }
    }
  }
}
