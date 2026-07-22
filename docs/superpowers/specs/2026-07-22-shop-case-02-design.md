# LONMA DYNAMIC Shop And Case 02 Design

**Date:** 2026-07-22
**Status:** Visual direction approved, pending written-spec review
**Selected directions:** Shop option 1 and Case 02 adapted from option 3

## Goal

Add the first LONMA DYNAMIC commerce surface and turn Case 02 into the first
case page that connects a finished build to its component categories.

The release must:

- preserve the current English-first bilingual site and 1900px canvas;
- add a useful Shop page based on the approved model-first catalog image;
- redesign only Case 02 around the approved photo-led `PARTS USED` layout;
- keep the other five case detail pages unchanged;
- prepare clean content boundaries for later Shopify and Sanity integration;
- avoid claiming inventory, pricing, fitment, or installed parts that have not
  been confirmed by LONMA.

## Visual Targets

- Shop: `assets/2026-07-22-shop-option-1.png`
- Case 02: `assets/2026-07-22-case-02-shop-the-build.png`

Both images define layout hierarchy and visual tone. Generated product names,
prices, quantities, and compatibility claims are illustrative and are not
approved business data.

## Release Scope

### Included

- Add `SHOP` / `商店` to the shared navigation on every public page.
- Add `pages/shop.html` as an English-first bilingual catalog page.
- Add client-side vehicle and category filters using local sample data.
- Add six individual, consistent product images for the sample catalog.
- Make each `VIEW DETAILS` action open an accessible in-page product detail
  dialog with category, description, compatibility status, and inquiry action.
- Redesign `pages/cases/case-02.html` with the approved Case 02 composition.
- Add a `PARTS USED` rail to Case 02 with four category-level entries.
- Add desktop, split-screen, tablet, and mobile behavior.
- Add regression tests for navigation, language, interactions, generated Case
  02 markup, accessibility, and responsive constraints.

### Excluded

- Shopify account setup, Storefront API, checkout, payment, tax, shipping,
  inventory, customer accounts, or order management.
- Sanity production connection, authentication, or live content publishing.
- Product-detail routes, cart, wishlist, reviews, discount codes, or search.
- Real prices, brands, part numbers, stock quantities, or guaranteed fitment.
- Redesigning the homepage, services pages, cases archive, or Case 01/03-06.
- Deploying or publishing before the user reviews the local result.

## Information Architecture

### Shared Header

The navigation order becomes:

1. About
2. Services
3. Cases
4. Contact
5. Shop

`SHOP` is active only on the Shop page. `CASES` remains active on Case 02. The
language control stays in its current position and behavior.

### Shop Page

The page is a working catalog, not a marketing landing page.

1. Shared header.
2. Vehicle selector: make, model, year, and chassis.
3. Left filter rail: categories and availability.
4. Product results and sort control.
5. Six sample product cards.
6. Accessible product detail dialog.
7. Shared footer.

The selected default vehicle is a clearly labeled sample. The interface must
say `SAMPLE VEHICLE` / `示例车型` until real compatibility data is connected.

### Case 02 Page

1. Shared header with Cases active.
2. Large Case 02 image using the existing pink-car photograph.
3. `CASE 02 / ROAD & TRACK SETUP` title over the image.
4. Four small numbered markers that map to the parts rail.
5. `PARTS USED` rail for brakes, suspension, wheels, and ECU calibration.
6. `VIEW COMPLETE BUILD LIST` action that moves to the editorial detail below.
7. A short photo-and-text project story using the approved Case 02 copy.
8. Previous/next case navigation and shared footer.

The markers are navigation aids, not technical annotations. On hover, focus,
or activation, a marker and its matching rail row share the brighter blue
state. They do not claim a specific manufacturer or part number.

## Shop Product Model

The first release uses six local sample records:

| Category | English label | Chinese label |
| --- | --- | --- |
| Wheels | Forged Wheel | 锻造轮毂 |
| Intake | Carbon Intake System | 碳纤维进气系统 |
| Suspension | Coilover Kit | 绞牙避震套件 |
| Brakes | Big Brake Kit | 高性能刹车套件 |
| Aero | Carbon Aero | 碳纤维空气动力套件 |
| Exhaust | Performance Exhaust | 性能排气系统 |

Each record owns:

- stable ID and category;
- bilingual display name and short description;
- local image path and bilingual alt text;
- sample compatibility labels;
- inquiry subject;
- future optional Shopify product ID.

No price or stock quantity appears in this release. Availability uses
`INQUIRE` / `请咨询`, not `IN STOCK`.

## Interaction Design

### Vehicle Selector

- Controls are real labeled `select` elements.
- Changing the make resets dependent fields.
- `FIND PARTS` updates the result summary and announces it through an ARIA live
  region.
- Unsupported combinations return a useful empty state and a contact action.
- BMW G80 M3 remains the initial sample shown in the selected visual.

### Filters And Product Details

