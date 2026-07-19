# Global Responsive Proportions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify every public LONMA DYNAMIC page around a 1900 x 1050 desktop canvas while preserving the current visual design and eliminating split-screen overflow.

**Architecture:** `layout-canvas.css` becomes the shared source of truth for canvas width, header height, first-screen height, and gutters. Page stylesheets retain their internal grids, with targeted compact and mobile overrides where fixed minimum widths currently break the shared canvas.

**Tech Stack:** Static HTML, CSS custom properties, JavaScript, Node.js built-in test runner, in-app browser verification.

## Global Constraints

- Desktop design reference is exactly 1900 x 1050.
- Page shells use `max-width: 1900px`, `width: 100%`, and horizontal auto margins.
- Viewports wider than 1900px show equal outer margins.
- The desktop header remains 77px tall.
- Full first-screen experiences stop at 973px below the header.
- Do not use `transform: scale()` for global page sizing.
- Preserve copy, images, colors, typography, animations, links, CMS behavior, and page content.
- Verify at 2560 x 1440, 1900 x 1050, 790 x 1204, and 390 x 844.
- The affected source files already contain uncommitted user work. Do not stage
  or commit implementation files during this plan; keep each checkpoint
  reviewable with focused diffs and defer the source commit until the user asks
  to back up or publish.

---

## File Map

- Create `responsive-layout.test.mjs`: static regression checks for the shared canvas, cache version, split-screen services layout, and compact header.
- Modify `layout-canvas.css`: define and apply the global canvas variables.
- Modify `styles.css`: replace the current three-row compact header with a two-row composition.
- Modify `content-pages.css`: remove the duplicate content-page canvas width and eliminate the 790px services overflow.
- Modify `cases-page.test.mjs`: replace the obsolete 1728px canvas expectation.
- Modify `index.html`: load the 1900px canvas cache version.
- Modify `pages/about.html`: load the 1900px canvas cache version.
- Modify `pages/services.html`: load the 1900px canvas cache version.
- Modify `pages/cases.html`: load the 1900px canvas cache version.
- Modify `pages/contact.html`: load the 1900px canvas cache version.
- Modify `pages/cases/case-01.html`: load the 1900px canvas cache version.
- Modify `pages/cases/case-01-video.html`: load the 1900px canvas cache version.
- Modify `pages/services/build.html`: load the 1900px canvas cache version.
- Modify `pages/services/parts.html`: load the 1900px canvas cache version.
- Modify `pages/services/photo.html`: load the 1900px canvas cache version.
- Modify `pages/services/ecu.html`: load the 1900px canvas cache version.
- Modify `pages/services/chassis.html`: load the 1900px canvas cache version.
- Modify `pages/services/exhaust.html`: load the 1900px canvas cache version.

---

### Task 1: Add Shared Canvas Regression Tests

**Files:**
- Create: `responsive-layout.test.mjs`
- Modify: `cases-page.test.mjs`

**Interfaces:**
- Consumes: public HTML pages and shared CSS files as UTF-8 text.
- Produces: static assertions that define the shared canvas contract for later tasks.

- [ ] **Step 1: Write the failing shared-layout test**

Create `responsive-layout.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const canvasCss = read("./layout-canvas.css");
const sharedCss = read("./styles.css");
const contentCss = read("./content-pages.css");
const publicPages = [
  "./index.html",
  "./pages/about.html",
  "./pages/services.html",
  "./pages/cases.html",
  "./pages/contact.html",
  "./pages/cases/case-01.html",
  "./pages/cases/case-01-video.html",
  "./pages/services/build.html",
  "./pages/services/parts.html",
  "./pages/services/photo.html",
  "./pages/services/ecu.html",
  "./pages/services/chassis.html",
  "./pages/services/exhaust.html",
];

assert.match(canvasCss, /--site-max-width:\s*1900px/, "canvas should define the 1900px site maximum");
assert.match(canvasCss, /--site-header-height:\s*77px/, "canvas should define the 77px desktop header");
assert.match(canvasCss, /--site-first-screen-max:\s*973px/, "canvas should cap first screens at 973px below the header");
assert.match(canvasCss, /\.site-shell\s*\{[^}]*max-width:\s*var\(--site-max-width\)/s, "all shells should consume the shared maximum");
assert.match(canvasCss, /\.site-shell::before,[\s\S]*?width:\s*min\(100%,\s*var\(--site-max-width\)\)/s, "fixed backgrounds should use the shared maximum");
assert.doesNotMatch(canvasCss, /1728px/, "the shared canvas should not retain the obsolete width");
assert.doesNotMatch(canvasCss, /transform:\s*scale\(/, "the shared canvas must not scale the page");
assert.doesNotMatch(contentCss, /\.content-page\.site-shell\s*\{[^}]*max-width:/s, "content pages should not own a second canvas width");
assert.match(contentCss, /@media \(max-width:\s*899px\)[\s\S]*?\.service-showcase-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*0\.92fr\)\s+minmax\(0,\s*1\.08fr\)/s, "790px services should use shrinkable columns");
assert.match(sharedCss, /@media \(max-width:\s*980px\)[\s\S]*?\.topbar\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/s, "compact headers should use two columns");

for (const path of publicPages) {
  const html = read(path);
  assert.match(html, /layout-canvas\.css\?v=canvas-20260719-1900/, `${path} should load the 1900px canvas version`);
}
```

