import { Vector3 } from "three";
import { describe, expect, test } from "vite-plus/test";

import { mirrorBetween, mirrorNormal } from "../puzzle/mirror";
import { DIRECTIONS, vec3 } from "../puzzle/vector";
import {
  facing,
  grazedSpans,
  laserPoints,
  mirrorQuaternion,
  portToWorld,
  sizeAlong,
  toPoint,
  toPointer,
  toWorld,
} from "./space";

const rounded = ({ x, y, z }: Vector3) => [x, y, z].map((n) => Math.round(n * 1000) / 1000 || 0);

describe("toWorld", () => {
  test("centers the cube on the origin", () => {
    expect(toWorld(vec3(1, 1, 1), 3)).toEqual([0, 0, 0]);
    expect(toWorld(vec3(0, 2, 1), 3)).toEqual([-1, 1, 0]);
  });
});

describe("portToWorld", () => {
  test("puts a port on the face of the cube", () => {
    expect(portToWorld(vec3(-1, 1, 1), 3)).toEqual([-1.5, 0, 0]);
    expect(portToWorld(vec3(2, 3, 0), 3)).toEqual([1, 1.5, -1]);
  });
});

describe("laserPoints", () => {
  test("runs straight from port to port", () => {
    const cells = [vec3(0, 1, 1), vec3(1, 1, 1), vec3(2, 1, 1)];
    expect(laserPoints(vec3(-1, 1, 1), { cells, exit: vec3(3, 1, 1) }, 3)).toEqual([
      [-1.5, 0, 0],
      [-1, 0, 0],
      [0, 0, 0],
      [1, 0, 0],
      [1.5, 0, 0],
    ]);
  });

  test("turns just short of the cell center", () => {
    const cells = [vec3(0, 1, 1), vec3(1, 1, 1), vec3(1, 2, 1)];
    expect(laserPoints(vec3(-1, 1, 1), { cells, exit: vec3(1, 3, 1) }, 3)).toEqual([
      [-1.5, 0, 0],
      [-1, 0, 0],
      [-0.06, 0, 0],
      [0, 0.06, 0],
      [0, 1, 0],
      [0, 1.5, 0],
    ]);
  });
});

describe("grazedSpans", () => {
  const path = { cells: [vec3(0, 1, 1), vec3(1, 1, 1), vec3(2, 1, 1)], exit: vec3(3, 1, 1) };
  const start = vec3(-1, 1, 1);

  test("spans a mirror the laser slides along", () => {
    const board = new Map([["1,1,1", mirrorBetween(vec3(0, 1, 0), vec3(0, 0, 1))]]);
    expect(grazedSpans(start, path, board, 3)).toEqual([
      [
        [-0.5, 0, 0],
        [0.5, 0, 0],
      ],
    ]);
  });

  test("skips empty cells and mirrors that turn the laser", () => {
    const board = new Map([
      ["0,1,1", null],
      ["1,1,1", mirrorBetween(vec3(1, 0, 0), vec3(0, 0, 1))],
    ]);
    expect(grazedSpans(start, path, board, 3)).toEqual([]);
  });
});

describe("sizeAlong", () => {
  test("stretches only the given axis", () => {
    expect(sizeAlong("y", 2, 0.5)).toEqual([0.5, 2, 0.5]);
  });
});

describe("facing", () => {
  test.for(DIRECTIONS)("turns the z axis toward %o", (direction) => {
    const turned = new Vector3(0, 0, 1).applyQuaternion(facing(direction));
    expect(rounded(turned)).toEqual(toPoint(direction));
  });
});

describe("mirrorQuaternion", () => {
  const mirror = mirrorBetween(vec3(1, 0, 0), vec3(0, 0, 1));
  const quaternion = mirrorQuaternion(mirror);

  test("faces the plate along the mirror normal", () => {
    const normal = new Vector3(0, 0, 1).applyQuaternion(quaternion);
    expect(rounded(normal)).toEqual(rounded(new Vector3(...toPoint(mirrorNormal(mirror)))));
  });

  test("keeps the plate upright along the free axis", () => {
    const up = new Vector3(0, 1, 0).applyQuaternion(quaternion);
    expect(rounded(up)).toEqual([0, 1, 0]);
  });
});

describe("toPointer", () => {
  const rect = { left: 100, top: 50, width: 200, height: 400 };

  test("maps the rect to normalized device coordinates", () => {
    expect(toPointer(rect, 100, 50)).toEqual({ x: -1, y: 1 });
    expect(toPointer(rect, 200, 250)).toEqual({ x: 0, y: 0 });
    expect(toPointer(rect, 300, 450)).toEqual({ x: 1, y: -1 });
  });

  test("rejects points outside the rect", () => {
    expect(toPointer(rect, 99, 250)).toBeUndefined();
    expect(toPointer(rect, 200, 451)).toBeUndefined();
  });
});
