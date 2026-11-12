import { describe, expect, test } from "vite-plus/test";

import type { Tile } from "./board";
import { type Action, type Game, boardOf, canPlace, createGame, isSolved, reduce } from "./game";
import type { Puzzle } from "./generate";
import { mirrorBetween } from "./mirror";
import { vec3 } from "./vector";

const straight = (tile: Tile = null) => [
  { offset: vec3(0, 0, 0), tile },
  { offset: vec3(-1, 0, 0), tile: null },
  { offset: vec3(1, 0, 0), tile: null },
];

const PUZZLE = {
  size: 3,
  lasers: [{ start: vec3(-1, 0, 0), end: vec3(3, 0, 0) }],
  minos: [straight(), straight()],
  solution: [vec3(1, 0, 0), vec3(1, 1, 0)],
} satisfies Puzzle;

const play = (...actions: Action[]) => actions.reduce(reduce, createGame(PUZZLE));

const placed = (...positions: Game["positions"]) => ({ ...createGame(PUZZLE), positions });

describe("reduce", () => {
  test("starts with every mino in the inventory", () => {
    expect(createGame(PUZZLE)).toEqual({
      puzzle: PUZZLE,
      positions: [undefined, undefined],
      held: undefined,
    });
  });

  test("drops the held mino at a free anchor", () => {
    const game = play({ type: "hold", index: 1 }, { type: "drop", anchor: vec3(1, 2, 2) });
    expect(game.positions).toEqual([undefined, vec3(1, 2, 2)]);
    expect(game.held).toBeUndefined();
  });

  test("ignores a drop outside the cube", () => {
    const held = play({ type: "hold", index: 0 });
    expect(reduce(held, { type: "drop", anchor: vec3(0, 0, 0) })).toBe(held);
  });

  test("ignores a drop onto another mino", () => {
    const held = play(
      { type: "hold", index: 0 },
      { type: "drop", anchor: vec3(1, 0, 0) },
      { type: "hold", index: 1 },
    );
    expect(reduce(held, { type: "drop", anchor: vec3(1, 0, 0) })).toBe(held);
  });

  test("ignores a drop while nothing is held", () => {
    const game = createGame(PUZZLE);
    expect(reduce(game, { type: "drop", anchor: vec3(1, 1, 1) })).toBe(game);
  });

  test("picks a placed mino back up", () => {
    const game = play(
      { type: "hold", index: 0 },
      { type: "drop", anchor: vec3(1, 0, 0) },
      { type: "hold", index: 0 },
    );
    expect(game.positions).toEqual([undefined, undefined]);
    expect(game.held).toBe(0);
  });

  test("returns the held mino to the inventory on release", () => {
    expect(play({ type: "hold", index: 0 }, { type: "release" })).toEqual(createGame(PUZZLE));
  });
});

describe("canPlace", () => {
  const game = placed(vec3(1, 0, 0), undefined);

  test("allows a mino to move within its own cells", () => {
    expect(canPlace(game, 0, vec3(1, 0, 1))).toBe(true);
  });

  test("rejects cells taken by another mino", () => {
    expect(canPlace(game, 1, vec3(1, 0, 0))).toBe(false);
  });

  test("rejects an unknown mino", () => {
    expect(canPlace(game, 5, vec3(1, 1, 1))).toBe(false);
  });
});

describe("boardOf", () => {
  test("collects the tiles of placed minos", () => {
    const mirror = mirrorBetween(vec3(1, 0, 0), vec3(0, 1, 0));
    const game = {
      ...createGame({ ...PUZZLE, minos: [straight(mirror), straight()] }),
      positions: [vec3(1, 1, 1), undefined],
    };
    expect([...boardOf(game)]).toEqual([
      ["1,1,1", mirror],
      ["0,1,1", null],
      ["2,1,1", null],
    ]);
  });
});

describe("isSolved", () => {
  test("needs every mino on the board", () => {
    expect(isSolved(placed(vec3(1, 0, 0), undefined))).toBe(false);
  });

  test("needs every placed cell to be lit", () => {
    expect(isSolved(placed(vec3(1, 0, 0), vec3(1, 2, 2)))).toBe(false);
  });

  test("passes when lasers cross every placed cell", () => {
    const lasers = [...PUZZLE.lasers, { start: vec3(-1, 1, 0), end: vec3(3, 1, 0) }];
    const game = { ...createGame({ ...PUZZLE, lasers }), positions: PUZZLE.solution };
    expect(isSolved(game)).toBe(true);
  });

  test("fails while a mino is held", () => {
    expect(isSolved({ ...placed(...PUZZLE.solution), held: 0 })).toBe(false);
  });
});