- [ ] **Step 2: Update the Cases page canvas expectation**

Replace the obsolete assertion in `cases-page.test.mjs` with:

```js
assert.match(html, /layout-canvas\.css\?v=canvas-20260719-1900/, "cases page should load the shared 1900px design canvas");
assert.match(css, /\.cases-hero\s*\{[^}]*min-height:\s*min\(calc\(100vh - var\(--site-header-height\)\),\s*var\(--site-first-screen-max\)\)/s, "PLAN A hero should preserve the 1900x1050 first-screen visual area without stretching on taller displays");
```

- [ ] **Step 3: Run the focused tests and verify failure**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test responsive-layout.test.mjs cases-page.test.mjs
```

Expected: FAIL because the canvas still contains 1728px rules, HTML cache keys still reference 1728, and the 899px services override does not exist.

- [ ] **Step 4: Review the failing contract checkpoint**

```bash
git diff --check -- responsive-layout.test.mjs cases-page.test.mjs
git diff -- responsive-layout.test.mjs cases-page.test.mjs
```

Expected: no whitespace errors and only the canvas contract has changed.

---

### Task 2: Make 1900px the Single Shared Canvas

**Files:**
- Modify: `layout-canvas.css`
- Modify: `content-pages.css`
- Modify: all public HTML files listed in the File Map

**Interfaces:**
- Consumes: canvas assertions from Task 1.
- Produces: `--site-max-width`, `--site-header-height`, `--site-first-screen-max`, and `--site-gutter` CSS variables used by every page.

- [ ] **Step 1: Replace the canvas rules**

Replace the top-level rules in `layout-canvas.css` with:

```css
/* 1900 x 1050 shared design canvas. Loaded after styles.css. */
:root {
  --site-max-width: 1900px;
  --site-header-height: 77px;
  --site-first-screen-max: 973px;
  --site-gutter: clamp(20px, 4vw, 76px);
}

.site-shell {
  width: 100%;
  max-width: var(--site-max-width);
  margin: 0 auto;
}

.site-shell::before,
.site-shell::after {
  top: 0;
  right: auto;
  bottom: 0;
  left: 50%;
  width: min(100%, var(--site-max-width));
  transform: translateX(-50%);
}

