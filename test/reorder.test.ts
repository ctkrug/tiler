import { describe, expect, it } from "vitest";
import { reorderWindows } from "../src/tiling/reorder";
import { createWindow } from "../src/tiling/window";
import type { TileWindow } from "../src/types";

function windowsWithIds(...ids: string[]): TileWindow[] {
  return ids.map((id) => ({ ...createWindow(0, 0, 1, 1), id }));
}

describe("reorderWindows", () => {
  it("moves the dragged window to sit immediately before the target", () => {
    const windows = windowsWithIds("a", "b", "c", "d", "e");
    const result = reorderWindows(windows, "a", "d");
    expect(result.map((w) => w.id)).toEqual(["b", "c", "a", "d", "e"]);
  });

  it("swaps two windows when dragging the later one onto the earlier one", () => {
    const windows = windowsWithIds("a", "b");
    const result = reorderWindows(windows, "b", "a");
    expect(result.map((w) => w.id)).toEqual(["b", "a"]);
  });

  it("is a no-op when the dragged window is already immediately before the target", () => {
    const windows = windowsWithIds("a", "b");
    const result = reorderWindows(windows, "a", "b");
    expect(result.map((w) => w.id)).toEqual(["a", "b"]);
  });

  it("returns the same array reference when dragged and target are equal", () => {
    const windows = windowsWithIds("a", "b", "c");
    expect(reorderWindows(windows, "b", "b")).toBe(windows);
  });

  it("returns the same array reference when the dragged id is missing", () => {
    const windows = windowsWithIds("a", "b");
    expect(reorderWindows(windows, "ghost", "a")).toBe(windows);
  });

  it("returns the same array reference when the target id is missing", () => {
    const windows = windowsWithIds("a", "b");
    expect(reorderWindows(windows, "a", "ghost")).toBe(windows);
  });

  it("is a no-op on an empty list", () => {
    expect(reorderWindows([], "a", "b")).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const windows = windowsWithIds("a", "b", "c");
    const snapshot = [...windows];
    reorderWindows(windows, "a", "c");
    expect(windows).toEqual(snapshot);
  });
});
