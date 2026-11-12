import { describe, expect, test } from "vite-plus/test";

import {
  formatElapsed,
  isDateString,
  parseDateParam,
  randomDate,
  seedOf,
  shareText,
  toDateString,
} from "./daily";

describe("toDateString", () => {
  test("pads the local date", () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(toDateString(new Date(2026, 10, 12, 23, 59))).toBe("2026-11-12");
  });
});

describe("isDateString", () => {
  test.for(["2026-11-12", "2024-02-29", "1900-01-01"])("accepts %s", (value) => {
    expect(isDateString(value)).toBe(true);
  });

  test.for(["2026-02-31", "2025-02-29", "2026-13-01", "20261112", "", "today"])(
    "rejects %s",
    (value) => {
      expect(isDateString(value)).toBe(false);
    },
  );
});

describe("seedOf", () => {
  test("reads the date as a number", () => {
    expect(seedOf("2026-11-12")).toBe(20261112);
  });
});

describe("parseDateParam", () => {
  const today = "2026-11-12";

  test("accepts a past date", () => {
    expect(parseDateParam("20240229", today)).toBe("2024-02-29");
  });

  test("accepts today", () => {
    expect(parseDateParam("20261112", today)).toBe(today);
  });

  test.for([null, "", "20261113", "20260231", "abc"])("falls back to today for %s", (param) => {
    expect(parseDateParam(param, today)).toBe(today);
  });
});

describe("randomDate", () => {
  const today = new Date(2026, 10, 12);

  test("spans from 1900 to today", () => {
    expect(randomDate(0, today)).toBe("1900-01-01");
    expect(randomDate(1, today)).toBe("2026-11-12");
  });

  test("stays valid in between", () => {
    const dates = [...Array(50)].map((_, i) => randomDate(i / 50, today));
    expect(dates.every(isDateString)).toBe(true);
    expect(dates).toEqual(dates.toSorted());
  });
});

describe("formatElapsed", () => {
  test.for([
    [0, "00:00"],
    [999, "00:00"],
    [61_000, "01:01"],
    [3_599_999, "59:59"],
    [6_000_000, "100:00"],
  ] satisfies [number, string][])("formats %i as %s", ([milliseconds, expected]) => {
    expect(formatElapsed(milliseconds)).toBe(expected);
  });
});

describe("shareText", () => {
  test("links back to the puzzle", () => {
    expect(shareText("2026-11-12", 83_000, "https://reflecube.fle.st")).toBe(
      [
        "⬛🟨⬛ RefleCube 2026/11/12",
        "🟨⬜🟦 https://reflecube.fle.st/?date=20261112",
        "⬛🟦⬛ Solved in 01:23",
      ].join("\n"),
    );
  });
});
