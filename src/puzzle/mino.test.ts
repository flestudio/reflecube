import { describe, expect, test } from "vite-plus/test";

import { SHAPES, cellsAt, centerOf, jointsOf } from "./mino";
import { AXES, type Vec3, add, equals, keyOf, vec3 } from "./vector";

const distance = (a: Vec3, b: Vec3) => {
  return AXES.reduce((sum, axis) => sum + Math.abs(a[axis] - b[axis]), 0);
};

describe("SHAPES", () => {
  test("covers every tromino orientation exactly once", () => {
    expect(SHAPES).toHaveLength(15);
    expect(new Set(SHAPES.map((shape) => shape.map(keyOf).toSorted().join("|"))).size).toBe(15);
  });

  test.for(SHAPES)("%o is joined at the origin", ([origin, first, second]) => {
    expect(origin).toEqual(vec3(0, 0, 0));
    expect(distance(origin, first)).toBe(1);
    expect(distance(origin, second)).toBe(1);
  });

  test("has three straight shapes", () => {
    const straight = SHAPES.filter(([origin, first, second]) => equals(add(first, second), origin));
    expect(straight).toHaveLength(3);
  });
});

describe("cellsAt", () => {
  test("translates offsets to the anchor", () => {
    const offsets = [vec3(0, 0, 0), vec3(1, 0, 0), vec3(0, -1, 0)];
    expect(cellsAt(offsets, vec3(1, 1, 1))).toEqual([vec3(1, 1, 1), vec3(2, 1, 1), vec3(1, 0, 1)]);
  });
});

describe("centerOf", () => {
  test("averages the cells", () => {
    expect(centerOf([vec3(0, 0, 0), vec3(1, 0, 0), vec3(-1, 0, 0)])).toEqual(vec3(0, 0, 0));
    expect(centerOf([vec3(0, 0, 0), vec3(0, 3, 0), vec3(0, 0, 3)])).toEqual(vec3(0, 1, 1));
  });
});

describe("jointsOf", () => {
  test("finds the seams between adjacent cells", () => {
    expect(jointsOf([vec3(0, 0, 0), vec3(1, 0, 0), vec3(0, 0, -1)])).toEqual([
      { center: vec3(0.5, 0, 0), axis: "x" },
      { center: vec3(0, 0, -0.5), axis: "z" },
    ]);
  });

  test("skips cells that only touch diagonally", () => {
    expect(jointsOf([vec3(1, 0, 0), vec3(0, 1, 0)])).toEqual([]);
  });

  test.for(SHAPES)("%o has two joints", (shape) => {
    expect(jointsOf(shape)).toHaveLength(2);
  });
});
