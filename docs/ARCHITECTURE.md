# Architecture — Tiler

A concise map of the codebase for anyone picking this up cold.

## Data flow

```
WindowStore (src/tiling/windowStore.ts)
  holds the single TileWindow[] list
        │
        │ subscribe() fires on every add()/removeLast()
        ▼
main.ts render(windows)
        │
        │ for each of the 4 panes:
        ▼
tiling algorithm (bsp | spiral | masterStack | dwindle)
  pure function: TileWindow[] -> TileRect[]
        │
        ▼
renderPane (src/canvas/renderPane.ts)
  draws the grid, rects, and corner stamp onto that pane's <canvas>
```

Everything downstream of `WindowStore` is a pure function of the current
window list — no pane keeps its own copy of state, so the four panes can
never drift out of sync with each other or with what the user did.

## Modules

- **`src/types.ts`** — `TileWindow` (a window in normalized `[0,1]`
  coordinates), `TileRect` (a placed rect from an algorithm), and the
  `TilingAlgorithm` function type every algorithm implements.
- **`src/tiling/window.ts`** — `createWindow(x, y, width, height)`, the one
  place window ids are minted.
- **`src/tiling/windowStore.ts`** — `WindowStore`: the shared, observable
  window list. `add`/`removeLast` mutate it and notify subscribers;
  `subscribe` fires immediately with the current snapshot, then again on
  every change.
- **`src/tiling/bsp.ts`, `spiral.ts`, `masterStack.ts`, `dwindle.ts`** — the
  four tiling algorithms. Each is a pure `(windows) => rects` function with
  no DOM/canvas dependency, so they're unit-tested (`test/*.test.ts`) in
  isolation via geometric properties (full coverage, no overlaps) rather
  than pixel snapshots. `test/geometry.ts` holds the shared assertion
  helpers (`assertTilesUnitSquare`).
- **`src/canvas/layout.ts`** — `toPixelRect`, the one piece of rendering
  math (normalized rect → CSS pixel rect) worth unit-testing on its own,
  kept separate from the canvas-drawing calls that need a real DOM.
- **`src/canvas/theme.ts`** — canvas-side color/spacing tokens mirroring
  the CSS custom properties in `src/style.css`, so canvas drawing and CSS
  styling read from the same blueprint palette.
- **`src/canvas/renderPane.ts`** — `renderPane(canvas, rects, options)`:
  sizes the canvas backing store to `devicePixelRatio`, draws the
  grid-paper background, each rect (or a designed empty-state prompt when
  there are none), and the corner title-block stamp (algorithm name + live
  count). Not unit-tested — it's a thin, DOM-dependent drawing layer over
  the tested `toPixelRect`.
- **`src/main.ts`** — `mountApp(root)`: builds the toolbar + 4-pane grid
  markup, wires add/remove buttons to the `WindowStore`, subscribes to
  re-render all four panes on every change, and re-renders on window
  resize (debounced via `requestAnimationFrame`).
- **`src/style.css`** — the blueprint visual system: CSS custom properties
  for every token in `docs/DESIGN.md`, the grid-paper body background,
  themed button states (hover/focus-visible/active/disabled), and the
  responsive 2×2-desktop / stacked-phone pane grid.

## How to run / test

```bash
npm install
npm run dev        # Vite dev server, opens straight into the live grid
npm test            # vitest: all tiling algorithms + WindowStore + layout
npm run typecheck   # tsc --noEmit
npm run lint         # eslint
npm run format:check # prettier --check
npm run build         # tsc --noEmit && vite build -> dist/
```

## Extending

- **A new tiling algorithm**: add `src/tiling/<name>.ts` implementing
  `TilingAlgorithm`, add its tests, then add one entry to the `PANES` array
  in `main.ts` (label, corner stamp, algorithm reference) — the grid,
  toolbar, and store wiring need no changes.
- **Drag-to-reposition / cross-pane highlight** (backlog 2.1, 2.2): both
  need per-window interaction state that doesn't exist yet — likely a
  `hoveredId`/`draggingId` field threaded from a shared pointer-tracking
  layer into `renderPane`'s draw calls.
- **Tweened reflow (backlog 3.2)**: `renderPane` currently redraws
  instantly from whatever rects it's given; animating means interpolating
  between the previous and next rect for each window id across a few
  `requestAnimationFrame` ticks before calling `renderPane`, which itself
  stays a stateless "draw these exact rects" function.
