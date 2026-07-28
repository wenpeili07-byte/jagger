# Mobile Services Compact Rows

## Goal

Bring the mobile Services rows closer to the approved Option 3 reference while
keeping the current content, imagery, links, and interaction behavior.

## Scope

Only the Services index at `pages/services.html` below `768px` changes.
Desktop and tablet layouts, service detail pages, header behavior, the bottom
navigation, bilingual switching, permanent row imagery, and desktop hover
previews remain unchanged.

## Layout

- Inset the service rail by `16px` on both sides.
- Keep the existing `62% / 38%` copy-to-image split.
- Set the row minimum height to `140px`; at `390px` viewport width, the longest
  English title must not make a row taller than `148px`.
- Keep every row fully clickable and retain a touch area taller than `44px`.
- Preserve neutral borders and the existing active/focus blue treatment.

## Typography

- Reduce the service title to `18px`.
- Reduce the service description to `13px` with a compact line height.
- Limit descriptions to two lines on mobile.
- Reduce the English category label and service number proportionally.
- Preserve normal word boundaries and prevent text from entering the image
  column.

## Interaction

- Keep the permanent right-side image visible on touch devices.
- Keep the desktop-only square hover preview disabled on mobile.
- Preserve keyboard focus indicators and the existing active row behavior.
- Do not change JavaScript.

## Verification

- Add a focused CSS regression test before changing production styles.
- Verify the test fails for the current edge-to-edge, oversized layout.
- Implement the minimal mobile CSS changes, then run the focused test and full
  automated suite.
- Check `390 x 844` and `426 x 922` mobile viewports for horizontal overflow,
  text clipping, image distortion, and bottom-navigation clearance.
