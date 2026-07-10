import { describe, expect, it } from "vitest";
import { createWindow } from "../src/tiling/window";

describe("createWindow", () => {
  it("assigns the requested geometry", () => {
    const w = createWindow(0.1, 0.2, 0.3, 0.4);
    expect(w.x).toBe(0.1);
    expect(w.y).toBe(0.2);
    expect(w.width).toBe(0.3);
    expect(w.height).toBe(0.4);
  });

  it("assigns each window a unique id", () => {
    const a = createWindow(0, 0, 1, 1);
    const b = createWindow(0, 0, 1, 1);
    expect(a.id).not.toBe(b.id);
  });
});
