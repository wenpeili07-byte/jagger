# Task 4 Report: Services Workshop Process Rail Visual QA Fix

## Scope

- Reviewed base: `11e58a8`
- Fixed the desktop Services workspace so the rail remains within one viewport-bound canvas.
- Final controller browser verification and refreshed screenshots are recorded below.

## RED Evidence

Command:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node content-pages.test.mjs
```

Result: exited `1` with the expected `AssertionError`: `desktop services workspace should occupy one viewport-bound canvas`.

The new contract failed because `.services-workspace` had only `min-height: calc(min(1050px, 100vh) - 76px)` and no explicit desktop `height`.

## GREEN Evidence

Focused command:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node content-pages.test.mjs
```

Result: exited `0` with no output.

Full suite command:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" zsh -lc 'for test_file in *.test.mjs; do node "$test_file" || exit 1; done'
```

Result: exited `0` with no output.

Whitespace command:

```bash
git diff --check
```

Result: exited `0` with no output.

## Changes

- `content-pages.test.mjs`
  - Added a focused CSS contract for the fixed desktop workspace height, practical minimum height, six `minmax(0, 1fr)` tracks, rail/row/media containment, and mobile height reset.
- `content-pages.css`
  - Set the desktop workspace to `height: calc(min(1050px, 100vh) - 76px)` with `min-height: 640px`.
  - Changed the rail to six `minmax(0, 1fr)` rows.
  - Added `min-height: 0` to the rail, row, and media containers.
  - Restored `height: auto` and `min-height: 0` below `760px`.

## Commit

- `a7f1dd5 fix: constrain services process rail`

## Self-Review

- Active, hover, and keyboard-focus selectors were preserved unchanged.
- The desktop 24% / 76% workspace split and existing image crop rules were preserved.
- Only `content-pages.css` and `content-pages.test.mjs` were committed.
- `.superpowers/` and `outputs/` were not staged or committed.

## Concerns

- No P0 or P1 concern remains after final controller verification. All `outputs/` artifacts remain local and uncommitted.

## Mobile Follow-up: Stable Service Rows

### Scope

- Follow-up base: `a7f1dd5`
- Browser QA at `390 x 844` found intrinsic image sizing expanding individual mobile service rows and causing screenshot timeouts.
- Desktop behavior remains governed by the unchanged rules outside the `max-width: 760px` media query.

### RED Evidence

Command:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node content-pages.test.mjs
```

Result: exited `1` with the expected `AssertionError`: `mobile service rows should use one stable contained overlay track`.

The previous mobile rule used `min-height: 360px` without an explicit row track, allowing image intrinsic sizing to grow individual rows.

### GREEN Evidence

Focused command:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node content-pages.test.mjs
```

Result: exited `0` with no output.

Full suite command:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" zsh -lc 'for test_file in *.test.mjs; do node "$test_file" || exit 1; done'
```

Result: exited `0` with no output.

Whitespace command:

```bash
git diff --check
```

Result: exited `0` with no output.

### Historical Changes, Superseded

- `content-pages.test.mjs`
  - Added the original mobile CSS contracts for a fixed `360px` row, zero-minimum overlay track, and media that fills rather than expands its row.
- `content-pages.css`
  - Commit `4837b70` temporarily replaced the mobile row `min-height` with `height: 360px` and `grid-template-rows: minmax(0, 1fr)`.
  - Set mobile media to `height: 100%` and `min-height: 0`.
  - Kept image `object-fit: cover` and all desktop rules unchanged.

### Final Mobile State

- `83c52b8` superseded the fixed-height implementation with `height: auto`, `min-height: 360px`, and absolutely positioned media.
- Copy remains in normal flow and determines row height. Current English copy stays at `360px`; future longer or resized text can grow the row without intrinsic image expansion.
- Historical commit: `4837b70 fix: stabilize mobile service rows`.
- Superseding commit: `83c52b8 fix: contain services rows across breakpoints`.

### Self-Review And Concerns

- The mobile changes do not introduce width changes, so they do not create a new horizontal-overflow path.
- Final browser verification at `390 x 844` confirmed contained copy/media, no overflow, and `scrollWidth === clientWidth`; no upload, push, or deployment was performed.

## Tablet Follow-up: Copy-Led Rows

- `83c52b8` released the workspace from viewport-bound height at `761px` to `980px` and changed the six rail tracks to natural `auto` sizing.
- `f89f080` gave tablet rows a stable `162px` minimum and removed media from intrinsic track sizing by absolutely filling the right image slot.
- `f1e032d` widened the tablet copy/media split to `56% / 44%` and aligned the absolute media edge and arrow to the same `56%` boundary.
- The global desktop `42% / 58%` row split and the `max-width: 760px` mobile composition remain unchanged.

## Controller Browser QA Completion

- `1900 x 1050`: `scrollWidth` and `clientWidth` were both `1900`; the workspace measured `1898 x 974` at `y=77`; six rows measured `162.164px` or `162.172px`; no horizontal overflow. Screenshot: `outputs/services-workshop-process-1900.png`.
- `1440 x 900`: `scrollWidth` and `clientWidth` were both `1440`; the workspace measured `1438 x 824` at `y=77`; six rows measured `137.164px` or `137.172px`; no horizontal overflow. Screenshot: `outputs/services-workshop-process-1440.png`.
- `980 x 900` English: the shared header measured `152px`; all six rows measured `162px`; copy and media remained contained, with no text or horizontal overflow.
- `900 x 900` English: all six rows measured `162px`, with no text or horizontal overflow.
- `768 x 900` English: rows grew naturally from `177px` to `202px`; all copy and media remained contained; `PERFORMANCE PARTS` and `ECU CALIBRATION` fit, with no text or horizontal overflow.
- `390 x 844` English: all six rows measured exactly `360px` with current copy, media measured `359px` to `360px`, and copy and arrows remained contained. The natural `min-height` plus absolute-media CSS permits future longer or resized text to grow without intrinsic-image expansion. No text or horizontal overflow was observed. Full screenshot: `outputs/services-workshop-process-mobile.png`.
- The language toggle passed `zh -> en -> zh`: shared navigation, left title, and all service titles and descriptions updated. The English desktop screenshot is `outputs/services-workshop-process-english-1900.png`; no service-copy text overflow was observed.
- Row 04 initializes as active. Focusing row 01 left exactly row 01 active, and its computed focus outline was `rgb(46, 125, 189) solid 2px`. Pointer activation of row 02 navigated to `pages/services/parts.html`; the language toggle was also verified.
- Browser console errors: none.
- The final `1900` screenshot and `outputs/services-workshop-process-comparison.png` were refreshed. The combined comparison found no P0 or P1 visual mismatch; Chinese title hierarchy and existing case photography match the written specification and approved direction.
- Controller regression check: `node --test *.test.mjs` passed `6/6`; `git diff --check 91300c9..HEAD` was clean.
- All `outputs/` files are local QA artifacts and were not committed.
