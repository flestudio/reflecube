import { describe, expect, test } from "vite-plus/test";

import { type Random, createRandom, nextFloat, nextInt, pick, shuffle } from "./random";

const floats = (random: Random, count: number): number[] => {
  if (count === 0) return [];
  const { value, random: next } = nextFloat(random);
  return [value, ...floats(next, count - 1)];
};

describe("nextFloat", () => {
  test("is deterministic for a seed", () => {
    expect(floats(createRandom(42), 10)).toEqual(floats(createRandom(42), 10));
  });

  test("differs between seeds", () => {
    expect(floats(createRandom(1), 10)).not.toEqual(floats(createRandom(2), 10));
  });

  test("advances the state", () => {
    const random = createRandom(42);
    expect(nextFloat(random).random).not.toEqual(random);
    expect(new Set(floats(random, 100)).size).toBe(100);
  });

  test("yields values in [0, 1)", () => {
    expect(floats(createRandom(7), 1000).every((n) => n >= 0 && n < 1)).toBe(true);
  });
});

describe("nextInt", () => {
  test("stays below the bound", () => {
    const values = floats(createRandom(7), 200).map((_, i) => nextInt(createRandom(i), 5).value);
    expect(new Set(values)).toEqual(new Set([0, 1, 2, 3, 4]));
  });
});

describe("pick", () => {
  test("returns one of the items", () => {
    expect(["a", "b", "c"]).toContain(pick(createRandom(3), ["a", "b", "c"]).value);
  });

  test("rejects an empty list", () => {
    expect(() => pick(createRandom(3), [])).toThrow(RangeError);
  });
});

describe("shuffle", () => {
  const items = [1, 2, 3, 4, 5, 6];

  test("returns a permutation", () => {
    expect(shuffle(createRandom(3), items).value.toSorted((a, b) => a - b)).toEqual(items);
  });

  test("leaves the input untouched", () => {
    shuffle(createRandom(3), items);
    expect(items).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test("depends on the seed", () => {
    const orders = [...Array(20)].map((_, seed) => shuffle(createRandom(seed), items).value.join());
    expect(new Set(orders).size).toBeGreaterThan(1);
  });
});
