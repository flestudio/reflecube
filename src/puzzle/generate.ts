import { type Tile, cellsOf, inward, isInside, portsOf } from "./board";
import { type Mino, SHAPES, cellsAt } from "./mino";
import { type Mirror, mirrorBetween, reflect } from "./mirror";
import { type Random, createRandom, nextFloat, nextInt, pick, shuffle } from "./random";
import { DIRECTIONS, type Vec3, add, axisOf, keyOf } from "./vector";

export type Laser = {
  start: Vec3;
  end: Vec3;
};

export type Puzzle = {
  size: number;
  lasers: Laser[];
  minos: Mino[];
  solution: Vec3[];
};

export type Rules = {
  size: number;
  minoCount: number;
  mirrorCount: number;
};

export const RULES = { size: 3, minoCount: 4, mirrorCount: 6 } satisfies Rules;

const MIRROR_CHANCE = 0.5;

type Beam = {
  mirrors: ReadonlyMap<string, Mirror>;
  lit: ReadonlySet<string>;
  remaining: number;
  position: Vec3;
  direction: Vec3;
  random: Random;
};

type Placement = {
  anchor: Vec3;
  offsets: Vec3[];
  keys: string[];
};

const turn = (beam: Beam, size: number) => {
  const key = keyOf(beam.position);
  const mirror = beam.mirrors.get(key);
  if (mirror !== undefined) return { ...beam, direction: reflect(beam.direction, mirror) };

  const canAddMirror = beam.remaining > 0 && !beam.lit.has(key);
  if (!canAddMirror) return beam;

  const isLeaving = !isInside(add(beam.position, beam.direction), size);
  const chance = nextFloat(beam.random);
  if (!isLeaving && chance.value >= MIRROR_CHANCE) return { ...beam, random: chance.random };

  const sideways = DIRECTIONS.filter((direction) => {
    const isTurn = axisOf(direction) !== axisOf(beam.direction);
    return isTurn && isInside(add(beam.position, direction), size);
  });
  const turned = pick(chance.random, sideways);
  const added = mirrorBetween(beam.direction, turned.value);

  return {
    ...beam,
    mirrors: new Map([...beam.mirrors, [key, added]]),
    remaining: beam.remaining - 1,
    direction: turned.value,
    random: turned.random,
  };
};

const advance = (beam: Beam, size: number): Beam => {
  if (!isInside(beam.position, size)) return beam;

  const turned = turn(beam, size);
  const next = {
    ...turned,
    lit: new Set([...turned.lit, keyOf(beam.position)]),
    position: add(beam.position, turned.direction),
  };

  return advance(next, size);
};

const drawLaser = (
  drawn: Pick<Beam, "mirrors" | "lit" | "random">,
  start: Vec3,
  mirrorCount: number,
  size: number,
) => {
  const direction = inward(start, size);
  const initial = { ...drawn, remaining: mirrorCount, position: add(start, direction), direction };
  const beam = advance(initial, size);

  return beam.remaining === 0 ? beam : undefined;
};

const placementsOn = (board: ReadonlyMap<string, Tile>, size: number) => {
  const all = cellsOf(size).flatMap((anchor) => {
    return SHAPES.map((offsets) => ({
      anchor,
      offsets,
      keys: cellsAt(offsets, anchor).map(keyOf),
    }));
  });

  return all.filter(({ keys }) => keys.every((key) => board.has(key)));
};

const placeMinos = (
  board: ReadonlyMap<string, Tile>,
  size: number,
  count: number,
  random: Random,
) => {
  const candidates = shuffle(random, placementsOn(board, size));
  const mirrorKeys = [...board].filter(([, tile]) => tile !== null).map(([key]) => key);

  const choose = (chosen: Placement[], used: ReadonlySet<string>): Placement[] | undefined => {
    const uncovered = mirrorKeys.find((key) => !used.has(key));
    if (chosen.length === count) return uncovered === undefined ? chosen : undefined;

    const options = candidates.value.filter(({ keys }) => {
      const isFree = keys.every((key) => !used.has(key));
      const coversMirror = uncovered === undefined || keys.includes(uncovered);
      return isFree && coversMirror;
    });

    return options.reduce<Placement[] | undefined>((found, option) => {
      return found ?? choose([...chosen, option], new Set([...used, ...option.keys]));
    }, undefined);
  };

  const found = choose([], new Set());
  return found === undefined ? undefined : shuffle(candidates.random, found);
};

const attempt = ({ size, minoCount, mirrorCount }: Rules, random: Random) => {
  const ports = shuffle(random, portsOf(size));
  const [first, second] = ports.value;
  if (first === undefined || second === undefined) return undefined;

  const half = Math.ceil(mirrorCount / 2);
  const extra = nextInt(ports.random, mirrorCount - half + 1);
  const firstMirrorCount = half + extra.value;
  const empty = {
    mirrors: new Map<string, Mirror>(),
    lit: new Set<string>(),
    random: extra.random,
  };

  const a = drawLaser(empty, first, firstMirrorCount, size);
  if (a === undefined) return undefined;

  const b = drawLaser(a, second, mirrorCount - firstMirrorCount, size);
  if (b === undefined) return undefined;

  const lasers = [
    { start: first, end: a.position },
    { start: second, end: b.position },
  ];
  const endpoints = lasers.flatMap(({ start, end }) => [keyOf(start), keyOf(end)]);
  if (new Set(endpoints).size !== endpoints.length) return undefined;

  const board = new Map(
    [...b.lit].map((key) => [key, b.mirrors.get(key) ?? null] satisfies [string, Tile]),
  );
  const placements = placeMinos(board, size, minoCount, b.random);
  if (placements === undefined) return undefined;

  const minos = placements.value.map(({ anchor, offsets }) => {
    return offsets.map((offset) => ({
      offset,
      tile: board.get(keyOf(add(anchor, offset))) ?? null,
    }));
  });
  const solution = placements.value.map(({ anchor }) => anchor);

  return { size, lasers, minos, solution } satisfies Puzzle;
};

const retry = (rules: Rules, random: Random): Puzzle => {
  const seed = nextInt(random, 2 ** 32);
  return attempt(rules, createRandom(seed.value)) ?? retry(rules, seed.random);
};

export const generatePuzzle = (seed: number, rules: Rules = RULES) => {
  return retry(rules, createRandom(seed));
};
