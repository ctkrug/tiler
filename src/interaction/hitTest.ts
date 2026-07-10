import type { TileRect } from "../types";

export interface Point {
  x: number;
  y: number;
}

/** Returns the id of the rect containing the given normalized point, or null. */
export function findRectAt(rects: TileRect[], point: Point): string | null {
  const hit = rects.find(
    (rect) =>
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height,
  );
  return hit ? hit.id : null;
}

function centerDistance(rect: TileRect, point: Point): number {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  return Math.hypot(cx - point.x, cy - point.y);
}

/**
 * Returns the id of the rect whose center is closest to the given point,
 * excluding `excludeId`. Returns null when no candidates remain.
 */
export function nearestRectId(
  rects: TileRect[],
  point: Point,
  excludeId?: string,
): string | null {
  const candidates = rects.filter((rect) => rect.id !== excludeId);
  if (candidates.length === 0) return null;

  return candidates.reduce((closest, rect) =>
    centerDistance(rect, point) < centerDistance(closest, point)
      ? rect
      : closest,
  ).id;
}
