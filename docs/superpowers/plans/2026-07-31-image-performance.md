# LONMA Image Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce image transfer and decoding cost without changing the approved LONMA layouts, crops, animation, or copy.

**Architecture:** A small manifest owns source-to-derivative mappings, and a deterministic Sharp-based generator writes WebP variants under `assets/images/generated/`. Static HTML and CSS consume those variants through `srcset`, `sizes`, and responsive background variables while retaining the existing JPEG sources as fallbacks and Open Graph assets.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js built-in test runner, Sharp from the Codex bundled dependency runtime, local HTTP server, headless Chrome.

## Global Constraints

- Keep every original source file unchanged.
- Do not change photography, cropping, layout, animation, typography, spacing, navigation, or bilingual content.
- Hero widths: 960, 1440, and 2400 px WebP.
- Case widths: 640, 960, and 1600 px WebP where the source permits; omit duplicate widths.
- WebP quality: 80, metadata removed, orientation normalized, and no upscaling.
- Keep social-preview image URLs on JPEG files.
- Keep `audit/` untracked and out of commits.

---

### Task 1: Responsive Image Manifest

**Files:**
- Create: `image-performance.mjs`
- Create: `image-performance.test.mjs`

**Interfaces:**
- Produces: `responsiveImages: Array<{ id, source, fallback, outputDirectory, widths, quality }>`
- Produces: `buildDerivativePlan(record): Array<{ width, destination }>`
- Produces: `srcsetFor(id, prefix): string`

- [ ] **Step 1: Write the failing manifest tests**

Create `image-performance.test.mjs` with tests equivalent to:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { buildDerivativePlan, responsiveImages, srcsetFor } from "./image-performance.mjs";

test("responsive image manifest preserves source files and approved widths", () => {
  assert.deepEqual(responsiveImages.map(({ id }) => id), ["hero", "case-01", "case-02", "case-03", "case-04", "case-05", "case-06"]);
  assert.deepEqual(responsiveImages[0].widths, [960, 1440, 2400]);
  assert.equal(responsiveImages[0].source, "assets/images/网页/首页背景.jpg");
  assert.ok(responsiveImages.every(({ source, outputDirectory }) => !outputDirectory.startsWith(source)));
});

test("derivative plans never upscale or overwrite a source", () => {
  for (const record of responsiveImages) {
    const plan = buildDerivativePlan(record);
    assert.ok(plan.every(({ width }) => width <= record.sourceWidth));
    assert.ok(plan.every(({ destination }) => destination.endsWith(".webp") && destination !== record.source));
  }
});

