import { type Camera, Matrix4, Quaternion, Vector3 } from "three";

import { type Board, type LaserPath, cellsOf, inward } from "../puzzle/board";
import { type Game, canPlace } from "../puzzle/game";
import { centerOf, minoCellsAt } from "../puzzle/mino";
import { type Mirror, mirrorNormal } from "../puzzle/mirror";
import {
  AXES,
  type Axis,
  type Vec3,
  add,
  axisOf,
  equals,
  keyOf,
  mapAxes,
  scale,
  unit,
  vec3,
} from "../puzzle/vector";

export type Point = [x: number, y: number, z: number];

export type Pointer = {
  x: number;
  y: number;
};

export type Rect = Pick<DOMRect, "left" | "top" | "width" | "height">;

const FORWARD = new Vector3(0, 0, 1);
const LASER_INSET = 0.06;

export const toPoint = ({ x, y, z }: Vec3) => [x, y, z] satisfies Point;

export const toWorld = (position: Vec3, size: number) => {
  const center = (size - 1) / 2;
  return toPoint(add(position, vec3(-center, -center, -center)));
};

export const portToWorld = (port: Vec3, size: number) => {
  return toWorld(add(port, scale(inward(port, size), 0.5)), size);
};

const heading = (from: Vec3, to: Vec3) => mapAxes((axis) => Math.sign(to[axis] - from[axis]));

export const laserPoints = (start: Vec3, { cells, exit }: LaserPath, size: number) => {
  const points = [
    portToWorld(start, size),
    ...cells.map((cell) => toWorld(cell, size)),
    portToWorld(exit, size),
  ].map(([x, y, z]) => vec3(x, y, z));

  const bevelled = points.flatMap((point, i) => {
    const previous = i === 0 ? undefined : points.at(i - 1);
    const next = points.at(i + 1);
    if (previous === undefined || next === undefined) return [point];

    const incoming = heading(previous, point);
    const outgoing = heading(point, next);
    if (equals(incoming, outgoing)) return [point];

    return [add(point, scale(incoming, -LASER_INSET)), add(point, scale(outgoing, LASER_INSET))];
  });

  return bevelled.map(toPoint);
};

export const grazedSpans = (start: Vec3, { cells }: LaserPath, board: Board, size: number) => {
  return cells.flatMap((cell, i) => {
    const tile = board.get(keyOf(cell)) ?? null;
    const previous = i === 0 ? start : cells.at(i - 1);
    if (tile === null || previous === undefined) return [];

    const direction = heading(previous, cell);
    if (tile.axes.includes(axisOf(direction))) return [];

    const [x, y, z] = toWorld(cell, size);
    const center = vec3(x, y, z);
    return [
      [toPoint(add(center, scale(direction, -0.5))), toPoint(add(center, scale(direction, 0.5)))],
    ];
  });
};

export const sizeAlong = (axis: Axis, along: number, across: number) => {
  return toPoint(mapAxes((other) => (other === axis ? along : across)));
};

export const facing = (direction: Vec3) => {
  return new Quaternion().setFromUnitVectors(FORWARD, new Vector3(...toPoint(direction)));
};

export const mirrorQuaternion = (mirror: Mirror) => {
  const freeAxis = AXES.find((axis) => !mirror.axes.includes(axis)) ?? "x";
  const normal = new Vector3(...toPoint(mirrorNormal(mirror)));
  const up = new Vector3(...toPoint(unit(freeAxis, 1)));
  const side = new Vector3().crossVectors(up, normal);

  return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(side, up, normal));
};

export const toPointer = (rect: Rect, clientX: number, clientY: number) => {
  const pointer = {
    x: ((clientX - rect.left) / rect.width) * 2 - 1,
    y: 1 - ((clientY - rect.top) / rect.height) * 2,
  };
  const isInside = Math.abs(pointer.x) <= 1 && Math.abs(pointer.y) <= 1;

  return isInside ? pointer : undefined;
};

export const pickAnchor = (game: Game, camera: Camera, pointer: Pointer) => {
  const { held, puzzle } = game;
  const mino = held === undefined ? undefined : puzzle.minos.at(held);
  if (held === undefined || mino === undefined) return undefined;

  const candidates = cellsOf(puzzle.size)
    .filter((anchor) => canPlace(game, held, anchor))
    .map((anchor) => {
      const center = centerOf(minoCellsAt(mino, anchor).map(({ position }) => position));
      const projected = new Vector3(...toWorld(center, puzzle.size)).project(camera);
      const distance = Math.hypot(projected.x - pointer.x, projected.y - pointer.y);

      return { anchor, distance };
    });

  return candidates.toSorted((a, b) => a.distance - b.distance).at(0)?.anchor;
};
