import { describe, expect, test } from "vite-plus/test";

import { type Mirror, mirrorBetween, mirrorNormal, reflect } from "./mirror";
import { AXES, DIRECTIONS, type Vec3, add, axisOf, dot, mapAxes, scale, vec3 } from "./vector";

const MIRRORS = [
  { axes: ["x", "y"], sign: 1 },
  { axes: ["x", "y"], sign: -1 },
  { axes: ["x", "z"], sign: 1 },
  { axes: ["x", "z"], sign: -1 },
  { axes: ["y", "z"], sign: 1 },
  { axes: ["y", "z"], sign: -1 },
] satisfies Mirror[];

const householder = (direction: Vec3, normal: Vec3) => {
  const reflected = add(direction, scale(normal, -2 * dot(direction, normal)));
  return mapAxes((axis) => Math.round(reflected[axis]));
};

const TURNS = DIRECTIONS.flatMap((incoming) => {
  return DIRECTIONS.filter((outgoing) => axisOf(outgoing) !== axisOf(incoming)).map((outgoing) => ({
    incoming,
    outgoing,
  }));
});

describe("reflect", () => {
  test.for(MIRRORS)("is an involution for %o", (mirror) => {
    expect(DIRECTIONS.map((d) => reflect(reflect(d, mirror), mirror))).toEqual(DIRECTIONS);
  });

  test.for(MIRRORS)("keeps the axis outside the mirror plane for %o", (mirror) => {
    const [a, b] = mirror.axes;
    const free = DIRECTIONS.filter((d) => axisOf(d) !== a && axisOf(d) !== b);
    expect(free).toHaveLength(2);
    expect(free.map((d) => reflect(d, mirror))).toEqual(free);
  });

  test.for(MIRRORS)("matches the reflection across its normal for %o", (mirror) => {
    const expected = DIRECTIONS.map((d) => householder(d, mirrorNormal(mirror)));
    expect(DIRECTIONS.map((d) => reflect(d, mirror))).toEqual(expected);
  });

  test("covers every axis pair", () => {
    expect(new Set(MIRRORS.flatMap(({ axes }) => axes))).toEqual(new Set(AXES));
  });
});

describe("mirrorBetween", () => {
  test.for(TURNS)("turns $incoming into $outgoing", ({ incoming, outgoing }) => {
    expect(reflect(incoming, mirrorBetween(incoming, outgoing))).toEqual(outgoing);
  });

  test("normalizes the axis order", () => {
    expect(mirrorBetween(vec3(0, 1, 0), vec3(1, 0, 0))).toEqual(
      mirrorBetween(vec3(1, 0, 0), vec3(0, 1, 0)),
    );
  });
});
