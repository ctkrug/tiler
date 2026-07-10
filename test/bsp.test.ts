import { describe, expect, it } from "vitest";
import { bsp } from "../src/tiling/bsp";
import { createWindow } from "../src/tiling/window";
import { assertTilesUnitSquare } from "./geometry";

function windows(n: number) {
  return Array.from({ length: n }, () => createWindow(0, 0, 0.1, 0.1));
}

describe("bsp", () => {
  it("returns an empty layout for zero windows", () => {
    expect(bsp([])).toEqual([]);
  });

  it("gives a single window the full unit square", () => {
    const [w] = windows(1);
    const rects = bsp([w]);
    expect(rects).toEqual([{ id: w.id, x: 0, y: 0, width: 1, height: 1 }]);
  });

  it("splits two windows into non-overlapping halves covering the square", () => {
    const rects = bsp(windows(2));
    assertTilesUnitSquare(rects);
    expect(rects).toHaveLength(2);
  });

  it("tiles five windows with no overlaps and full coverage", () => {
    const rects = bsp(windows(5));
    assertTilesUnitSquare(rects);
    expect(rects).toHaveLength(5);
  });

  it("alternates split axis by depth: root split is vertical (varies x)", () => {
    const rects = bsp(windows(4));
    const xs = new Set(rects.map((r) => r.x));
    expect(xs.size).toBeGreaterThan(1);
  });

  it("tiles the unit square for a range of window counts (property check)", () => {
    for (let n = 1; n <= 12; n += 1) {
      const rects = bsp(windows(n));
      expect(rects).toHaveLength(n);
      assertTilesUnitSquare(rects);
    }
  });
});
