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
