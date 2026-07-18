# Services Editorial Showcase

## Goal

Apply the approved Cases editorial-index interaction to the standalone Services
page. Keep the current Services hero, shared header, bilingual content, six
service routes, footer, homepage business modules, and service detail pages
unchanged.

## Selected Direction

Keep the current `WHAT WE CHANGE.` hero. Replace the flat six-row service list
below it with one editorial showcase:

- A six-row text index occupies the left side.
- One shared service photograph occupies the right side.
- Hover, keyboard focus, or click selects a service and cross-fades its photo.
- Every row remains a link to its existing service detail page.
- Mobile places each service photo directly above its text.

This keeps the Stonecutter-style restraint while making the Services page more
visual and easier to scan.

## Alternatives Considered

1. **Editorial index with shared preview — selected.** Clear relationship to the
   new Cases page, preserves descriptions, and gives photography enough space.
2. **Full-page background switching.** More immersive, but makes service copy
   harder to read and duplicates the Cases page too closely.
3. **One image inside every desktop row.** Direct and informative, but creates a
   denser workshop rail rather than the requested minimal case-index effect.

## Desktop Layout

- The existing 1900 px centered content canvas remains.
- The current hero remains 540 px high.
- The showcase below the hero uses approximately 42% text index and 58% image.
- Six equal-height rows fit beside a stable 620 px preview.
- Rows use neutral gray separators with no card background or permanent blue
  border.
- Each row keeps its number, English label, translated title, short translated
  description, and arrow.
- The shared image uses `object-fit: cover`, no frame, and no scaling.

## Interaction

Default state:

- The first service is active.
- Titles remain readable in white or soft white.
- Numbers, descriptions, and labels remain muted.
- Separators use the existing neutral `--line` color.

Hover, focus, and click:

- A short BMW-blue line marks the active row.
- The number and arrow use `--accent-bright`.
- The selected image fades in with `opacity` and `translateY(12px)`.
- Transition duration is approximately 480 milliseconds.
- Row dimensions never change.
- Images never zoom or scale.

Keyboard focus uses the existing two-pixel bright-blue indicator. Active state
is exposed with `aria-current`.

## Content And Routes

Keep the established order, copy, and links:

1. `01 BUILD / 汽车改装` -> `./services/build.html`
2. `02 PARTS / 汽车配件` -> `./services/parts.html`
3. `03 PHOTO / 汽车摄影` -> `./services/photo.html`
4. `04 ECU / ECU 特调` -> `./services/ecu.html`
5. `05 CHASSIS / 底盘设定` -> `./services/chassis.html`
6. `06 EXHAUST / 进排气` -> `./services/exhaust.html`

The existing optimized Case 01–06 images are reused as the first visual set.
They remain replaceable with dedicated workshop photography later.

## Mobile Layout

Below 760 px:

- The shared preview is hidden.
- Every service row displays its own image before the text.
- Images use a stable 4:3 ratio and full available width.
- Descriptions wrap naturally.
- Touch does not depend on hover.
- There is no horizontal overflow at 390 px.

## Behavior And Ownership

- `pages/services.html` owns the showcase markup and image list.
- `content-pages.css` owns responsive presentation behind Services-only class
  names.
- `content-pages.js` adds a small `setActiveService(index)` controller while
  preserving the existing language and contact behavior.
- `content-pages.test.mjs` remains the regression contract.

No page-scroll listener, GSAP dependency, background controller, new route, or
new image asset is introduced.

## Verification

- Run the complete `*.test.mjs` suite.
- Check 1900 x 1050 and 1440 x 900 desktop layouts.
- Check the 390 x 844 mobile layout.
- Verify all six routes and Chinese/English switching.
- Verify row, preview, and `aria-current` synchronization.
- Verify images do not scale.
- Verify the homepage and Cases page remain unchanged.
- Compare the result against the approved Cases editorial index.
- Do not upload or deploy before user approval.

