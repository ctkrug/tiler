import type { TileWindow } from "../types";

type Listener = (windows: TileWindow[]) => void;

/**
 * Holds the single shared window list every tiling pane renders from, so no
 * pane can drift out of sync with what the user actually did.
 */
export class WindowStore {
  private windows: TileWindow[] = [];
  private readonly listeners = new Set<Listener>();

  constructor(initial: TileWindow[] = []) {
    this.windows = [...initial];
  }

  getWindows(): TileWindow[] {
    return [...this.windows];
  }

  add(window: TileWindow): void {
    this.windows = [...this.windows, window];
    this.emit();
  }

  /** Removes the most recently added window. No-op when the list is empty. */
  removeLast(): void {
    if (this.windows.length === 0) return;
    this.windows = this.windows.slice(0, -1);
    this.emit();
  }

  /** Subscribes to changes, firing once immediately with the current list. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getWindows());
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    const snapshot = this.getWindows();
    for (const listener of this.listeners) listener(snapshot);
  }
}
