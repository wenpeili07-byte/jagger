# Cases Editorial Index Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Cases hero's independent masked rail with a six-row editorial case index and shared fade-only image preview.

**Architecture:** Keep the existing Cases page and background controller. Replace only the rail markup and styles, then let `pages/cases.js` own active-row selection while the existing inline controller continues to update the full-page background. Mobile CSS converts each row into a static image-and-text item.

**Tech Stack:** Static HTML, CSS custom properties, vanilla JavaScript, Node assertion tests.

## Global Constraints

- Preserve the current header, left hero copy, archive filter, Case 01 route, and existing six optimized images.
- Desktop preview motion uses opacity and `translateY(12px)` only; no image scaling.
- Mobile shows every image directly and does not rely on hover.
- BMW blue is limited to active, hover, focus, arrows, and small accent lines.
- The page background continues to use the existing 640 millisecond fade-only controller.
- Do not upload or deploy this prototype.

---

### Task 1: Lock The Editorial Index Contract

**Files:**
- Modify: `cases-page.test.mjs`
- Test: `cases-page.test.mjs`

**Interfaces:**
- Consumes: current `pages/cases.html`, `case-rail.css`, and `pages/cases.js`
- Produces: structural assertions for `.case-index`, `.case-index-row`, `.case-preview`, and `setActiveCase(index)`

- [ ] **Step 1: Replace masked-rail assertions with failing editorial-index assertions**

Add assertions equivalent to:

```js
assert.match(html, /<section class="case-index"/);
assert.equal((html.match(/class="case-index-row/g) || []).length, 6);
assert.equal((html.match(/class="case-preview-image/g) || []).length, 6);
assert.doesNotMatch(html, /mwg_effect060|slide spacer/);
assert.match(css, /\.case-index-layout\s*\{[^}]*grid-template-columns:/s);
assert.match(css, /\.case-preview-image\.is-active\s*\{[^}]*opacity:\s*1/s);
assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*\.case-index-row-image/s);
assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/s);
assert.match(js, /function setActiveCase\(index\)/);
assert.doesNotMatch(js, /initIndependentRailScroll|wheel/);
```

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run:

```bash
node cases-page.test.mjs
```

Expected: failure because `.case-index` is not present.

- [ ] **Step 3: Keep the failing test as the implementation contract**

Do not weaken existing assertions for the archive filter, background fade, case
images, canvas width, or Case 01 link.

### Task 2: Build The Editorial Index Markup

**Files:**
- Modify: `pages/cases.html`
- Test: `cases-page.test.mjs`

**Interfaces:**
- Consumes: six optimized case image paths and the existing inline `fadeToScene(scene)` controller
- Produces: six `.case-index-row` links with `data-case-index` and `data-scene`

- [ ] **Step 1: Replace the `.mwg_effect060` section**

Use this structure for all six cases:

```html
<section class="case-index" aria-label="精选改装案例">
  <div class="case-index-layout">
    <div class="case-index-list">
      <a class="case-index-row is-active"
         href="./cases/case-01.html"
         data-case-index="0"
         data-scene="../assets/images/网页/optimized/case-01.jpg"
         aria-current="true">
        <img class="case-index-row-image"
             src="../assets/images/网页/optimized/case-01.jpg"
             alt="案例 01 街道宽体 BMW" />
        <span class="case-index-number">01</span>
        <span class="case-index-copy">
          <small>CASE 01</small>
          <strong>街道宽体</strong>
          <em>STREET WIDEBODY</em>
        </span>
        <span class="case-index-arrow" aria-hidden="true">↗</span>
      </a>
    </div>
    <div class="case-preview" aria-hidden="true">
      <img class="case-preview-image is-active"
           src="../assets/images/网页/optimized/case-01.jpg"
           alt="" data-preview-index="0" />
    </div>
  </div>
</section>
```

Repeat the established titles and images for Cases 02 through 06. Keep only
Case 01 navigable; use `href="#"` for unavailable detail pages.

- [ ] **Step 2: Update the inline scene controller selector**

Change the selector and events to:

```js
document.querySelectorAll(".case-index-row[data-scene]").forEach((row) => {
  ["mouseenter", "focus", "click"].forEach((eventName) => {
    row.addEventListener(eventName, update, true);
  });
});
```

- [ ] **Step 3: Run the focused test**

Run:

```bash
node cases-page.test.mjs
```

Expected: markup assertions pass; CSS and JavaScript assertions still fail.

### Task 3: Implement Active Selection

**Files:**
- Modify: `pages/cases.js`
- Test: `cases-page.test.mjs`

**Interfaces:**
- Consumes: `[data-case-index]` rows and `[data-preview-index]` images
- Produces: `setActiveCase(index)` that updates classes and `aria-current`

- [ ] **Step 1: Add the minimal selection controller**

