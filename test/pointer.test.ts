import { describe, expect, it } from "vitest";
import { normalizedPoint } from "../src/interaction/pointer";

describe("normalizedPoint", () => {
  it("maps the top-left corner of the bounds to (0, 0)", () => {
    expect(normalizedPoint(100, 50, 100, 50, 400, 300)).toEqual({
      x: 0,
      y: 0,
    });
  });

  it("maps the center of the bounds to (0.5, 0.5)", () => {
    expect(normalizedPoint(300, 200, 100, 50, 400, 300)).toEqual({
      x: 0.5,
      y: 0.5,
    });
  });

  it("reports points beyond the bounds as outside [0, 1] rather than clamping", () => {
    const result = normalizedPoint(600, 50, 100, 50, 400, 300);
    expect(result.x).toBeCloseTo(1.25);
  });

  it("reports negative coordinates for points before the bounds origin", () => {
    const result = normalizedPoint(0, 0, 100, 50, 400, 300);
    expect(result.x).toBeCloseTo(-0.25);
    expect(result.y).toBeCloseTo(-1 / 6);
  });

  it("returns the origin for a zero-size bounds rather than dividing by zero", () => {
    expect(normalizedPoint(10, 10, 0, 0, 0, 0)).toEqual({ x: 0, y: 0 });
  });
});
