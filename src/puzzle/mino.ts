import type { Tile } from "./board";
import { AXES, DIRECTIONS, type Vec3, add, axisOf, scale, vec3 } from "./vector";

export type MinoCell = {
  offset: Vec3;
  tile: Tile;
};

export type Mino = MinoCell[];

export type Shape = [Vec3, Vec3, Vec3];

const ORIGIN = vec3(0, 0, 0);

export const SHAPES = DIRECTIONS.flatMap((first, i) => {
  return DIRECTIONS.slice(i + 1).map((second) => [ORIGIN, first, second] satisfies Shape);
});

export const cellsAt = (offsets: Vec3[], anchor: Vec3) => {
  return offsets.map((offset) => add(anchor, offset));
};

export const minoCellsAt = (mino: Mino, anchor: Vec3) => {
  return mino.map(({ offset, tile }) => ({ position: add(anchor, offset), tile }));
};

export const centerOf = (cells: Vec3[]) => scale(cells.reduce(add, ORIGIN), 1 / cells.length);

export const jointsOf = (cells: Vec3[]) => {
  return cells.flatMap((a, i) => {
    const neighbors = cells.slice(i + 1).filter((b) => {
      const distance = AXES.reduce((sum, axis) => sum + Math.abs(a[axis] - b[axis]), 0);
      return distance === 1;
    });

    return neighbors.map((b) => ({
      center: centerOf([a, b]),
      axis: axisOf(add(b, scale(a, -1))),
    }));
  });
};
