# LONMA Project Planner CTA and Visual Redesign

## Goal

Make the project planner easy to discover and bring its desktop presentation close to the approved LONMA build-planner concept while preserving the current four-step workflow, bilingual behavior, validation, and contact handoff.

## Scope

This change covers:

- a prominent project-planner entry in the desktop/tablet header;
- a prominent project-planner entry in the homepage first screen;
- a compact responsive treatment for the new entry on mobile;
- a visual redesign of `pages/project.html` based on the approved concept image;
- desktop, tablet, mobile, keyboard, bilingual, and reduced-motion verification.

It does not change the Shop grid, product data, contact form delivery, Cases pages, service content, or the planner's existing data contract.

## Reference

Primary visual reference:

`docs/superpowers/specs/assets/lonma-build-planner-concept.png`

The reference establishes the intended hierarchy:

1. global header;
2. one compact four-step progress rail;
3. a first-screen split workspace;
4. concentrated controls on the left;
5. one strong vehicle image on the right;
6. one clear blue primary action.

The implementation should match this hierarchy and proportion without reproducing placeholder information that conflicts with the live planner.

## Entry Buttons

### Header Entry

- Desktop and tablet place a rectangular project CTA before the language toggle.
- English label: `START PROJECT`
- Chinese label: `开始项目`
- The CTA links to `pages/project.html` from the homepage and uses the correct relative route on content pages.
- Default background: `#1C5D99`.
- Hover background: `#2E7DBD`.
- Focus-visible uses the existing bright-blue accessible outline and a restrained blue edge glow.
- The button stays rectangular with a maximum 4px radius and does not pulse or continuously animate.

### Mobile Header Entry

- The mobile header uses the shorter labels `BUILD` and `规划`.
- The compact CTA remains visible beside the language toggle without clipping the LONMA DYNAMIC brand.
- At the narrowest supported width, the brand, CTA, and language toggle must remain on one row with no horizontal page overflow.

### Homepage First-Screen Entry

- Add a filled primary CTA below the homepage introduction and above the featured case list.
- English label: `START YOUR PROJECT →`
- Chinese label: `开始你的项目 →`
- Keep `VIEW SERVICES` as a secondary neutral-outline action.
- On desktop, both actions sit in one compact action row when space permits.
- On mobile, the actions stack or wrap without reducing either touch target below 44px.

## Planner Layout

### Removed Structure

- Remove the separate oversized `BUILD YOUR DIRECTION.` title band.
- Do not keep a second page title between the global header and progress rail.
- Avoid additional framed cards around the form or vehicle image.

### Desktop First Screen

- Preserve the shared site maximum width and centered canvas.
- Place the four-step progress rail directly below the global header.
- Use a split workspace below the rail:
  - left control panel: approximately 39%;
  - right media panel: approximately 61%.
- The workspace should fit within the approved desktop first-screen height without using `transform: scale()`.
- Left panel uses the existing dark neutral background.
- Right panel is a full-height, edge-to-edge media region with no decorative card frame.

### Left Control Panel

- Primary heading: `BUILD YOUR PROJECT`
- Supporting line: `Define your vehicle and goals.`
- Keep the live four-step forms and existing validation.
- Step 01 presents vehicle fields in the compact arrangement already supported by the current planner.
- Goal and direction options use compact selection controls with neutral borders and blue selected states.
- The current step's primary action spans the usable form width and uses the primary blue treatment.
- Back remains a quiet secondary action.
- Copy, labels, errors, and review values continue to follow the existing language toggle.

### Right Media Panel

- Use the existing pink BMW image at `assets/images/网页/optimized/case-02.jpg`.
- The image fills the media panel with `object-fit: cover`.
- Crop position must keep the car's front and primary body shape visible at common desktop and tablet ratios.
- Do not add case labels, dark cards, captions, or instructional overlays on top of the image.
- Retain this image consistently across all four planner steps.

## Four-Step Behavior

The redesign must preserve:

1. `VEHICLE`
2. `GOAL`
3. `DIRECTION`
4. `REVIEW`

The existing behavior remains authoritative:

- vehicle values are required before advancing from Step 01;
- at least one project direction is required before review;
- selections survive forward and backward navigation;
- Shop product and vehicle query parameters hydrate the planner;
- review content switches correctly between English and Chinese;
- the final action hands the allowlisted project details to the contact page.

The visual redesign must not change query parameter names or contact prefill behavior.

## Responsive Behavior

### Wide Desktop

- Keep the page inside the shared maximum-width canvas.
- Do not stretch the form or image indefinitely.
- Maintain the approximate 39/61 split.

### Tablet

- Preserve the split while the controls remain readable.
- If the left controls become too narrow, move to a stacked layout at the existing planner breakpoint.

### Mobile

- Stack the progress rail, form, and vehicle image.
- Keep the active step visible without horizontal scrolling.
- Form fields use one or two columns only when labels and values fit.
- Primary and secondary actions remain reachable above the fixed mobile navigation.
- The vehicle image keeps a stable aspect ratio and does not force an excessively tall first screen.

## Interaction and Motion

- Entry CTA hover uses background-color, border-color, and edge-glow transitions only.
- Planner selection states use the existing short fade and border transitions.
- Do not add pulsing, bouncing, parallax, whole-page scaling, or image zoom.
- Respect `prefers-reduced-motion`.

## Accessibility

- All new links have clear bilingual visible labels.
- Focus-visible states remain at least as visible as the existing site focus treatment.
- Header and first-screen CTAs have a minimum 44px touch height.
- Text and controls must not be hidden by the mobile bottom navigation.
- The planner keeps its existing semantic form controls, validation messages, and step state.

## Testing and Acceptance

Automated checks cover:

- header CTA route and bilingual labels;
- homepage primary and secondary CTA routes;
- four-step planner structure;
- unchanged validation and query hydration;
- unchanged contact handoff;
- active language updates in planner and CTA labels;
- desktop and mobile responsive rules;
- reduced-motion treatment.

Browser verification covers at least:

- 1728 x 1050;
- 1024 x 768;
- 390 x 844.

Acceptance criteria:

- the project planner is discoverable from both the header and homepage first screen;
- the planner's first screen visually follows the approved concept hierarchy;
- the oversized intermediate title band is gone;
- the pink BMW is the dominant right-side visual on desktop;
- all four steps remain functional;
- no horizontal overflow, clipped labels, obscured controls, or broken focus states;
- the full automated test suite passes.
