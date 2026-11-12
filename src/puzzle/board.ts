import { type Mirror, reflect } from "./mirror";
import { AXES, type Vec3, add, keyOf, mapAxes, vec3 } from "./vector";

export type Tile = Mirror | null;
export type Board = ReadonlyMap<string, Tile>;

export type LaserPath = {
  cells: Vec3[];
  exit: Vec3;
};

const lattice = (from: number, to: number) => {
  const values = [...Array(to - from)].map((_, i) => from + i);
  return values.flatMap((x) => values.flatMap((y) => values.map((z) => vec3(x, y, z))));
};

const outsideAxes = (position: Vec3, size: number) => {
  return AXES.filter((axis) => position[axis] < 0 || position[axis] >= size);
};

export const isInside = (position: Vec3, size: number) => outsideAxes(position, size).length === 0;

export const cellsOf = (size: number) => lattice(0, size);

export const portsOf = (size: number) => {
  return lattice(-1, size + 1).filter((position) => outsideAxes(position, size).length === 1);
};

export const inward = (port: Vec3, size: number) => {
  return mapAxes((axis) => {
    if (port[axis] < 0) return 1;
    if (port[axis] >= size) return -1;
    return 0;
  });
};

const trace = (
  board: Board,
  size: number,
  position: Vec3,
  direction: Vec3,
  cells: Vec3[],
): LaserPath => {
  if (!isInside(position, size)) return { cells, exit: position };

  const tile = board.get(keyOf(position)) ?? null;
  const turned = tile === null ? direction : reflect(direction, tile);

  return trace(board, size, add(position, turned), turned, [...cells, position]);
};

export const traceLaser = (board: Board, start: Vec3, size: number) => {
  const direction = inward(start, size);
  return trace(board, size, add(start, direction), direction, []);
};
