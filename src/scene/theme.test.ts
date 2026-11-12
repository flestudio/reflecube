import { describe, expect, test } from "vite-plus/test";

import { LASER_TONES, toneOf } from "./theme";

describe("toneOf", () => {
  test("uses the laser tone for a single laser", () => {
    expect(toneOf([0])).toBe(LASER_TONES.at(0));
    expect(toneOf([1])).toBe(LASER_TONES.at(1));
  });

  test("differs between idle, single, and both", () => {
    const fills = [toneOf([]), toneOf([0]), toneOf([1]), toneOf([0, 1])].map(({ fill }) => fill);
    expect(new Set(fills).size).toBe(4);
  });

  test("falls back to idle for an unknown laser", () => {
    expect(toneOf([9])).toBe(toneOf([]));
  });
});
