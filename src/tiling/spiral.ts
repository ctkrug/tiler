import type { TileRect, TilingAlgorithm } from "../types";

const DIRECTIONS = ["right", "down", "left", "up"] as const;
type Direction = (typeof DIRECTIONS)[number];

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Carves one rect off a region in the given direction, returning the rect and what remains. */
function carve(region: Region, direction: Direction): { rect: TileRect; rest: Region } {
  const { x, y, width, height } = region;

  switch (direction) {
    case "right": {
      const w = width / 2;
      return {
        rect: { id: "", x, y, width: w, height },
        rest: { x: x + w, y, width: width - w, height },
      };
    }
    case "down": {
      const h = height / 2;
      return {
        rect: { id: "", x, y, width, height: h },
        rest: { x, y: y + h, width, height: height - h },
      };
    }
    case "left": {
      const w = width / 2;
      return {
        rect: { id: "", x: x + width - w, y, width: w, height },
        rest: { x, y, width: width - w, height },
      };
    }
    case "up": {
      const h = height / 2;
      return {
        rect: { id: "", x, y: y + height - h, width, height: h },
        rest: { x, y, width, height: height - h },
      };
    }
  }
}

/**
 * Fibonacci-style spiral tiling: each window but the last carves a shrinking
 * fraction off the remaining region, rotating direction right/down/left/up.
 * The final window takes whatever remains.
 */
export const spiral: TilingAlgorithm = (windows) => {
  const rects: TileRect[] = [];
  let region: Region = { x: 0, y: 0, width: 1, height: 1 };

  windows.forEach((w, i) => {
    if (i === windows.length - 1) {
      rects.push({ id: w.id, ...region });
      return;
    }
    const direction = DIRECTIONS[i % DIRECTIONS.length];
    const { rect, rest } = carve(region, direction);
    rects.push({ ...rect, id: w.id });
    region = rest;
  });

  return rects;
};
