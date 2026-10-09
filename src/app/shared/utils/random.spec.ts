import { randomInt, shuffle } from './random';

describe('randomInt', () => {
  it('returns min when the random source yields 0', () => {
    expect(randomInt(200, 300, () => 0)).toBe(200);
  });

  it('returns max when the random source yields a value just below 1', () => {
    expect(randomInt(200, 300, () => 0.999999)).toBe(300);
  });

  it('stays within bounds for real random values', () => {
    for (let i = 0; i < 1000; i++) {
      const value = randomInt(200, 300);
      expect(value).toBeGreaterThanOrEqual(200);
      expect(value).toBeLessThanOrEqual(300);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('throws when min is greater than max', () => {
    expect(() => randomInt(5, 1)).toThrow(RangeError);
  });
});

describe('shuffle', () => {
  it('returns a new array with the same elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);

    expect(result).not.toBe(input);
    expect([...result].sort()).toEqual(input);
  });

  it('does not mutate the input', () => {
    const input = [1, 2, 3];
    shuffle(input, () => 0);
    expect(input).toEqual([1, 2, 3]);
  });

  it('is deterministic for a given random source', () => {
    expect(shuffle([1, 2, 3, 4], () => 0)).toEqual([2, 3, 4, 1]);
  });

  it('handles empty and single-element arrays', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle(['a'])).toEqual(['a']);
  });
});
