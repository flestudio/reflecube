import { type Camera, Matrix4, Quaternion, Vector3 } from "three";

import { cellsOf, inward } from "../puzzle/board";
import { type Game, canPlace } from "../puzzle/game";
import { centerOf, minoCellsAt } from "../puzzle/mino";
import { type Mirror, mirrorNormal } from "../puzzle/mirror";
import { AXES, type Axis, type Vec3, add, mapAxes, scale, unit, vec3 } from "../puzzle/vector";

export type Point = [x: number, y: number, z: number];

export type Pointer = {
  x: number;
  y: number;
};

export type Rect = Pick<DOMRect, "left" | "top" | "width" | "height">;

const FORWARD = new Vector3(0, 0, 1);

export const toPoint = ({ x, y, z }: Vec3) => [x, y, z] satisfies Point;

export const toWorld = (position: Vec3, size: number) => {
  const center = (size - 1) / 2;
  return toPoint(add(position, vec3(-center, -center, -center)));
};

export const portToWorld = (port: Vec3, size: number) => {
  return toWorld(add(port, scale(inward(port, size), 0.5)), size);
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
