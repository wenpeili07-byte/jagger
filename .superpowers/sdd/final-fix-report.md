# Final Shop / Case 02 Review Fix Report

Date: 2026-07-22
Branch: `feature/shop-case02-20260722`
Reviewed range: `a538578..295a95c`
Fix starting point: `295a95c`
Status: COMPLETE
Deployment: NOT PERFORMED

This report replaces the stale Link Closure report that previously occupied this
path. It records only the final-review fix wave for the LONMA DYNAMIC Shop and
Case 02 branch.

## Findings And Fixes

### 1. Shared Cache Parity And Warm-Cache Safety

- Advanced `styles.css`, `content-pages.js`, and `script.js` to the single shared
  cache version `shop-case02-20260722-2` on all 18 public pages.
- Updated both page renderers and all exact-reference tests.
- Added `shared-cache.test.mjs`, which checks every public page plus generic Case,
  Case 02, Service, and Shop renderer output for one shared version.
- Added an explicit regression against the known stale warm-cache keys.
- Advanced the modified page-specific assets to
  `shop-final-review-20260722` and `case02-final-review-20260722`.

### 2. Case 02 Geometry And Editorial Flow

- Removed the fixed desktop showcase height and made rail tracks intrinsically
  content-aware with a 118px minimum.
- Restored the 768-1279px media region to `aspect-ratio: 4 / 3`.
- Changed `VIEW COMPLETE BUILD LIST` to the stable same-page fragment
  `#case-02-editorial` and added that ID to the existing story section.
- Added static geometry contracts and browser measurements for 790x900 and
  1440x450.

### 3. Complete Shop Dialog Contract

- Added bilingual compatibility, bilingual inquiry subject, and nullable future
  Shopify product ID fields to all six canonical sample records.
- Rendered those values into escaped card data and the reusable dialog.
- Added truthful `FITMENT NOT CONFIRMED` / `适配尚未确认` status.
- Added product and localized subject query parameters to the Contact action.
- Added backdrop close using `event.target === productDialog`.
- Kept close-button, Escape, backdrop, and focus restoration behavior covered by
  executable tests and live browser checks.

### 4. Marker Reveal And Dialog Action Visibility

- Added conditional marker reveal only when the matching marker lies outside the
  viewport.
- Uses smooth reveal normally and `auto` when reduced motion is requested.
- Reworked the dialog into a bounded panel with a dedicated 64px footer and a
  media cap of `min(42vh, 380px)`, keeping the inquiry action initially visible.

## TDD Evidence

Runtime discovery:

```text
node --test *.test.mjs
Result: exit 127, `node` was not on the default PATH.

/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --version
Result: v24.14.0, exit 0.
```

Baseline before new tests:

```text
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test *.test.mjs
Result: 73 passed, 0 failed, exit 0.
```

RED, shared cache:

```text
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test shared-cache.test.mjs header-layout.test.mjs english-copy.test.mjs
Result: 11 passed, 4 failed, exit 1.
Expected failures: stale content-controller references, homepage stylesheet key,
multi-version parity, and collision with known warm-cache entries.
```

RED, Case 02:

```text
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test case-02.test.mjs responsive-layout.test.mjs
Result: 4 passed, 5 failed, exit 1.
Expected failures: missing fragment target, missing conditional reveal, missing
reduced-motion reveal mode, fixed desktop height, and 16:10 tablet media.
```

RED, Shop dialog:

```text
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test shop.test.mjs
Result: 7 passed, 5 failed, exit 1.
Expected failures: incomplete initial dialog copy, missing canonical fields,
missing render/footer data, missing runtime compatibility/subject, and missing
backdrop handler.
```

GREEN, focused groups:

```text
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test shared-cache.test.mjs header-layout.test.mjs english-copy.test.mjs
Result: 15 passed, 0 failed, exit 0.

/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test case-02.test.mjs responsive-layout.test.mjs
Result: 9 passed, 0 failed, exit 0.

/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test shop.test.mjs
Result: 12 passed, 0 failed, exit 0.
```

The first full GREEN attempt exposed one stale exact assertion in
`cases-page.test.mjs`:

