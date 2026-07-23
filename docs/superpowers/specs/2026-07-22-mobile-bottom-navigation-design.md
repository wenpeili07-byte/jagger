# Mobile Bottom Navigation Design

## Goal

Improve LONMA DYNAMIC on screens up to 767px without changing desktop layouts. The selected visual target is the combined Product Design mock at `/Users/wenpeili/.codex/generated_images/019edc34-b0b1-7e33-adc9-d777315e90eb/exec-b0c6694e-5a1f-46bd-ab32-b6834e4e90a9.png`.

## Shared Mobile Shell

- Keep a 56px top row containing only `LONMA DYNAMIC` and the bilingual switch.
- Move the five existing navigation links into a fixed, edge-to-edge bottom module.
- Use five equal columns, a 64px navigation height, safe-area padding, neutral borders, and the existing dark blue active line.
- Preserve 44px minimum touch targets, keyboard focus, bilingual labels, and the current desktop header above 767px.
- Add bottom page padding so the fixed navigation never hides content.

## Shop

- Show a compact mobile vehicle summary with a real vehicle thumbnail, selected make/model/year/chassis, and an `EDIT` control.
- Keep the existing selects functional inside a collapsible editor.
- Collapse the editor again after `FIND PARTS` and synchronize the visible summary with selected values.
- Style the mobile filter summary as the primary compact filter action and expose the first square product image in the initial viewport.
- Keep the desktop selector and catalog unchanged.

## Contact

- Reduce the mobile contact hero height and spacing so the heading and beginning of the inquiry form appear in the initial viewport.
- Remove the current dead space between hero and form while retaining the existing image, copy, and form fields.
- Keep all form behavior and desktop layout unchanged.

## Verification

- Static tests must verify the shared bottom navigation geometry, safe-area spacing, Shop summary structure and behavior hooks, and compact Contact rules.
- The full Node test suite must pass.
- Browser verification must cover Home, Shop, and Contact at 390x844 and desktop at 1440x900.
- The final Product Design comparison must report no P0, P1, or P2 mismatch against the selected mock.
