# Services Square Hover Preview

## Goal

Update the currently deployed Services page without changing its editorial
structure. Keep the left introduction column and the six stacked service rows,
including each row's permanently visible right-side sample image. Add a
separate square image preview that belongs to each row and appears only while
that row is hovered or focused.

## Visual Reference

The interaction follows the project-row behavior on Stonecutter Creative's
`/work-3` page:

- the image is an absolutely positioned child of its row;
- it is hidden by default;
- hover reveals it with opacity, a small upward movement, and a slight rotation;
- the arrow rotates at the same time;
- the preview floats above the list and does not change row dimensions.

For LONMA DYNAMIC, the reference is adapted to the existing sharper automotive
style:

- fixed `1 / 1` aspect ratio;
- the existing horizontal image column remains visible beneath the preview;
- no new card background or decorative frame;
- a subtle shadow and no more than the site's existing small corner radius;
- existing BMW-inspired blue remains limited to active text, line, arrow, and
  focus states.

## Desktop Interaction

Each `.service-process-row` keeps its current number, category, Chinese or
English text, description, link, arrow, permanent horizontal sample, and image
asset. A second image element reuses that row's source for the overlay.

The square preview:

- is positioned on the right side of the service list;
- uses `clamp()` sizing so it remains approximately 320-420 px while fitting
  the available content canvas;
- uses `aspect-ratio: 1 / 1` and `object-fit: cover`;
- starts at `opacity: 0`, slightly lower, and with a small negative rotation;
- becomes visible over about 500 ms with a smooth ease;
- receives the highest stacking order only for the active row;
- never changes the width or height of the row.

Hovering any part of the row, including its text, must keep the same animation
active. Keyboard focus must produce the same visible result. Moving directly
across text, number, arrow, or image must not cause a flicker or restart loop.

## Mobile Interaction

Below the existing mobile breakpoint, hover behavior is removed. Images become
the existing full-row mobile background treatment. The redundant square
preview is hidden, preserving the original touch behavior without introducing
a second tap before navigation.

## Motion And Performance

- Animate only `opacity` and `transform`.
- Do not animate layout properties.
- Keep the source images already used by the deployed page.
- Respect `prefers-reduced-motion` by removing translation and rotation and
  shortening the fade.
- Avoid a shared JavaScript preview state; CSS row-local hover and focus states
  are sufficient and prevent cross-row image mismatches.

## Scope

Files expected to change:

- `pages/services.html`
- `content-pages.css`
- focused Services-page tests if required

The homepage, Cases page, case-detail pages, global header, typography, written
content, and service destinations are outside this change.

## Acceptance Criteria

1. The deployed Services structure remains recognizable and unchanged in
   content and order.
2. Every service keeps its permanently visible horizontal sample on desktop.
3. Hovering or focusing a row adds only that row's correct square preview.
4. Every preview is square and uses `object-fit: cover`.
5. The reveal does not move or resize any row.
6. Hover remains stable while the pointer crosses row text and controls.
7. Mobile keeps one readable image per row and has no horizontal overflow.
8. Keyboard focus remains visible and accessible.
9. Reduced-motion users receive a simple fade.
10. Existing automated tests pass, and desktop plus mobile screenshots show no
    overlap with the header or neighboring content.