```text
Result: 83 passed, 1 failed, exit 1.
Fix: advanced the exact `styles.css` and `content-pages.js` expectations.
```

## Generation, Syntax, And Static Verification

Regeneration:

```text
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/render-detail-pages.mjs
Result: exit 0.

/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/render-shop-page.mjs
Result: exit 0.
```

Syntax:

```text
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check shop.js
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check case-02.js
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check scripts/render-shop-page.mjs
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check scripts/render-detail-pages.mjs
Result: all four exited 0 with no output.
```

Generated byte parity:

```text
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test link-closure.test.mjs shop.test.mjs
Result: 14 passed, 0 failed, exit 0.
Coverage: all 12 generated Case/Service files and `pages/shop.html` match their
renderers byte for byte.
```

Final full suite:

```text
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test *.test.mjs
Result: 85 passed, 0 failed, exit 0.
```

Static checks:

```text
git diff --check
Result: exit 0, no output.

rg -n "(?:styles\.css|content-pages\.js|script\.js)\?v=(?:global-shell-20260721|global-shell-20260722|global-shell-20260721-2|english-copy-20260721)" --glob '*.html' --glob '*.mjs'
Result: only the four intentional stale-key fixtures in
`shared-cache.test.mjs`; no public HTML or renderer retained an old shared key.

rg -n "(?:shop\.(?:css|js)\?v=(?:shop-catalog-task3-20260722|shop-integration-20260722)|case-02\.(?:css|js)\?v=case02-20260722)" --glob '*.html' --glob '*.mjs'
Result: no matches.
```

## Browser Verification

Local-only server:

```text
python3 -m http.server 4173 --bind 127.0.0.1
Result: served the worktree at http://127.0.0.1:4173 for verification only.
```

Warm-cache upgrade:

- Temporarily loaded old subresource keys `global-shell-20260721` and
  `english-copy-20260721`, then navigated to the current Shop page.
- Live page loaded `shop-case02-20260722-2` for both shared resources.
- Old and new key sets were distinct.
- Language switch still changed `html lang` to `zh-CN`, `SHOP` to `商店`, and
  compatibility to `适配尚未确认`.
- The temporary fixture was deleted before commit.

Targeted measurements:

- 790x900 Case 02 media: 788x591, ratio `1.3333333333333333`; four markers
  visible; no horizontal overflow; fragment target exists.
- 1440x450 Case 02: showcase and parts both measured 643.5px high and ended at
  y=721.5; editorial began at y=721.5; no overlap or overflow.
- 1440x900 Shop dialog: panel y=110-790; inquiry action y=735-779 at scrollTop
  0; action visible initially; compatibility and inquiry subject correct.
- Backdrop, close button, and Escape each closed the live dialog and restored
  focus to `VIEW DETAILS`.
- Marker reveal: marker 04 began outside the viewport at y=-41.84 to -6.00;
  focusing row 04 moved it to y=0.16 to 36.00 and synchronized both active
  states.
- Editorial CTA remained on Case 02, set `#case-02-editorial`, and placed the
  target at y=66.5 in the viewport.

Responsive matrix:

| Viewport | Shop columns | Case columns | Case media ratio | Markers | Overflow | Broken images | Editorial overlap |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 2200x1050 | 3 | 2 | 1.5060 | 4 | 0 | 0 | No |
| 1440x900 | 3 | 2 | 1.1648 | 4 | 0 | 0 | No |
| 1156x900 | 2 | 1 | 1.3333 | 4 | 0 | 0 | No |
| 790x900 | 2 | 1 | 1.3333 | 4 | 0 | 0 | No |
| 390x844 | 1 | 1 | 0.8000 | 0 | 0 | 0 | No |
| 1440x450 | 3 | 2 | 1.4898 | 4 | 0 | 0 | No |

Browser console result: 0 warnings, 0 errors.

## Scope And Concerns

- Approved data/renderer/controller architecture is preserved.
- Six static sample products remain readable without JavaScript.
- No prices, stock quantities, part numbers, guaranteed fitment, cart, checkout,
  Shopify connection, Sanity connection, or other commerce behavior was added.
- No deployment, upload, push, or publication was performed.
- Remaining concerns: none identified in the approved scope.
