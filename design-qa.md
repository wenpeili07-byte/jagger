# Design QA

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
