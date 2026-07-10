---
title: "Reflow: watching four tiling window manager algorithms lay out the same windows"
published: false
tags: typescript, canvas, webdev, algorithms
---

I've bounced between i3, bspwm, and Hyprland for years, and every time I switch
I hit the same wall: I can read that one uses "BSP" and another defaults to a
"master and stack," but I can never quite picture how they'd arrange _my_
windows differently until I've lived in each for a week. So I built
[Reflow](https://apps.charliekrug.com/tiler/): four tiling algorithms on one
page, fed by the same window list, reflowing side by side as you add, remove,
and drag windows.

It's a small TypeScript + Canvas project, but a couple of the decisions turned
out more interesting than I expected.

## The algorithms are order-driven, not position-driven

The first thing I got wrong was assuming a "window" needed an x/y. It doesn't.
Every one of these four algorithms (BSP, spiral, master-stack, dwindle) is a
pure function of the _order_ of the window list, not where anything sits:

```ts
export type TilingAlgorithm = (windows: TileWindow[]) => TileRect[];
```

BSP recursively halves the largest region; spiral carves a shrinking slice per
window and winds around; master-stack gives window one the master area and
stacks the rest; dwindle keeps halving toward a corner. Feed all four the same
array and you get four different layouts, deterministically.

The payoff is that "dragging a window" is really just a reorder. When you drop
window 3 onto window 1's slot, I move it in one shared list, and all four panes
re-tile from that new order in the same frame. There's no per-pane state to keep
in sync because there's no per-pane state at all. One `WindowStore` holds the
list; four pure functions read it. That also made the keyboard version almost
free: arrow keys call the same `moveByOffset` the drag does.

## Keeping the animation engine pure so I could actually test it

The reflow tween is the part that makes it feel alive, and it's also the part I
most wanted under test. The trick was to never let the animation code read the
clock. Time is always an argument:

```ts
sampleAnimation(state, now); // never sampleAnimation(state)
```

`diffRects` classifies every window id as moved, added, or removed between two
layouts; `sampleTransition` renders one id at a given elapsed time. Because the
elapsed time is passed in, a test can ask for the exact frame at 0ms, 65ms, or
130ms and assert the geometry, with no fake timers and no flakiness. `main.ts`
is the only place a `requestAnimationFrame` loop feeds `performance.now()` into
those pure functions.

## Property tests instead of guessing edge cases

I started with hand-picked cases per algorithm (0, 1, 2, 5 windows). They pass,
but they only prove the counts I thought to write. For a tiling algorithm the
thing I actually care about is an invariant: whatever the count, the rects
should tile the unit square exactly, with no overlaps and total area 1. That's
a property, not an example, so I reached for `fast-check`:

```ts
fc.assert(
  fc.property(fc.integer({ min: 0, max: 40 }), (n) => {
    const rects = algorithm(windows(n));
    if (n > 0) assertTilesUnitSquare(rects); // no overlaps, area sums to 1
  }),
);
```

This is where the subtle stuff lives. BSP alternates its split axis by recursion
depth, and getting that parity right at the root is the difference between a
clean tiling and a sliver of overlap you'd never catch by eye at four windows.
Pinning it with a property that runs across every count from 0 to 40, rather
than a count I happened to pick, is what keeps me honest when I refactor.

The quieter one: `Math.min`/`Math.max` both propagate `NaN`, so a drag that ever
produced a `NaN` coordinate would clamp to `NaN` instead of `0`. One explicit
`Number.isNaN` guard, one regression test, and now the store can't leak a
non-finite position no matter what the pointer math throws at it.

## What I'd do differently

Right now the algorithms ignore each window's stored x/y entirely, even though
the store carries it. A natural next step is a position-aware layout (drop a
window in the top-right and have it claim that corner), which would make the
comparison richer. I'd also like a way to freeze a layout and export it.

The whole thing is a single static page, no server, no persistence. Code is
[on GitHub](https://github.com/ctkrug/tiler) and the live version is at
[apps.charliekrug.com/tiler](https://apps.charliekrug.com/tiler/). If you run a
tiling window manager, I'd genuinely like to know which layout matches how you
already work.
</content>
