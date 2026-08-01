# Task 5 Report: Case 02 Video-Led CMS Integration

## Scope

Implemented Task 5 only. Case 02 now receives generator-owned CMS markers and the shared detail module after its established content and Case 02 controllers. The existing video-first layout, poster-only fallback, static story, controls, reduced-motion behavior, and script order remain intact.

## RED

The literal command could not run because the shell does not provide `node`:

```text
zsh: command not found: node
```

The same command with the bundled Node runtime failed as intended before implementation:

```text
node --test sanity-case-detail.test.mjs case-02.test.mjs
```

Observed failures were the missing `applyCaseVideo` export, missing `data-case-slug="case-02"`, and missing Case 02 CMS slots/module script. The dedicated video URL contract was also added before its export and failed with `does not provide an export named 'isSafeCaseVideoUrl'`.

## GREEN

- Added strict Case 02 video validation: canonical local `/assets/videos/` paths, HTTPS remotes without credentials, fragments, query strings, control characters, or traversal, and canonical Sanity upload URLs under `https://cdn.sanity.io/files/v54qppoy/production/`.
- Preserved normalized `fileUrl` and `externalUrl`; uploaded Sanity video takes priority.
- Added `applyCaseVideo(record, root)`. It leaves the poster-only DOM byte-for-byte unchanged with no safe source; otherwise it assigns one source, refreshes Case 02 state immediately, preserves controls, removes `aria-disabled`, calls `load()` once, and never calls `play()`.
- Added safe poster replacement with localized `data-en-alt`/`data-zh-alt` attributes and stale local responsive-attribute cleanup.
- Exposed `window.lonmaRefreshCaseVideoState` from `case-02.js`. No scroll listener, GSAP timeline, or new animation system was added.
- Added Case 02 markers for case number, title, vehicle model, year, poster/video, and story container. The static story is deliberately retained after CMS loading to preserve its exact existing layout and reduced-motion state.

## Regression Evidence

Regenerated the generator-owned page:

```text
node scripts/render-detail-pages.mjs
```

Focused Task 5 regression suite passed with bundled Node:

```text
node --test case-02.test.mjs sanity-case-detail.test.mjs case-detail.test.mjs image-performance.test.mjs
```

Result: 33 passed, 0 failed.

Full root Node suite passed with bundled Node:

```text
node --test
```

Result: 236 passed, 0 failed.

## Self-Review

- `git diff --check` completed without whitespace errors.
- Regeneration changed only `pages/cases/case-02.html`; `pages/services`, `pages/cases.html`, homepage files, source images, and `audit/` have no diff.
- The existing shared detail loader's completed-root and in-flight promise behavior remains covered by its regression tests.
