# Cases Editorial Index Prototype

## Goal

Replace only the right side of the Cases hero with a restrained editorial
project index inspired by Stonecutter Creative. Preserve the existing LONMA
header, hero copy, full-page case background, language behavior, archive
filter, and Case 01 detail route.

## Selected Direction

Use a six-row text index with one shared image preview.

- Each row keeps the case number, English category, Chinese title, and arrow.
- The active row receives a small BMW-blue accent and remains readable.
- On desktop hover, keyboard focus, or click, the related photo fades into a
  shared preview area on the right without scaling.
- The page background changes through the existing fade-only controller.
- On mobile, each row shows its own image above the text because hover is not
  available.

## Alternatives Considered

1. Keep the current independent vertical rail. This preserves the existing
   interaction but does not achieve the lighter editorial character.
2. Use the selected text index with a shared image preview. This gives the best
   balance of clarity, photography, and restrained motion.
3. Use text rows that only change the full-page background. This is visually
   minimal but makes individual case imagery harder to inspect.

## Layout

### Desktop

- The existing two-column hero remains unchanged.
- The right column uses a 42% text index and 58% image preview split.
- Six equal-height rows fit within the existing hero height.
- Neutral gray separators are visible by default.
- The preview uses `object-fit: cover` and no decorative card frame.

### Mobile

- The hero becomes one column using the existing breakpoint.
- Each case becomes a natural vertical media-and-text item.
- Images use a stable aspect ratio and full available width.
- Descriptions and decorative metadata are omitted to keep the page concise.

## Motion

- Preview transition: opacity plus `translateY(12px)` over approximately
  480 milliseconds.
- Active row transition: text color, arrow color, and a short blue line over
  180 milliseconds.
- Full-page background continues to use the existing 640 millisecond fade.
- No image scale, parallax, page-scroll listener, or independent rail scroll.
- `prefers-reduced-motion` removes movement and keeps a short opacity change.

## Interaction And Accessibility

- Rows are links so Case 01 remains navigable and future routes can be added.
- Hover, focus-visible, and click select the corresponding image.
- Keyboard focus has a visible BMW-blue indicator.
- Active state is exposed with `aria-current`.
- Image alternative text names the case rather than remaining empty.

## Files

- `pages/cases.html`: replace the rail markup with the editorial index.
- `case-rail.css`: replace masked-rail rules with the index and preview rules.
- `pages/cases.js`: remove independent wheel capture and add active-case
  selection.
- `cases-page.test.mjs`: update structural, interaction, and responsive checks.

## Verification

- Run the project test suite.
- Check the Cases hero at 1900 x 1050 and 1440 x 900.
- Check mobile at 390 x 844 with no horizontal overflow.
- Verify pointer hover, keyboard focus, Case 01 navigation, background fade,
  archive filtering, and reduced-motion behavior.

