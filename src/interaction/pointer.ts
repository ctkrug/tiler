import type { Point } from "./hitTest";

/**
 * Converts a client-space pointer coordinate into a normalized [0,1] point
 * relative to an element's bounding box. Unclamped — a drag can report a
 * point outside [0,1] while the pointer is beyond the canvas edge; callers
 * decide whether/where to clamp (see WindowStore.moveWindow).
 */
export function normalizedPoint(
  clientX: number,
  clientY: number,
  boundsLeft: number,
  boundsTop: number,
  boundsWidth: number,
  boundsHeight: number,
): Point {
  if (boundsWidth === 0 || boundsHeight === 0) return { x: 0, y: 0 };
  return {
    x: (clientX - boundsLeft) / boundsWidth,
    y: (clientY - boundsTop) / boundsHeight,
  };
}
