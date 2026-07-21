# Wider Site Canvas Design

## Goal

Increase the shared desktop canvas from 1900px to 2200px so current large displays use more horizontal space and show less empty space at both sides.

## Scope

- Set `--site-max-width` to exactly `2200px` in the shared canvas stylesheet.
- Keep `.site-shell` and its fixed background layers centered and governed by the same shared variable.
- Advance the canvas cache key to `canvas-20260721-2200` on all 17 public pages and in the detail-page generator.
- Preserve the 77px desktop header, 104px mobile header, 973px first-screen height cap, existing layouts, content, images, animations, and mobile breakpoints.
- Keep the page capped at 2200px rather than stretching indefinitely on ultrawide displays.

## Verification

- A focused test must fail against the old 1900px width and cache key before implementation.
- The full Node test suite and `git diff --check` must pass.
- Desktop and mobile browser checks must confirm no horizontal overflow and that the wider canvas is active.

