# Shop Product Grid And Card Interaction Design

## Goal

Make Shop products easier to open while increasing catalog density in a way
that follows the approved R44-inspired responsive pattern.

## Card Interaction

- The full visible area of every product card is interactive, including its
  image, category, title, and footer.
- The forged-wheel card navigates to its existing product detail page.
- The other five sample cards open their existing product detail dialog.
- Each card exposes one primary interactive target. The visible CTA remains
  part of that target rather than becoming a second nested control.
- Pointer hover uses the existing dark-blue treatment.
- Keyboard users receive a visible focus indicator and can activate cards with
  the expected link or button behavior.
- Dialog focus returns to the card that opened it.

## Responsive Grid

- Wide desktop, `1400px` and above: five products per row.
- Tablet and narrower desktop, `741px` through `1399px`: two products per row.
- Mobile, `740px` and below: two products per row.
- Product imagery remains square and uses `object-fit: cover`.
- Card titles wrap without clipping; card rows maintain consistent heights.
- Existing filters, sorting, bilingual copy, and product query parameters are
  unchanged.

## Card Typography

- Increase category, availability, and CTA labels from the current compact
  `10px` treatment to a readable `11px` to `12px` range.
- Keep product titles in a responsive `17px` to `21px` range.
- Wide-desktop titles remain compact enough for five columns.
- Tablet and mobile titles wrap naturally inside two-column cards without
  clipping, covering imagery, or moving the CTA outside the card.

## Implementation Shape

- Keep the checked-in Shop page generated from the existing product data and
  renderer.
- Update the renderer so each card has one full-card link or button target.
- Update the Shop controller to open dialogs from full-card buttons while
  preserving the existing product-detail URL synchronization.
- Update Shop CSS for the `5 / 2 / 2` grid, larger card typography, and
  full-card hover/focus states.

## Verification

- Add a failing regression test for full-card interaction and `5 / 2 / 2`
  breakpoints before implementation.
- Run the focused Shop tests, then the full project suite.
- Check wide desktop, tablet, and mobile layouts in the browser.
- Confirm the forged-wheel card enters its detail page and each other card
  opens and closes its dialog correctly.
- Confirm long English and Chinese product titles remain fully visible at all
  three responsive sizes.
