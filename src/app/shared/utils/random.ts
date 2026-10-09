/** Source of randomness in the `[0, 1)` range. Injectable as a parameter to keep callers testable. */
export type RandomFn = () => number;

/** Returns a random integer between `min` and `max`, both inclusive. */
export function randomInt(min: number, max: number, random: RandomFn = Math.random): number {
  if (min > max) {
    throw new RangeError(`randomInt: min (${min}) must not be greater than max (${max})`);
  }
  return Math.floor(random() * (max - min + 1)) + min;
}

/** Returns a shuffled copy of `items` (Fisher–Yates). The input array is not mutated. */
export function shuffle<T>(items: readonly T[], random: RandomFn = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
