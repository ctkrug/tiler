import type { TileRect, TilingAlgorithm } from "../types";

export const DEFAULT_MASTER_FRACTION = 0.5;

/**
 * Master-pane + stack tiling: the first window occupies `masterFraction` of
 * the left side; every remaining window splits the rest evenly in a
 * vertical stack, resizing to fit however many are added.
 */
export function masterStack(
  windows: Parameters<TilingAlgorithm>[0],
  masterFraction: number = DEFAULT_MASTER_FRACTION,
): TileRect[] {
  if (windows.length === 0) return [];

  const [master, ...stack] = windows;

  if (stack.length === 0) {
    return [{ id: master.id, x: 0, y: 0, width: 1, height: 1 }];
  }

  const rects: TileRect[] = [
    { id: master.id, x: 0, y: 0, width: masterFraction, height: 1 },
  ];

  const stackWidth = 1 - masterFraction;
  const stackHeight = 1 / stack.length;

  stack.forEach((w, i) => {
    rects.push({
      id: w.id,
      x: masterFraction,
      y: i * stackHeight,
      width: stackWidth,
      height: stackHeight,
    });
  });

  return rects;
}
