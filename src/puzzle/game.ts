import { type Tile, isInside, traceLaser } from "./board";
import type { Puzzle } from "./generate";
import { minoCellsAt } from "./mino";
import { type Vec3, keyOf } from "./vector";

export type Game = {
  puzzle: Puzzle;
  positions: (Vec3 | undefined)[];
  held: number | undefined;
};

export type Action =
  | { type: "hold"; index: number }
  | { type: "drop"; anchor: Vec3 }
  | { type: "release" };

export const createGame = (puzzle: Puzzle): Game => ({
  puzzle,
  positions: puzzle.minos.map(() => undefined),
  held: undefined,
});

export const boardOf = ({ puzzle, positions }: Game) => {
  const entries = puzzle.minos.flatMap((mino, i) => {
    const anchor = positions.at(i);
    if (anchor === undefined) return [];

    return minoCellsAt(mino, anchor).map(({ position, tile }) => {
      return [keyOf(position), tile] satisfies [string, Tile];
    });
  });

  return new Map(entries);
};

export const canPlace = (game: Game, index: number, anchor: Vec3) => {
  const mino = game.puzzle.minos.at(index);
  if (mino === undefined) return false;

  const others = boardOf({ ...game, positions: game.positions.with(index, undefined) });

  return minoCellsAt(mino, anchor).every(({ position }) => {
    return isInside(position, game.puzzle.size) && !others.has(keyOf(position));
  });
};

export const withGhost = (game: Game, ghost: Vec3 | undefined) => {
  if (game.held === undefined || ghost === undefined) return game;
  return { ...game, positions: game.positions.with(game.held, ghost) };
};

export const traceLasers = (game: Game) => {
  const board = boardOf(game);
  return game.puzzle.lasers.map(({ start }) => traceLaser(board, start, game.puzzle.size));
};

export const isSolved = (game: Game) => {
  const isAllPlaced = game.held === undefined && !game.positions.includes(undefined);
  if (!isAllPlaced) return false;

  const lit = new Set(traceLasers(game).flatMap(({ cells }) => cells.map(keyOf)));
  return [...boardOf(game).keys()].every((key) => lit.has(key));
};

export const reduce = (game: Game, action: Action) => {
  if (action.type === "hold") {
    const positions = game.positions.with(action.index, undefined);
    return { ...game, held: action.index, positions };
  }

  if (action.type === "release") return { ...game, held: undefined };

  if (game.held === undefined || !canPlace(game, game.held, action.anchor)) return game;

  const positions = game.positions.with(game.held, action.anchor);
  return { ...game, held: undefined, positions };
};
