import { describe, expect, test } from "vite-plus/test";

import { cellsOf, inward, isInside, portsOf, traceLaser } from "./board";
import { mirrorBetween } from "./mirror";
import { add, keyOf, vec3 } from "./vector";

const MIRRORED = new Map([
  [keyOf(vec3(1, 0, 0)), mirrorBetween(vec3(1, 0, 0), vec3(0, 0, 1))],
  [keyOf(vec3(1, 0, 2)), mirrorBetween(vec3(0, 0, 1), vec3(0, 1, 0))],
]);

describe("cellsOf", () => {
  test("lists every cell inside the cube once", () => {
    const cells = cellsOf(3);
    expect(cells).toHaveLength(27);
    expect(new Set(cells.map(keyOf)).size).toBe(27);
    expect(cells.every((cell) => isInside(cell, 3))).toBe(true);
  });
});

describe("portsOf", () => {
  test("lists one port per face cell", () => {
    expect(portsOf(3)).toHaveLength(6 * 9);
  });

  test.for(portsOf(3))("port %o faces into the cube", (port) => {
    expect(isInside(port, 3)).toBe(false);
    expect(isInside(add(port, inward(port, 3)), 3)).toBe(true);
  });
});

describe("traceLaser", () => {
  test("goes straight through an empty cube", () => {
    expect(traceLaser(new Map(), vec3(-1, 1, 2), 3)).toEqual({
      cells: [vec3(0, 1, 2), vec3(1, 1, 2), vec3(2, 1, 2)],
      exit: vec3(3, 1, 2),
    });
  });

  test("passes through blocks", () => {
    const board = new Map([[keyOf(vec3(1, 1, 2)), null]]);
    expect(traceLaser(board, vec3(-1, 1, 2), 3).exit).toEqual(vec3(3, 1, 2));
  });

  test("turns at mirrors", () => {
    expect(traceLaser(MIRRORED, vec3(-1, 0, 0), 3)).toEqual({
      cells: [
        vec3(0, 0, 0),
        vec3(1, 0, 0),
        vec3(1, 0, 1),
        vec3(1, 0, 2),
        vec3(1, 1, 2),
        vec3(1, 2, 2),
      ],
      exit: vec3(1, 3, 2),
    });
  });

  test("follows the reverse path when shot back from the exit", () => {
    const forward = traceLaser(MIRRORED, vec3(-1, 0, 0), 3);
    const backward = traceLaser(MIRRORED, forward.exit, 3);
    expect(backward.cells).toEqual(forward.cells.toReversed());
    expect(backward.exit).toEqual(vec3(-1, 0, 0));
  });
});
