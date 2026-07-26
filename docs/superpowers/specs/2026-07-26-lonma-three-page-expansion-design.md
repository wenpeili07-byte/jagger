# LONMA DYNAMIC Three-Page Expansion

## Goal

Turn the three approved visual concepts into three distinct customer-facing pages without changing the established LONMA DYNAMIC visual system.

The pages should move visitors from inspiration to a concrete next step:

1. Define a complete-car project.
2. Check and select a compatible product.
3. Understand a finished build through video and photography.

## Approved Visual References

- Project planner: `assets/lonma-build-planner-concept.png`
- Shop product detail: `assets/lonma-shop-product-concept.png`
- Case story: `assets/lonma-case-story-concept.png`

These references define hierarchy, image scale, density, and interaction emphasis. Existing site colors, typography, header behavior, language control, mobile bottom navigation, and 1900px content canvas remain authoritative where a generated reference differs from production.

## Shared Rules

- English is the default language on every fresh page load.
- Chinese and English content remain available through the existing language toggle.
- Use the existing dark automotive editorial palette and type system.
- Default dividers and borders stay neutral gray.
- Dark blue is limited to active states, arrows, small rules, and primary actions.
- Use existing LONMA vehicle and product photography; do not introduce stock imagery.
- Preserve the current desktop canvas behavior and mobile breakpoint conventions.
- Keep the shared header and footer behavior consistent with the rest of the site.
- Each page has one primary action and no decorative dashboard cards.

## Page 1: Project Planner

### Route And Entry Points

- New route: `/pages/project.html`
- Link the strongest `START YOUR PROJECT` and vehicle-build calls to this page.
- Keep the regular contact page available as the fallback route.

### Desktop Experience

- Four-step progress rail: `VEHICLE`, `GOAL`, `DIRECTION`, `REVIEW`.
- Split layout with controls on the left and authentic LONMA vehicle imagery on the right.
- Vehicle selection includes brand, model, chassis, and year.
- Goal selection uses three clear modes: `STREET`, `ROAD & TRACK`, and `SHOW`.
- Direction selection covers the existing service categories without turning the page into a parts catalog.
- Review summarizes the selections and sends them to the contact page.

### Data Flow

- Keep the first version client-side and dependency-free.
- Store the current step and selections in one small JavaScript state object.
- Preserve selections when moving backward.
- The final action opens `/pages/contact.html` with safe query parameters.
- The contact page pre-fills vehicle, service, and message fields from those parameters.
- No account, database, pricing engine, or automatic quote is included in this release.

### Mobile

- Use one column.
- Keep a compact progress indicator above the current step.
- Place the vehicle image after the active controls.
- Keep the primary action visible without covering form content.

## Page 2: Shop Product Detail

### Route And Entry Points

- New route: `/pages/shop/forged-wheel.html`
- Link the forged-wheel product from the existing shop page.
- Preserve category and vehicle-filter query parameters when present.

### Desktop Experience

- Large product stage on the left using the existing forged-wheel image.
- Product and fitment controls on the right.
- Show product title, short benefit statement, verified vehicle fitment, diameter, width, finish, quantity, and price.
- Finish choices use real swatches.
- Primary action is `ADD TO BUILD`, not checkout.
- Secondary action is `REQUEST FITMENT CHECK`.
- Technical specifications begin below the first viewport.

### Interaction

- Vehicle fitment is always explicit.
- Unsupported combinations show a restrained inline message and disable the primary action.
- Selected options are included when the user continues to the project planner or contact page.
- No payment processing, inventory reservation, customer account, or order management is included yet.

### Mobile

- Product image appears first, followed by fitment and configuration.
- Thumbnails become a horizontal strip.
- A compact bottom action bar shows price and the primary action.
- Long technical specifications stack without horizontal scrolling.

## Page 3: Case 02 Video Story

### Route And Entry Points

- Redesign the existing `/pages/cases/case-02.html`.
- Preserve links from the case archive and adjacent-case navigation.

### Desktop Experience

- Open with one full-width 16:9 video poster.
- Overlay only the case number, project title, vehicle, year, and play control.
- After a generous pause, alternate large photographs with short editorial notes.
- Keep the story image-led; avoid a specification table in the first viewport.
- Use `THE DIRECTION` and `TEST, ADJUST, REPEAT` as the first two story beats.
- End with previous and next case navigation plus a project inquiry action.

### Video Behavior

- Use a native video element with poster image, controls, preload metadata, and no autoplay audio.
- If no final video asset exists, retain the poster and present a non-broken disabled play state.
- Respect reduced-motion preferences.

### Mobile

- Keep the video poster full width.
- Stack images and text in story order.
- Remove text overlays when they would cover important vehicle details.
- Keep next-case navigation large enough for touch.

## Content And Localization

- All visible interface text receives `data-en` and `data-zh` values.
- Default document text is English.
- Product measurements and vehicle chassis codes remain language-neutral.
- Generated mock text is a direction, not final technical product data; production specifications must be verified before launch.

## Accessibility And Performance

- Maintain visible keyboard focus using the brighter accent blue.
- All controls have programmatic labels and logical tab order.
- Images use useful alt text and fixed aspect ratios to prevent layout shift.
- Use `object-fit: cover` only where cropping does not hide the vehicle or product.
- Lazy-load below-the-fold images.
- Keep animation transform- and opacity-based.
- Disable nonessential motion under `prefers-reduced-motion`.

## Verification

- Run the existing automated test suite and syntax checks.
- Add focused tests for route links, localization coverage, planner state, contact prefill, fitment state, and video fallback.
- Check desktop at 1440x900 and 1900x1050.
- Check split-screen desktop around 1000-1200px wide.
- Check mobile at 390x844 and 430x932.
- Verify no horizontal overflow, covered labels, clipped controls, or inaccessible focus states.
- Verify every new entry point and back link on the production-style local preview.

## Delivery Order

1. Shared routing and bilingual helpers.
2. Project planner and contact prefill.
3. Shop product detail and fitment behavior.
4. Case 02 video story.
5. Cross-page responsive and accessibility verification.

## Out Of Scope

- Checkout and payments.
- Customer accounts.
- Order tracking.
- Live inventory.
- Automatic pricing or quotes.
- A production CMS migration.
- 3D vehicle rendering.
