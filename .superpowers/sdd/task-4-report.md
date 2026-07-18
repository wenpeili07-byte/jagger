# Task 4 Report: Services Workshop Process Rail Visual QA Fix

## Scope

- Reviewed base: `11e58a8`
- Fixed the desktop Services workspace so the rail remains within one viewport-bound canvas.
- Did not create the final QA document. Browser verification and screenshots are deferred to the controller.

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

- Browser screenshot and interaction verification remain intentionally outstanding for the controller; no final QA document was created.

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

### Changes

- `content-pages.test.mjs`
  - Added mobile CSS contracts for a stable `360px` row, zero-minimum overlay track, and media that fills rather than expands its row.
- `content-pages.css`
  - Replaced the mobile row `min-height` with `height: 360px` and `grid-template-rows: minmax(0, 1fr)`.
  - Set mobile media to `height: 100%` and `min-height: 0`.
  - Kept image `object-fit: cover` and all desktop rules unchanged.

### Commit

- `4837b70 fix: stabilize mobile service rows`

### Self-Review And Concerns

- The mobile changes do not introduce width changes, so they do not create a new horizontal-overflow path.
- Browser recheck at `390 x 844` remains required to confirm equal computed row heights, capture completion, and `scrollWidth === clientWidth`; no upload, push, or deployment was performed.

## Controller Browser QA Completion

- `1900 x 1050`: `scrollWidth` and `clientWidth` were both `1900`; the workspace measured `1898 x 974` at `y=77`; six rows measured `162.164px` or `162.172px`; no horizontal overflow. Screenshot: `outputs/services-workshop-process-1900.png`.
- `1440 x 900`: `scrollWidth` and `clientWidth` were both `1440`; the workspace measured `1438 x 824` at `y=77`; six rows measured `137.164px` or `137.172px`; no horizontal overflow. Screenshot: `outputs/services-workshop-process-1440.png`.
- `390 x 844`: `scrollWidth` and `clientWidth` were both `390`; all six rows measured exactly `360px`, media measured `359px` to `360px`, and copy and arrows remained contained. Full screenshot: `outputs/services-workshop-process-mobile.png`.
- The language toggle passed `zh -> en -> zh`: shared navigation, left title, and all service titles and descriptions updated. The English desktop screenshot is `outputs/services-workshop-process-english-1900.png`; no service-copy text overflow was observed.
- Row 04 initializes as active. Pointer activation of row 02 navigated to `pages/services/parts.html`; the focus-visible CSS contract remains covered.
- Browser console errors: none.
- The side-by-side comparison at `outputs/services-workshop-process-comparison.png` found no P0 or P1 visual mismatch. Chinese title hierarchy and existing case photography match the written specification and approved direction.
- Controller regression check: `node --test *.test.mjs` passed `6/6`; `git diff --check 91300c9..HEAD` was clean.
- All `outputs/` files are local QA artifacts and were not committed.
