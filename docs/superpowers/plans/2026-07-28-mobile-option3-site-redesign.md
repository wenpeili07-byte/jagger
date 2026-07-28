# Mobile Option 3 Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the approved LONMA DYNAMIC Option 3 mobile design across every public route while preserving the current desktop site, bilingual behavior, planner, Shop, and contact submission.

**Architecture:** Add one shared `mobile-experience.css` stylesheet after each route's existing page stylesheet. Reuse the existing desktop navigation and project entry as the five-item mobile navigation through CSS so route logic and translations remain authoritative. Page-specific mobile overrides stay scoped by the existing page/body classes and do not alter layouts above 767px.

**Tech Stack:** Static HTML, CSS media queries, vanilla JavaScript, official Lucide SVG icon assets, Node test runner, local HTTP preview.

## Global Constraints

- The selected visual target is Option 3 at `/Users/wenpeili/.codex/generated_images/019edc34-b0b1-7e33-adc9-d777315e90eb/call_OCXIwzMzpsjjE8ybkn15IxZr.png`.
- Supporting targets are the approved Services, Cases, Shop, Project, Contact, About, Case Detail, and Product Detail images generated in the same Codex image directory.
- Desktop layouts above 767px must remain unchanged.
- Mobile topbar contains only `LONMA DYNAMIC` and `中 / EN`.
- Mobile bottom navigation order is `SERVICES`, `CASES`, `BUILD`, `SHOP`, `CONTACT`.
- Mobile navigation and core controls keep at least 48px touch targets.
- Body text is at least 16px where it carries primary content.
- Blue `#1C5D99` is reserved for active, selected, focus, arrows, small lines, and primary actions.
- No `width: 100vw`, whole-page `transform: scale()`, gradients, decorative rounded cards, or permanent blue card borders.
- Existing English-first and bilingual behavior must remain intact.
- Existing `project.js`, `shop.js`, `shop-product.js`, `contact-form.js`, and `cases.js` behavior must remain intact unless a failing behavior test requires a scoped change.
- Do not stage or modify the original checkout's untracked files or `audit/`.

---

### Task 1: Shared Mobile Shell

**Files:**
- Create: `mobile-experience.test.mjs`
- Create: `mobile-experience.css`
- Create: `assets/icons/mobile/wrench.svg`
- Create: `assets/icons/mobile/folder.svg`
- Create: `assets/icons/mobile/hexagon.svg`
- Create: `assets/icons/mobile/shopping-cart.svg`
- Create: `assets/icons/mobile/user-round.svg`
- Modify: all 20 public HTML routes
- Modify: `scripts/render-detail-pages.mjs`
- Modify: `scripts/render-shop-page.mjs`

**Interfaces:**
- Consumes: `.topbar`, `.brand`, `.nav`, `.project-entry`, `.lang-toggle`, `body[data-section]`.
- Produces: a 56px topbar containing brand/language only and a safe-area-aware five-item fixed bottom navigation.

- [ ] Add failing tests for stylesheet coverage, mobile-only cascade, five equal navigation positions, 48px targets, icon assets, active states, and safe-area clearance.
- [ ] Run `node --test mobile-experience.test.mjs` and verify failures are caused by the missing stylesheet and icon assets.
- [ ] Add the shared stylesheet and official icon assets.
- [ ] Load the stylesheet last on all public routes and in both generators.
- [ ] Run the focused test and all renderer equality tests.

### Task 2: Home, Services, Cases, And About

**Files:**
- Modify: `mobile-experience.test.mjs`
- Modify: `mobile-experience.css`

**Interfaces:**
- Consumes: `.cover`, `.services-workspace`, `.service-process-row`, `.cases-page`, `.case-archive`, `.about-page`.
- Produces: compact mobile first screens, image-led service rows, readable case labels, and divider-led About process rows.

- [ ] Add failing assertions for each selected mobile layout.
- [ ] Run the focused test and verify the new assertions fail.
- [ ] Implement mobile-only layout, typography, spacing, and image rules.
- [ ] Run focused and existing content/cases tests.

### Task 3: Shop, Project Planner, And Contact

**Files:**
- Modify: `mobile-experience.test.mjs`
- Modify: `mobile-experience.css`

**Interfaces:**
- Consumes: existing Shop vehicle editor/product cards, project progress and actions, and contact form controls.
- Produces: readable two-column catalog, compact planner flow, and a form-first contact screen.

- [ ] Add failing assertions for the approved Shop, Project, and Contact layouts.
- [ ] Run the focused test and verify the new assertions fail.
- [ ] Implement scoped mobile overrides without replacing controller-owned states.
- [ ] Run Shop, planner, contact, and responsive tests.

### Task 4: Detail Pages

**Files:**
- Modify: `mobile-experience.test.mjs`
- Modify: `mobile-experience.css`

**Interfaces:**
- Consumes: case/service detail markup and forged-wheel configuration controls.
- Produces: photo-led case stories, compact service detail pages, and a readable fitment-first product configurator.

- [ ] Add failing assertions for case, service, and product detail mobile layouts.
- [ ] Run the focused test and verify the new assertions fail.
- [ ] Implement scoped detail-page overrides and bottom navigation/action clearance.
- [ ] Run case, service, product, and link tests.

### Task 5: Verification And Design QA

**Files:**
- Modify: `design-qa.md`
- Create: `outputs/mobile-option3-*.png`

**Interfaces:**
- Consumes: completed mobile stylesheet and the generated Option 3 references.
- Produces: passing automated tests, mobile/desktop browser evidence, and a blocking visual comparison report.

- [ ] Run all Node tests and `git diff --check`.
- [ ] Start a local static server and inspect all primary routes at 390x844.
- [ ] Verify Home, Services, Cases, About, Shop, Project, Contact, Case 01, and forged wheel with clean console and no horizontal overflow.
- [ ] Verify representative desktop routes at 1440x900 are unchanged.
- [ ] Put each source target beside its implementation capture and fix all P0/P1/P2 differences.
- [ ] Record `final result: passed` in `design-qa.md`.
