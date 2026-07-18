# LONMA DYNAMIC Services Page Redesign

Date: 2026-07-18

## Selected Direction

Workshop Process Rail, visual direction 2.

Visual target:

`/Users/wenpeili/.codex/generated_images/019edc34-b0b1-7e33-adc9-d777315e90eb/call_EYiEgDevLPftYPjI4dbu35el.png`

## Goal

Replace the current hero-plus-list presentation with one continuous service
experience. A visitor should understand that LONMA's six capabilities work
together as a complete vehicle process, while still being able to enter any
individual service page directly.

The redesign only changes `pages/services.html` and its page-specific styling
and behavior. The homepage, cases pages, About page, Contact page, written
service content, service routes, shared header, and language system remain
unchanged.

## Desktop Composition

The primary design canvas is 1900 x 1050. The content remains centered at a
maximum width of 1900 px and does not stretch on larger displays.

The sticky shared header remains at the top. Below it, the first section becomes
one full-height editorial workspace:

- A fixed-width left introduction column occupies roughly 24% of the canvas.
- A wide service rail occupies the remaining space.
- The left column contains `SERVICES`, the title `从目标到成车`, one short
  statement, and a restrained blue rule.
- The right rail contains six equal service rows.
- All six rows are visible within the 1050 px desktop canvas.
- Each row combines its number, English label, Chinese title, short description,
  arrow, and a wide automotive image crop.
- Text and imagery alternate their relative emphasis so the rail reads as a
  continuous workshop process rather than six separate cards.

No content is placed inside rounded containers. Separation comes from spacing,
alignment, and neutral horizontal dividers.

## Service Order And Links

The existing order and routes remain:

1. `01 BUILD / 汽车改装` -> `./services/build.html`
2. `02 PARTS / 汽车配件` -> `./services/parts.html`
3. `03 PHOTO / 汽车摄影` -> `./services/photo.html`
4. `04 ECU / ECU 特调` -> `./services/ecu.html`
5. `05 CHASSIS / 底盘设定` -> `./services/chassis.html`
6. `06 EXHAUST / 进排气` -> `./services/exhaust.html`

The current Chinese and English descriptions remain unchanged.

## Image Direction

Only existing LONMA photography is used in the first implementation. The six
current optimized case images provide the initial rail imagery and use
`object-fit: cover` with service-specific object positions.

The image slot remains replaceable so dedicated workshop, wheel, ECU, chassis,
and exhaust photography can be added later without changing the layout.

Images stay clear and stable. Hovering or focusing a row does not zoom, scale,
or shift the image.

## Interaction

Every row is one semantic link with a full-row hit area.

Default state:

- Neutral gray dividers.
- White title text.
- Muted secondary text.
- No permanent blue frame.

Hover, keyboard focus, and active state:

- A narrow dark-blue line appears at the left edge of the active row.
- The active row receives a subtle `rgba(28, 93, 153, 0.14)` surface tint.
- The number and arrow use the brighter blue.
- The arrow moves horizontally by no more than 6 px.
- The image may become slightly brighter through opacity or filter only.
- The effect uses a 180-240 ms ease and never changes the row dimensions.

Keyboard focus remains visible with a two-pixel bright-blue outline placed
inside the row.

## Responsive Behavior

At widths below 1180 px:

- The left introduction column becomes narrower.
- Service row text columns simplify.
- Images keep a stable minimum width and do not force horizontal scrolling.

Below 768 px:

- The introduction becomes a normal section above the rail.
- Each service becomes a vertical text-and-image row.
- Rows remain equal in structure but may grow naturally with translated text.
- Descriptions wrap without clipping.
- Hover-only effects are removed; tap and keyboard focus remain.
- The page stays fluid at 390 px with no horizontal overflow.

No `transform: scale()` or `width: 100vw` is used for layout.

## Visual System

- Base background: `#111315`
- Secondary background: `#171A1D`
- Primary text: `#E8E7E2`
- Secondary text: `#8D9195`
- Default border: `rgba(232, 231, 226, 0.15)`
- Primary dark blue: `#1C5D99`
- Active blue: `#2E7DBD`
- Blue glow: `rgba(28, 93, 153, 0.18)`

Blue is limited to the active navigation state, row edge, number, arrow, and
small rules. The page does not use gradients, decorative blobs, card shadows,
or permanent blue borders.

## Content And Language

The existing `data-zh` and `data-en` system remains the single source of
bilingual page text. The language toggle continues to persist the selected
language between pages.

English and Chinese strings share the same layout and must not overflow at the
desktop or mobile breakpoints.

## Implementation Boundaries

The redesign reuses the existing:

- shared header markup and styles
- `content-pages.js` language handling
- six service detail routes
- local image assets
- color variables and focus behavior

New behavior stays isolated behind services-page class names. Shared About,
Contact, homepage, and cases styles are not changed unless a shared regression
is discovered during verification.

## Verification

Before handoff:

- Update the existing content-page tests for the new service-rail structure.
- Confirm all six links and bilingual strings.
- Test at 1900 x 1050, 1440 x 900, and 390 x 844.
- Confirm no horizontal overflow or clipped text.
- Confirm equal desktop row heights.
- Confirm hover does not resize the layout.
- Confirm keyboard focus is visible.
- Confirm the browser console has no errors.
- Compare the rendered 1900 x 1050 page side by side with the selected visual
  target and fix visible hierarchy, spacing, crop, and typography differences.
- Run the complete existing test suite.