test("srcset output uses generated WebP widths", () => {
  assert.match(srcsetFor("case-01", "../"), /case-01-640w\.webp 640w/);
  assert.match(srcsetFor("case-01", "../"), /case-01-1600w\.webp 1600w/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test image-performance.test.mjs
```

Expected: FAIL because `image-performance.mjs` does not exist.

- [ ] **Step 3: Implement the manifest**

Create `image-performance.mjs` with the seven approved records. `buildDerivativePlan()` filters widths above `sourceWidth`, de-duplicates widths, and returns names in the form `assets/images/generated/<id>/<id>-<width>w.webp`. `srcsetFor()` joins those destinations with width descriptors and applies the page-relative prefix.

- [ ] **Step 4: Run the test and verify GREEN**

Run the Task 1 test command and expect all tests to pass.

- [ ] **Step 5: Commit Task 1**

```bash
git add image-performance.mjs image-performance.test.mjs
git commit -m "Define responsive image derivatives"
```

### Task 2: Non-Destructive Image Generator

**Files:**
- Create: `scripts/generate-responsive-images.mjs`
- Modify: `image-performance.test.mjs`
- Create: `assets/images/generated/hero/*.webp`
- Create: `assets/images/generated/case-01/*.webp`
- Create: `assets/images/generated/case-02/*.webp`
- Create: `assets/images/generated/case-03/*.webp`
- Create: `assets/images/generated/case-04/*.webp`
- Create: `assets/images/generated/case-05/*.webp`
- Create: `assets/images/generated/case-06/*.webp`

**Interfaces:**
- Consumes: `responsiveImages` and `buildDerivativePlan()` from `image-performance.mjs`
- Produces: `generateResponsiveImages({ root, sharp }): Promise<Array<{ source, destination, width }>>`

- [ ] **Step 1: Add failing generated-file tests**

Extend `image-performance.test.mjs` so each planned destination must exist, have the planned pixel width, use WebP format, and be smaller than its source. Use `access`, `stat`, and an injected `readMetadata` helper so the assertions exercise real generated files.

- [ ] **Step 2: Run the test and verify RED**

Expected: FAIL on the first missing generated WebP file.

- [ ] **Step 3: Implement and run the generator**

`scripts/generate-responsive-images.mjs` must:

```js
const pipeline = sharp(source)
  .rotate()
  .resize({ width, withoutEnlargement: true })
  .webp({ quality: record.quality, smartSubsample: true });
await mkdir(dirname(destination), { recursive: true });
await pipeline.toFile(destination);
```

It must reject a destination outside `assets/images/generated/`, never call delete/rename/truncate APIs, and print a one-line size summary for every output.

Run with the bundled runtime:

```bash
NODE_PATH=/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules /Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/generate-responsive-images.mjs --write
```

- [ ] **Step 4: Run the generated-file tests and verify GREEN**

Run the Task 1 test command and expect all tests to pass.

- [ ] **Step 5: Commit Task 2**

```bash
git add scripts/generate-responsive-images.mjs image-performance.test.mjs assets/images/generated
git commit -m "Generate responsive WebP assets"
```

### Task 3: Responsive Markup And Background Loading

**Files:**
- Modify: `image-performance.test.mjs`
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `pages/about.html`
- Modify: `pages/services.html`
- Modify: `pages/cases.html`
- Modify: `scripts/render-detail-pages.mjs`
- Modify: `scripts/render-shop-page.mjs`
- Regenerate: `pages/cases/case-01.html` through `pages/cases/case-06.html`
- Regenerate: `pages/services/build.html` through `pages/services/exhaust.html`
- Regenerate: `pages/shop.html`

**Interfaces:**
- Consumes: `srcsetFor()` and the generated asset paths.
- Produces: responsive `img` markup and responsive CSS scene variables.

- [ ] **Step 1: Add failing public-markup tests**

Add assertions that:

```js
assert.match(home, /hero-960w\.webp 960w/);
assert.match(home, /hero-2400w\.webp 2400w/);
assert.match(about, /sizes="\(max-width: 768px\) 100vw, 1900px"/);
assert.match(cases, /case-01-640w\.webp 640w/);
assert.match(styles, /--active-case-scene:[^;]*generated\/hero\/hero-2400w\.webp/);
assert.doesNotMatch(home, /fetchpriority="high"[^>]*loading="lazy"/);
```

Also assert social metadata still points to `.jpg` and all below-fold generated images include `loading="lazy" decoding="async"`.

- [ ] **Step 2: Run the test and verify RED**

Expected: FAIL because public pages still use only JPEG `src` values.

- [ ] **Step 3: Update markup and generators**

- Add `srcset`, `sizes`, dimensions, and `decoding` to hero and case-cover images.
- Keep existing JPEG `src` values as fallbacks.
- Add `fetchpriority="high"` only to the visible desktop/About hero image.
- Keep mobile Direction C WebP markup unchanged.
- Add lazy loading only below the fold.
- Update CSS scene variables at 960, 1440, and 2400 desktop widths without changing background position, filters, opacity, or transitions.
- Update both page generators before regenerating static pages so future runs preserve the optimization.

- [ ] **Step 4: Run focused and full tests**

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test image-performance.test.mjs
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test
```

Expected: all tests pass with zero failures.

- [ ] **Step 5: Commit Task 3**

```bash
git add image-performance.test.mjs index.html styles.css pages scripts/render-detail-pages.mjs scripts/render-shop-page.mjs
git commit -m "Load responsive images across public pages"
```

### Task 4: Visual And Transfer Verification

**Files:**
- Create locally only: `audit/image-performance-20260731/*`
- Modify if a regression is found: only the files listed in Task 3

**Interfaces:**
- Consumes: the complete optimized static site.
- Produces: verified screenshots and before/after transfer evidence; audit files remain untracked.

- [ ] **Step 1: Start the local static server**

```bash
python3 -m http.server 4210 --bind 127.0.0.1
```

- [ ] **Step 2: Verify desktop and mobile visually**

Capture Home, About, Services, and Cases at 1440 x 900 and 390 x 844. Confirm matching layout, crop, typography, animation layers, no horizontal overflow, successful image requests, and no console errors.

- [ ] **Step 3: Verify transfer and source preservation**

Record generated byte sizes, confirm the 9 MB hero is no longer requested by supported modern browsers for first-screen display, and compare source checksums captured before generation with current checksums.

- [ ] **Step 4: Run final verification**

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test
git status --short
```

Expected: zero test failures; only intentional tracked changes plus untracked `audit/` evidence.

- [ ] **Step 5: Commit any verification fixes**

Only if Step 2 or Step 3 found a regression, commit the minimal correction after the focused and full tests pass again.
