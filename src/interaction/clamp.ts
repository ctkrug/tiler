/** Clamps a value into the normalized [0, 1] tiling coordinate space. */
export function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}
