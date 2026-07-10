import { describe, expect, it } from "vitest";
import { toPixelRect } from "../src/canvas/layout";

describe("toPixelRect", () => {
  it("scales a full-square tile rect to the pane's pixel dimensions", () => {
    expect(
      toPixelRect({ id: "w1", x: 0, y: 0, width: 1, height: 1 }, 400, 300),
    ).toEqual({
      x: 0,
      y: 0,
      width: 400,
      height: 300,
    });
  });

  it("scales a quarter tile rect proportionally", () => {
    expect(
      toPixelRect(
        { id: "w1", x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
        200,
        100,
      ),
    ).toEqual({
      x: 100,
      y: 50,
      width: 100,
      height: 50,
    });
  });

  it("handles a zero-size pane without throwing", () => {
    expect(
      toPixelRect({ id: "w1", x: 0, y: 0, width: 1, height: 1 }, 0, 0),
    ).toEqual({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  });
});
