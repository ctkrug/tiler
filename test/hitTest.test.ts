import { describe, expect, it } from "vitest";
import { findRectAt, nearestRectId } from "../src/interaction/hitTest";
import type { TileRect } from "../src/types";

const RECTS: TileRect[] = [
  { id: "a", x: 0, y: 0, width: 0.5, height: 1 },
  { id: "b", x: 0.5, y: 0, width: 0.5, height: 0.5 },
  { id: "c", x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
];

describe("findRectAt", () => {
  it("returns the id of the rect containing the point", () => {
    expect(findRectAt(RECTS, { x: 0.1, y: 0.1 })).toBe("a");
    expect(findRectAt(RECTS, { x: 0.75, y: 0.25 })).toBe("b");
    expect(findRectAt(RECTS, { x: 0.75, y: 0.75 })).toBe("c");
  });

  it("returns null when the point is outside every rect", () => {
    expect(findRectAt(RECTS, { x: 1.5, y: 1.5 })).toBeNull();
  });

  it("returns null for an empty rect list", () => {
    expect(findRectAt([], { x: 0.5, y: 0.5 })).toBeNull();
  });

  it("treats rect boundaries as inclusive", () => {
    expect(findRectAt(RECTS, { x: 0.5, y: 0 })).toBe("a");
  });

  it("returns null rather than a false match for a NaN point", () => {
    expect(findRectAt(RECTS, { x: NaN, y: NaN })).toBeNull();
  });
});

describe("nearestRectId", () => {
  it("returns the closest rect by center distance", () => {
    expect(nearestRectId(RECTS, { x: 0.9, y: 0.1 })).toBe("b");
  });

  it("excludes the given id from consideration", () => {
    expect(nearestRectId(RECTS, { x: 0.9, y: 0.1 }, "b")).toBe("c");
  });

  it("returns null when every rect is excluded", () => {
    const single: TileRect[] = [
      { id: "solo", x: 0, y: 0, width: 1, height: 1 },
    ];
    expect(nearestRectId(single, { x: 0.5, y: 0.5 }, "solo")).toBeNull();
  });

  it("returns null for an empty rect list", () => {
    expect(nearestRectId([], { x: 0.5, y: 0.5 })).toBeNull();
  });
});