.cover,
.cases-hero {
  min-height: min(calc(100vh - var(--site-header-height)), var(--site-first-screen-max));
  padding: clamp(26px, 4vw, 70px) var(--site-gutter);
}
```

Keep the existing film-card, case-card, and archive rules, but change:

```css
@media (min-width: 1900px) {
```

instead of the obsolete 1728px breakpoint.

- [ ] **Step 2: Remove the duplicate content-page width**

Change the beginning of `content-pages.css` to:

```css
.content-page.site-shell {
  border-color: var(--line);
  background: #111315;
}
```

This leaves width and centering owned by `layout-canvas.css`.

- [ ] **Step 3: Update all public HTML cache keys**

In every public HTML file listed in the File Map, replace:

```html
layout-canvas.css?v=canvas-20260706-1728
```

with:

```html
layout-canvas.css?v=canvas-20260719-1900
```

Preserve each page's existing relative path prefix.

- [ ] **Step 4: Run the focused canvas tests**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test responsive-layout.test.mjs cases-page.test.mjs content-pages.test.mjs
```

Expected: `responsive-layout.test.mjs` still fails only on the missing compact services/header rules; existing content and cases tests remain green after their canvas assertions are updated.

- [ ] **Step 5: Review the shared-canvas checkpoint**

```bash
git diff --check -- layout-canvas.css content-pages.css index.html pages
git diff -- layout-canvas.css content-pages.css index.html pages
```

Expected: no whitespace errors and no copy, imagery, animation, or content
changes introduced by this task.

---

### Task 3: Fix Compact Header and Split-Screen Services

**Files:**
- Modify: `styles.css`
- Modify: `content-pages.css`

**Interfaces:**
- Consumes: shared canvas variables from Task 2.
- Produces: a two-row compact header below 980px and shrinkable services columns between 768px and 899px.

- [ ] **Step 1: Convert the compact header to two rows**

Replace the `.topbar`, `.nav`, and `.top-actions` rules inside `@media (max-width: 980px)` in `styles.css` with:

```css
.topbar {
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px 18px;
  min-height: auto;
  padding-block: 14px;
}

.brand {
  grid-column: 1;
  grid-row: 1;
}

.nav {
  grid-column: 1 / -1;
  grid-row: 2;
  justify-self: start;
  flex-wrap: wrap;
}

.top-actions {
  grid-column: 2;
  grid-row: 1;
  width: auto;
  justify-self: end;
}
```

Inside `@media (max-width: 620px)`, change the top-actions override to:

```css
.top-actions {
  width: auto;
  justify-content: flex-end;
}
```

- [ ] **Step 2: Add the split-screen services override**

Insert this block in `content-pages.css` after the 1180px rules and before the 760px mobile rules:

```css
@media (max-width: 899px) and (min-width: 761px) {
  .service-showcase {
    padding-inline: clamp(24px, 4vw, 36px);
  }

  .service-showcase-layout {
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
    gap: 24px;
    width: 100%;
    min-width: 0;
  }

  .service-index-list,
  .service-preview {
    min-width: 0;
  }

  .service-index-row {
    grid-template-columns: 46px minmax(0, 1fr) 24px;
  }

  .service-index-row p {
    max-width: 100%;
  }
}
```

- [ ] **Step 3: Run the focused layout tests**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test responsive-layout.test.mjs header-layout.test.mjs content-pages.test.mjs
```

Expected: PASS.

- [ ] **Step 4: Run the complete static test suite**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test *.test.mjs
```

Expected: all tests pass with no failures or skipped tests.

- [ ] **Step 5: Review the compact responsive checkpoint**

```bash
git diff --check -- styles.css content-pages.css responsive-layout.test.mjs
git diff -- styles.css content-pages.css responsive-layout.test.mjs
```

Expected: no whitespace errors and only header and services proportion rules
have been added in this task.

---

### Task 4: Verify Every Page Class Visually

**Files:**
- Modify only if visual verification reveals a proportion defect in `layout-canvas.css`, `styles.css`, `content-pages.css`, `case-rail.css`, or `case-detail.css`.
- Save evidence under: `audit/global-proportions-2026-07-19/`

**Interfaces:**
- Consumes: completed shared canvas and responsive overrides from Tasks 2-3.
- Produces: screenshots and measured overflow results for every page class.

- [ ] **Step 1: Start the local static preview**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npx serve . -l 4195
```

Expected: the site is available at `http://127.0.0.1:4195`.

- [ ] **Step 2: Check page classes at all four viewports**

Use the in-app browser for:

```text
/
/pages/services.html
/pages/cases.html
/pages/cases/case-01.html
/pages/about.html
/pages/contact.html
/pages/services/build.html
```

At each viewport, record:

```js
({
  viewportWidth: innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  overflow: document.documentElement.scrollWidth - innerWidth,
  shellWidth: document.querySelector(".site-shell").getBoundingClientRect().width,
  shellLeft: document.querySelector(".site-shell").getBoundingClientRect().left,
  headerHeight: document.querySelector(".topbar").getBoundingClientRect().height,
})
```

Expected:

- `overflow` is `0`.
- `shellWidth` is at most `1900`.
- At 2560px, left and right outer margins are each approximately 330px.
- At 1900px, shell width is approximately 1900px.
- At 790px and 390px, shell width matches the viewport.
- Header and content do not overlap.

- [ ] **Step 3: Capture comparison screenshots**

Save one contact sheet per viewport:

```text
audit/global-proportions-2026-07-19/desktop-wide-2560x1440.png
audit/global-proportions-2026-07-19/desktop-1900x1050.png
audit/global-proportions-2026-07-19/split-790x1204.png
audit/global-proportions-2026-07-19/mobile-390x844.png
```

Inspect vehicle cropping, header height, gutters, content compression, and section transitions.

- [ ] **Step 4: Re-run the complete test suite after any visual corrections**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test *.test.mjs
```

Expected: all tests pass.

- [ ] **Step 5: Review the final diff**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only planned source files, tests, and audit evidence are changed by this work.

- [ ] **Step 6: Leave the verified implementation ready for user review**

```bash
git status --short
```

Expected: the existing dirty worktree remains intact, with the proportion
changes and evidence visible for review. Do not stage, commit, push, or deploy
implementation files in this task.
