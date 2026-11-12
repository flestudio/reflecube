export type Random = { state: number };

export type Randomized<T> = {
  value: T;
  random: Random;
};

export const createRandom = (seed: number) => ({ state: seed >>> 0 });

export const nextFloat = ({ state }: Random) => {
  const next = (state + 0x6d2b79f5) >>> 0;
  const a = Math.imul(next ^ (next >>> 15), next | 1);
  const b = a ^ (a + Math.imul(a ^ (a >>> 7), a | 61));
  return { value: ((b ^ (b >>> 14)) >>> 0) / 2 ** 32, random: { state: next } };
};

export const nextInt = (random: Random, max: number) => {
  const float = nextFloat(random);
  return { value: Math.floor(float.value * max), random: float.random };
};

export const pick = <T>(random: Random, items: T[]) => {
  const index = nextInt(random, items.length);
  const value = items.at(index.value);
  if (value === undefined) throw new RangeError("cannot pick from an empty list");
  return { value, random: index.random };
};

const nextFloats = (random: Random, count: number) => {
  return [...Array(count)].reduce<Randomized<number[]>>(
    (acc) => {
      const float = nextFloat(acc.random);
      return { value: [...acc.value, float.value], random: float.random };
    },
    { value: [], random },
  );
};

export const shuffle = <T>(random: Random, items: T[]) => {
  const orders = nextFloats(random, items.length);
  const value = items
    .map((item, i) => ({ item, order: orders.value.at(i) ?? 0 }))
    .toSorted((a, b) => a.order - b.order)
    .map(({ item }) => item);
  return { value, random: orders.random };
};
