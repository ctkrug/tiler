import { describe, expect, it } from "vitest";
import { DEFAULT_MASTER_FRACTION, masterStack } from "../src/tiling/masterStack";
import { createWindow } from "../src/tiling/window";
import { assertTilesUnitSquare } from "./geometry";

function windows(n: number) {
  return Array.from({ length: n }, () => createWindow(0, 0, 0.1, 0.1));
}

describe("masterStack", () => {
  it("returns an empty layout for zero windows", () => {
    expect(masterStack([])).toEqual([]);
  });

  it("gives a single window the full unit square", () => {
    const [w] = windows(1);
    expect(masterStack([w])).toEqual([{ id: w.id, x: 0, y: 0, width: 1, height: 1 }]);
  });

  it("splits two windows into master and one stacked pane at the default fraction", () => {
    const [master, stacked] = windows(2);
    const rects = masterStack([master, stacked]);
    assertTilesUnitSquare(rects);

    const masterRect = rects.find((r) => r.id === master.id);
    expect(masterRect).toEqual({
      id: master.id,
      x: 0,
      y: 0,
      width: DEFAULT_MASTER_FRACTION,
      height: 1,
    });
  });

  it("tiles five windows with no overlaps and full coverage", () => {
    const rects = masterStack(windows(5));
    assertTilesUnitSquare(rects);
    expect(rects).toHaveLength(5);
  });

  it("resizes the existing stack rather than overflowing when a 6th window is added", () => {
    const five = windows(5);
    const withFive = masterStack(five);
    const stackFive = withFive.filter((r) => r.id !== five[0].id);
    expect(stackFive[0].height).toBeCloseTo(0.25, 9);

    const sixth = createWindow(0, 0, 0.1, 0.1);
    const withSix = masterStack([...five, sixth]);
    const stackSix = withSix.filter((r) => r.id !== five[0].id);

    expect(stackSix).toHaveLength(5);
    stackSix.forEach((r) => {
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.y + r.height).toBeLessThanOrEqual(1 + 1e-9);
    });
    expect(stackSix[0].height).toBeCloseTo(0.2, 9);
    assertTilesUnitSquare(withSix);
  });

  it("honors a custom master fraction", () => {
    const [master, stacked] = windows(2);
    const rects = masterStack([master, stacked], 0.7);
    const masterRect = rects.find((r) => r.id === master.id);
    expect(masterRect?.width).toBeCloseTo(0.7, 9);
    assertTilesUnitSquare(rects);
  });
});
