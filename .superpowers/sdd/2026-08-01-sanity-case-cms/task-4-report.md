# Task 4 Report: Generic Case Detail CMS

## Scope

Implemented generic CMS enhancement for Case 01 and Cases 03 through 06 only. Case 02 remains unchanged. The generator owns all changed case HTML; no generated generic page was edited directly.

## RED

Added failing detail-marker assertions in `case-detail.test.mjs` and new DOM-fixture tests in `sanity-case-detail.test.mjs`.

Command run with bundled Node:

```text
node --test sanity-case-detail.test.mjs case-detail.test.mjs content-pages.test.mjs
```

Observed expected failures before implementation:

- Case 01 lacked `data-case-slug="case-01"`.
- `sanity-case-detail.js` was absent (`ERR_MODULE_NOT_FOUND`).

## GREEN

Added `sanity-case-detail.js`, generator-owned CMS slots, the generic-case module script, and unframed responsive media-section rules. The renderer uses DOM APIs for CMS data, leaves invalid/missing records untouched, preserves an empty static media container, clears stale local-image responsive attributes, and dispatches one content-update event after a successful patch. The existing Task 3 language refresh listener remains the single listener.

Focused command passed: 14 tests, 0 failures.

## Regression Evidence

Regenerated with:

```text
node scripts/render-detail-pages.mjs
```

Required regression command passed with bundled Node:

```text
node --test sanity-case-detail.test.mjs case-detail.test.mjs content-pages.test.mjs link-closure.test.mjs image-performance.test.mjs
```

Result: 23 tests passed, 0 failed.

`git diff -- pages/services` was empty after regeneration, so all regenerated Service detail pages are byte-for-byte unchanged. `pages/cases/case-02.html` has no diff and no `sanity-case-detail.js` reference.

## Review Fix Round

### RED

Added failing regression tests for stale local-image width and height removal, unsafe photo-story sources (`javascript:`, local video paths, arbitrary remote URLs, and dimensionless Sanity URLs), all-invalid media fallback preservation, and repeated detail-loader success/failure lifecycle behavior.

Command run with bundled Node:

```text
node --test sanity-case-detail.test.mjs
```

Observed four expected failures: stale `width`, unsafe media rendering, and incompatible repeated-loader lifecycle calls.

### GREEN

Exported `isSafeCaseImage` from the Task 2 data boundary and reused it in the detail renderer. Local images are restricted to canonical `/assets/images/` paths; remote images require canonical Sanity CDN image URLs and finite positive dimensions. Dimensionless local images now clear `srcset`, `sizes`, `width`, and `height`. Invalid media sections are skipped, preserving the static container when none remain.

The detail loader now accepts testable dependencies and follows the overview lifecycle policy: a successfully patched root fetches, writes, and dispatches only once; repeated failures may retry but warn only once per root.

No generator, generated page, Case 02, Service page, CSS, audit, or image file changed in this review round, so regeneration was not needed.

Verification with bundled Node:

```text
node --test sanity-case-detail.test.mjs case-detail.test.mjs content-pages.test.mjs link-closure.test.mjs image-performance.test.mjs
node --test *.test.mjs
```

Results: Task 4 suite 27 passed, 0 failed. Full non-audit suite 225 passed, 0 failed.