- Category checkboxes filter cards without changing page geometry.
- The result count updates with every filter change.
- Sort supports Featured and Category.
- `VIEW DETAILS` opens one reusable dialog rather than creating six routes.
- The dialog closes by close button, Escape, or backdrop click and returns focus
  to the triggering product.
- The primary dialog action links to the existing Contact page with a product
  inquiry query parameter. No email address is invented.

### Case 02 Parts Rail

- Hover, keyboard focus, and click use the same active state.
- Selecting a row highlights its matching marker and scrolls the marker into a
  visible position only when required.
- On touch screens, rows use click/tap only; no hover-only information exists.
- Reduced-motion mode removes movement and preserves instant state changes.

## Responsive Behavior

### Wide Desktop: 1280px And Above

- Keep the site centered within the existing 1900px maximum canvas.
- Shop uses a fixed-width filter rail and a three-column product grid.
- Vehicle controls remain on one row when space permits.
- Case 02 uses the approved image-left, parts-right composition.

### Split-Screen And Tablet: 768px To 1279px

- Vehicle controls wrap into two rows.
- Shop filters collapse into a native disclosure above a two-column grid.
- Case 02 image and parts rail stack; the image keeps a stable 4:3 region.
- Text must not be covered when the viewport height is short.

### Mobile: Below 768px

- All content is single column.
- Product cards use one column with a stable image aspect ratio.
- Vehicle fields remain full-width and keep 44px minimum controls.
- Case markers are hidden from the image; numbered parts rows remain available
  below it so no interaction depends on precise image coordinates.
- No horizontal scrolling, whole-page scaling, or `100vw` layout is allowed.

## Visual System

- Background: `#111315`
- Secondary background: `#171A1D`
- Primary text: `#E8E7E2`
- Secondary text: `#8D9195`
- Default borders: neutral translucent gray
- Primary accent: `#1C5D99`
- Active and focus-visible accent: `#2E7DBD`

Blue is limited to active navigation, selected filters, markers, arrows, short
rules, and focus-visible indicators. Product cards keep neutral borders by
default. Corners remain square or no more than 4px.

## Image Assets

Six product images will be produced as separate square raster assets, not
cropped from the composite mockup. They share:

- black studio backgrounds;
- consistent camera height and lighting;
- clear product silhouette;
- no third-party logo, text, watermark, or unverified branding;
- responsive WebP output plus a fallback format where required.

The existing Case 02 photograph remains the hero source. It must not be recolored
or replaced by a generated vehicle.

## Content And Language

- English remains the initial HTML language.
- Chinese switches in the same tab using the current session behavior.
- New navigation, controls, filter labels, empty states, dialog content, alt
  text, and Case 02 parts labels all switch together.
- Copy remains concise American English and approved Chinese automotive terms.
- Generated sample data is explicitly labeled as sample or inquiry-only.

## Future Backend Boundary

This release keeps the public UI independent from a backend, while defining the
future ownership boundary:

- Shopify will own product IDs, variants, prices, inventory, checkout, orders,
  customers, taxes, shipping, returns, and discounts.
- Sanity will own Case text, bilingual fields, hero video, gallery sections,
  parts-used references, SEO, draft state, and publish state.
- A later integration may map Sanity parts-used references to Shopify product
  IDs without changing the Case 02 visual layout.

## Accessibility And Failure Handling

- Every form control has a visible label.
- All images have useful bilingual alt text.
- Product dialog focus is trapped while open and restored after close.
- Active states are not communicated by color alone.
- Keyboard focus uses the brighter blue accent.
- If JavaScript fails, the six products remain visible and Contact remains
  reachable.
- If an image fails, product names and categories remain readable.

## Testing And Verification

Automated tests must verify:

- all public headers expose one working Shop link;
- Shop ships English-first and switches all new copy to Chinese;
- filters, result count, empty state, and dialog hooks exist;
- Case 02 uses its special layout and existing cover image;
- Case 01 and Case 03-06 retain their current templates;
- no unapproved prices, stock claims, brands, or part numbers ship;
- focus-visible and reduced-motion rules exist;
- the full existing suite remains green.

Browser verification must cover:

- 1900 x 1050 wide desktop;
- 1440 x 900 desktop;
- approximately 1156 x 900 split-screen laptop;
- 790 x 900 narrow split-screen;
- 390 x 844 mobile;
- English initial load and Chinese switching;
- vehicle selection, category filtering, empty state, dialog keyboard flow;
- Case 02 marker and rail interaction;
- console errors, missing assets, overflow, and text overlap.

## Acceptance Criteria

- The Shop page visually matches selected option 1 while remaining truthful
  about sample data and the absence of checkout.
- Case 02 visually matches the approved revised option 3 and uses the real pink
  car photograph.
- The Shop and Case 02 share the established LONMA header, footer, typography,
  palette, and responsive canvas.
- Core interactions work with mouse, keyboard, and touch.
- The other confirmed public pages are not redesigned.
- The full automated suite and browser verification pass before handoff.
