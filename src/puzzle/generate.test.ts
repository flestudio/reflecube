import { describe, expect, test } from "vite-plus/test";

import { isInside, portsOf } from "./board";
import { createGame, isSolved, traceLasers } from "./game";
import { RULES, generatePuzzle } from "./generate";
import { minoCellsAt } from "./mino";
import { keyOf } from "./vector";

const SEEDS = [...Array(50)].map((_, i) => 20260101 + i * 37);

describe("generatePuzzle", () => {
  test("is deterministic for a seed", () => {
    expect(generatePuzzle(20261112)).toEqual(generatePuzzle(20261112));
  });

  test("differs between seeds", () => {
    expect(generatePuzzle(20261112)).not.toEqual(generatePuzzle(20261113));
  });

  test.for(SEEDS)("seed %i follows the rules", (seed) => {
    const puzzle = generatePuzzle(seed);
    expect(puzzle.size).toBe(RULES.size);
    expect(puzzle.minos).toHaveLength(RULES.minoCount);
    expect(puzzle.minos.every((mino) => mino.length === 3)).toBe(true);
    expect(puzzle.minos.flat().filter(({ tile }) => tile !== null)).toHaveLength(RULES.mirrorCount);

    const ports = new Set(portsOf(puzzle.size).map(keyOf));
    const endpoints = puzzle.lasers.flatMap(({ start, end }) => [keyOf(start), keyOf(end)]);
    expect(endpoints.every((key) => ports.has(key))).toBe(true);
    expect(new Set(endpoints).size).toBe(endpoints.length);
  });

  test.for(SEEDS)("seed %i is solved by its solution", (seed) => {
    const puzzle = generatePuzzle(seed);
    const solved = { ...createGame(puzzle), positions: puzzle.solution };
    expect(isSolved(solved)).toBe(true);
    expect(traceLasers(solved).map(({ exit }) => exit)).toEqual(
      puzzle.lasers.map(({ end }) => end),
    );
  });

  test.for(SEEDS)("seed %i places the solution without overlaps", (seed) => {
    const puzzle = generatePuzzle(seed);
    const cells = puzzle.solution.flatMap((anchor, i) => {
      return minoCellsAt(puzzle.minos.at(i) ?? [], anchor).map(({ position }) => position);
    });
    expect(cells).toHaveLength(RULES.minoCount * 3);
    expect(cells.every((cell) => isInside(cell, puzzle.size))).toBe(true);
    expect(new Set(cells.map(keyOf)).size).toBe(cells.length);
  });
});
