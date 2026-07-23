# Design QA

## Mobile Spacing Refinement

- Reference: the existing Cases mobile page and the before captures in `audit/mobile-spacing-20260722/` established the target rhythm. The corresponding after captures live in `audit/mobile-spacing-20260722/after/`.
- Implemented viewport: 390 x 844, English default state, with the shared fixed bottom navigation visible.
- About: the first image-led section is 540px tall and the process section begins at y=598, 50px earlier than before.
- Services: the editorial introduction is content-led rather than fixed-height; the first service begins at y=553, 88px earlier than before.
- Case detail: the lead copy is 420px tall and the first project image begins at y=478, 53px earlier than before.
- Service detail: the lead copy is 390px tall and the first service image begins at y=448, 80px earlier than before.
- Cases: intentionally unchanged so its approved masked rail rhythm and label placement remain intact.
- Desktop regression: all four affected routes were rechecked at 1440 x 900. Their 1440px canvas, desktop navigation, image geometry, and zero horizontal overflow remain unchanged.
- No unresolved P0/P1/P2 spacing, clipping, or overflow findings remain.

final result: passed

## Mobile Navigation And First Screens

- Reference: approved Home / Shop / Contact mobile direction in `exec-b0c6694e-5a1f-46bd-ab32-b6834e4e90a9.png`.
- Implemented viewport: 390 x 844 in the in-app browser, English default state.
- Shared shell: all seven checked routes use a 56px single-row header and a fixed five-item 65px bottom navigation module. English and Chinese labels fit without horizontal overflow.
- Home: the original automotive hero and case content remain intact while the primary navigation moves to the bottom module.
- Shop: the selected vehicle is summarized in a compact editable block, the existing filter action remains functional, and the first square product image enters the first viewport.
- Contact: the source image letterboxing is cropped outside the 470px hero, the secondary introduction remains available to assistive technology without delaying the form, and the first two fields are visible above the bottom navigation.
- Desktop regression: at 1440 x 900 the navigation returns to the header, uses static positioning, and the page has no horizontal overflow.
- Remaining P3 difference: the implementation preserves the site's real vehicle and product photography, so crops and visual density differ slightly from the concept composite.

final result: passed

## Shop

- Reference viewport and state: approved Option 1 image at 1487 x 1058, reviewed against the equivalent 1440 x 1024 English default catalog state. The extra bottom reference edge was disregarded; no horizontal crop was used.
- Implemented viewport and state: 1440 x 1024, BMW / G80 M3 / 2024 / G8X, six samples, Featured sort, filters clear, dialog closed.
- P0/P1/P2 findings and fixes: one P2 integration issue was found when the vehicle controls were exercised. Unsupported makes retained the BMW dependent values and Find Parts was inert. The controller now clears and disables unsupported dependent fields, reports the existing bilingual zero-results state, and restores the canonical BMW sample. No unresolved P0/P1/P2 visual findings remain.
- Remaining P3 polish: the six generic, unbranded square product photographs differ from the illustrative composite, as required by the approved implementation brief. Truthful `SAMPLE`, `INQUIRY ONLY`, and `INQUIRE` copy replaces the reference's unapproved inventory claims.

## Case 02

- Reference viewport and state: approved photo-led Case 02 image at 1487 x 1058, reviewed against the equivalent 1440 x 1024 English state with marker and row 01 active.
- Implemented viewport and state: 1440 x 1024, real Case 02 hero, four synchronized markers, four category-level parts rows, and the preserved editorial content below the showcase.
- P0/P1/P2 findings and fixes: the mobile marker rule used the presentation class instead of the required semantic hook. It now targets `[data-case-marker]`, and runtime checks confirm zero visible markers below 768px while all four numbered rows remain. No unresolved P0/P1/P2 visual findings remain.
- Remaining P3 polish: category-only titles and generic media intentionally replace the reference's illustrative product and fitment claims. The existing back link and editorial continuation remain to preserve the approved Case detail structure.

## Responsive Matrix

| Viewport | Shop | Case 02 |
| --- | --- | --- |
| 2200 x 1050 | 3 columns, desktop rail, no overflow | split showcase, 4 markers, no overflow |
| 1440 x 1024 | 3 columns, desktop rail, no overflow | split showcase, 4 markers, no overflow |
| 1440 x 900 | 3 columns, desktop rail, no overflow | split showcase, 4 markers, no overflow |
| 1156 x 900 | 2 columns, collapsed filter, no overflow | stacked showcase, 2-column rail, no overflow |
| 790 x 900 | 2 columns, collapsed filter, no overflow | stacked showcase, 2-column rail, no overflow |
| 390 x 844 | 1 column, collapsed filter, no overflow | stacked showcase, markers hidden, 4 rows retained |

All observed images loaded, visible Shop text fit its containers, the Case display title rendered without visible clipping or overlap, and the browser console had no warnings or errors.

final result: passed