```js
const caseIndexRows = [...document.querySelectorAll("[data-case-index]")];
const casePreviewImages = [...document.querySelectorAll("[data-preview-index]")];

function setActiveCase(index) {
  caseIndexRows.forEach((row) => {
    const isActive = Number(row.dataset.caseIndex) === index;
    row.classList.toggle("is-active", isActive);
    if (isActive) row.setAttribute("aria-current", "true");
    else row.removeAttribute("aria-current");
  });

  casePreviewImages.forEach((image) => {
    image.classList.toggle(
      "is-active",
      Number(image.dataset.previewIndex) === index
    );
  });
}

caseIndexRows.forEach((row) => {
  const activate = () => setActiveCase(Number(row.dataset.caseIndex));
  row.addEventListener("mouseenter", activate);
  row.addEventListener("focus", activate);
  row.addEventListener("click", activate);
});
```

- [ ] **Step 2: Remove independent rail wheel handling**

Delete `initIndependentRailScroll()` and its call. Do not add page-scroll or
`requestAnimationFrame` listeners.

- [ ] **Step 3: Run the focused test**

Run:

```bash
node cases-page.test.mjs
```

Expected: JavaScript assertions pass; CSS assertions still fail.

### Task 4: Style Desktop And Mobile

**Files:**
- Modify: `case-rail.css`
- Modify: `layout-canvas.css`
- Test: `cases-page.test.mjs`

**Interfaces:**
- Consumes: active classes from Task 3
- Produces: desktop shared preview, mobile static image list, reduced-motion fallback

- [ ] **Step 1: Replace the old rail stylesheet**

Implement:

```css
.case-index-layout {
  display: grid;
  grid-template-columns: minmax(280px, 0.74fr) minmax(360px, 1.26fr);
  gap: clamp(24px, 3vw, 48px);
  min-height: 600px;
}

.case-index-row {
  position: relative;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 24px;
  align-items: center;
  min-height: 96px;
  border-bottom: 1px solid var(--line);
  text-decoration: none;
}

.case-preview {
  position: relative;
  min-height: 600px;
  overflow: hidden;
}

.case-preview-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 480ms ease, transform 480ms ease;
}

.case-preview-image.is-active {
  opacity: 1;
  transform: translateY(0);
}
```

Use neutral separators by default. Active, hover, and focus-visible states use
the existing `--accent-bright` and glow variables.

- [ ] **Step 2: Add mobile behavior**

At `max-width: 760px`:

```css
.case-index-layout {
  display: block;
  min-height: 0;
}

.case-preview {
  display: none;
}

.case-index-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 24px;
  padding: 0 0 26px;
}

.case-index-row-image {
  grid-column: 1 / -1;
  width: 100%;
  aspect-ratio: 4 / 3;
  margin-bottom: 18px;
  object-fit: cover;
}
```

At desktop sizes, `.case-index-row-image` is hidden.

- [ ] **Step 3: Add reduced-motion behavior**

```css
@media (prefers-reduced-motion: reduce) {
  .case-preview-image {
    transform: none;
    transition-duration: 80ms;
  }
}
```

- [ ] **Step 4: Remove the obsolete 1728 rail override**

Replace `.mwg_effect060` rules in `layout-canvas.css` with a stable
`.case-index` width rule that does not stretch beyond the existing hero column.

- [ ] **Step 5: Run the focused test**

Run:

```bash
node cases-page.test.mjs
```

Expected: all Cases page assertions pass.

### Task 5: Visual And Regression Verification

**Files:**
- Modify: `design-qa.md`
- Test: all `*.test.mjs`

**Interfaces:**
- Consumes: completed prototype
- Produces: desktop/mobile screenshots and a passed `design-qa.md`

- [ ] **Step 1: Run all tests**

Run:

```bash
for test in *.test.mjs; do node "$test"; done
```

Expected: exit code 0 with no assertion failures.

- [ ] **Step 2: Start the local server**

Run:

```bash
python3 -m http.server 4191
```

Expected: the site is available at `/pages/cases.html`.

- [ ] **Step 3: Verify desktop**

At 1900 x 1050 and 1440 x 900:

- Header, left hero copy, six text rows, and shared image preview fit.
- Hovering row 02 shows image 02 and changes the full-page background.
- No preview image scales during the transition.
- Case 01 opens its detail page.

- [ ] **Step 4: Verify mobile**

At 390 x 844:

- Each row displays its own image.
- Text and arrows do not overflow.
- No horizontal scrolling occurs.
- The archive remains below the hero and filtering still works.

- [ ] **Step 5: Compare against the reference**

Create a side-by-side image containing the Stonecutter reference list and the
LONMA prototype at the same desktop viewport. Confirm that hierarchy, restraint,
and motion intent match while LONMA retains its automotive imagery and blue
accent.

- [ ] **Step 6: Update `design-qa.md`**

Record the reference, prototype screenshots, viewport sizes, interaction checks,
remaining P3 polish, and `Final Result: Passed` only when there are no P0, P1,
or P2 issues.

