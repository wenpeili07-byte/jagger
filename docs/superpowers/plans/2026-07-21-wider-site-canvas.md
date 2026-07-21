# Wider Site Canvas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase every public page's shared desktop canvas from 1900px to 2200px without changing page composition or mobile behavior.

**Architecture:** Keep the existing shared `--site-max-width` contract in `layout-canvas.css`. Update the cache key in static pages and the detail-page generator so production immediately receives the new width, while tests lock the full 17-page surface.

**Tech Stack:** Static HTML, CSS custom properties, Node.js built-in test runner.

## Global Constraints

- The shared site canvas is capped at exactly `2200px`.
- The desktop header remains 77px and the mobile header remains 104px.
- The first-screen height cap remains 973px.
- Existing page layouts, copy, images, animations, and mobile breakpoints remain unchanged.
- Do not use `transform: scale()`.

---

### Task 1: Widen The Shared Canvas

**Files:**
- Modify: `responsive-layout.test.mjs`
- Modify: `header-layout.test.mjs`
- Modify: `cases-page.test.mjs`
- Modify: `layout-canvas.css`
- Modify: `index.html`
- Modify: `pages/**/*.html`
- Modify: `scripts/render-detail-pages.mjs`

**Interfaces:**
- Consumes: `--site-max-width`, `.site-shell`, and the existing layout canvas cache link.
- Produces: the `canvas-20260721-2200` cache contract across all 17 public pages.

- [ ] **Step 1: Write the failing assertions**

Update the width assertion to `--site-max-width: 2200px` and the required cache version to `canvas-20260721-2200` in the three layout tests.

- [ ] **Step 2: Verify the focused tests fail**

Run:

```bash
node --test responsive-layout.test.mjs header-layout.test.mjs cases-page.test.mjs
```

Expected: FAIL because production still declares `1900px` and loads `canvas-20260721-1900`.

- [ ] **Step 3: Implement the shared width and cache key**

Set:

```css
:root {
  --site-max-width: 2200px;
}
```

Replace every public HTML and generator reference with `canvas-20260721-2200`.

- [ ] **Step 4: Verify focused and full suites**

Run:

```bash
node --test responsive-layout.test.mjs header-layout.test.mjs cases-page.test.mjs
node --test *.test.mjs
git diff --check
```

Expected: all 47 tests pass and the diff check is clean.

- [ ] **Step 5: Back up and publish**

Create and verify a Git bundle, commit the change, push a dedicated branch, merge through GitHub, and confirm the production Vercel deployment is READY.

