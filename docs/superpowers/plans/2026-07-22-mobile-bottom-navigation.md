# Mobile Bottom Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the approved LONMA DYNAMIC mobile mock with a fixed bottom navigation, compact Shop selector, and shorter Contact first screen.

**Architecture:** Keep the existing static HTML/CSS/JS architecture. Shared mobile shell behavior stays in `styles.css` and `layout-canvas.css`; Shop markup remains renderer-owned and its editor behavior stays in `shop.js`; Contact remains a CSS-only responsive adjustment.

**Tech Stack:** Static HTML, CSS media queries, vanilla JavaScript, Node test runner.

## Global Constraints

- Desktop behavior above 767px must remain unchanged.
- Mobile breakpoint remains 767px.
- Main navigation retains five bilingual destinations.
- Touch targets are at least 44px.
- The fixed bottom navigation must respect `env(safe-area-inset-bottom)`.
- No `width: 100vw` and no whole-page `transform: scale()`.

---

### Task 1: Shared Mobile Shell

**Files:**
- Modify: `responsive-layout.test.mjs`
- Modify: `styles.css`
- Modify: `layout-canvas.css`

**Interfaces:**
- Consumes: Existing `.topbar`, `.brand`, `.nav`, `.top-actions`, and `--site-header-height` selectors.
- Produces: One-row 56px top header and fixed five-column bottom navigation through 767px.

- [ ] Add failing assertions for a 56px mobile header, fixed bottom nav, safe-area padding, 64px nav links, top active line, and page bottom clearance.
- [ ] Run `node --test responsive-layout.test.mjs` and confirm the new assertions fail.
- [ ] Implement the minimal shared mobile CSS.
- [ ] Run `node --test responsive-layout.test.mjs` and confirm it passes.

### Task 2: Compact Shop Vehicle Editor

**Files:**
- Modify: `shop.test.mjs`
- Modify: `scripts/render-shop-page.mjs`
- Generate: `pages/shop.html`
- Modify: `shop.css`
- Modify: `shop.js`

**Interfaces:**
- Consumes: Existing vehicle selects and `FIND PARTS` action.
- Produces: `[data-mobile-vehicle-summary]`, `[data-mobile-vehicle-edit]`, synchronized summary fields, and `.is-editing` state.

- [ ] Add failing renderer, CSS, and runtime assertions for the mobile summary and editor state.
- [ ] Run `node --test shop.test.mjs` and confirm the new assertions fail.
- [ ] Add renderer-owned summary markup and mobile CSS while preserving desktop output.
- [ ] Add summary synchronization, edit toggling, and collapse-after-search behavior to `shop.js`.
- [ ] Regenerate `pages/shop.html` with `node scripts/render-shop-page.mjs`.
- [ ] Run `node --test shop.test.mjs` and confirm it passes.

### Task 3: Compact Contact First Screen

**Files:**
- Modify: `content-pages.test.mjs`
- Modify: `content-pages.css`

**Interfaces:**
- Consumes: Existing `.contact-hero`, `.content-hero-copy`, and `.contact-inquiry` selectors.
- Produces: A shorter mobile contact hero and reduced inquiry spacing.

- [ ] Add failing assertions for the compact Contact mobile geometry.
- [ ] Run `node --test content-pages.test.mjs` and confirm the new assertions fail.
- [ ] Implement the mobile-only Contact overrides.
- [ ] Run `node --test content-pages.test.mjs` and confirm it passes.

### Task 4: Full Verification And Design QA

**Files:**
- Modify: `design-qa.md`

**Interfaces:**
- Consumes: Completed shared shell, Shop, and Contact changes.
- Produces: A local verified preview and passing design QA record.

- [ ] Run `node --test *.test.mjs` and confirm zero failures.
- [ ] Run `git diff --check` and confirm no whitespace errors.
- [ ] Capture Home, Shop, and Contact at 390x844 and representative desktop pages at 1440x900.
- [ ] Compare the selected mock and implementation, fix all P0/P1/P2 mismatches, and record `final result: passed` in `design-qa.md`.
