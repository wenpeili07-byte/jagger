# Services Square Hover Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the Services page's permanently visible right-side image slices and add row-local 1:1 previews that reveal on desktop hover or keyboard focus without moving the six-row layout.

**Architecture:** Keep `.service-process-media` as the permanent right grid column and add `.service-process-preview` as a second row-local image using the same source. The preview is an absolutely positioned square overlay on desktop, while the row remains the single interaction boundary. Hide the redundant preview on mobile and retain the existing full-row image treatment. Extend the static tests to lock both image roles, the square ratio, hidden default state, row-local reveal, motion limits, and reduced-motion fallback.

**Tech Stack:** Static HTML, CSS, Node.js built-in test runner

## Global Constraints

- Keep the deployed left introduction column and six service rows.
- Keep every permanent right-side horizontal sample image visible on desktop.
- Keep every existing service number, label, title, description, destination, and image source.
- Desktop preview aspect ratio is exactly `1 / 1`.
- Animate only `opacity` and `transform`.
- Do not change the homepage, Cases page, case-detail pages, global header, typography, written content, or service destinations.
- Keep accessible keyboard focus indicators.
- Use the existing mobile breakpoint at `767px`.

---

### Task 1: Row-Local Square Preview

**Files:**
- Modify: `content-pages.test.mjs`
- Modify: `content-pages.css`
- Modify: `pages/services.html`

**Interfaces:**
- Consumes: the existing `.service-process-row > .service-process-media > img` markup in `pages/services.html`
- Adds: one `.service-process-preview > img` sibling per row using the same image source
- Produces: CSS-only row-local hover/focus preview states; no JavaScript API or shared preview state

- [ ] **Step 1: Write the failing CSS contract tests**

Replace the old image-containment and no-transform assertions with:

```js
assert.match(css, /\.service-process-row\s*\{[^}]*overflow:\s*visible/s, "desktop rows should allow square previews to float outside their cell");
assert.match(css, /\.service-process-media\s*\{[^}]*position:\s*absolute[^}]*aspect-ratio:\s*1\s*\/\s*1[^}]*opacity:\s*0[^}]*pointer-events:\s*none/s, "desktop service previews should be hidden square overlays");
assert.match(css, /\.service-process-media img\s*\{[^}]*width:\s*100%[^}]*height:\s*100%[^}]*object-fit:\s*cover/s, "square preview imagery should crop without distortion");
assert.doesNotMatch(css, /\.service-process-row\[data-active\] \.service-process-media/, "the last active service must not keep an image permanently visible");
```

Update the fine-pointer test with:

```js
assert.match(finePointerHover.body, /\.service-process-row:hover \.service-process-media\s*\{[^}]*opacity:\s*1[^}]*transform:\s*translate3d\(0,\s*-12px,\s*0\)\s*rotate\(-5deg\)/s, "hover should reveal and lift only the current row's square preview");
assert.match(finePointerHover.body, /\.service-process-row:hover \.service-process-arrow\s*\{[^}]*transform:\s*translate\(-100%,\s*-50%\)\s*rotate\(45deg\)/s, "hover should rotate the service arrow with the preview");
```

Add global focus, mobile, and reduced-motion assertions:

```js
assert.match(globalCss, /\.service-process-row:focus-visible \.service-process-media\s*\{[^}]*opacity:\s*1[^}]*transform:\s*translate3d\(0,\s*-12px,\s*0\)\s*rotate\(-5deg\)/s, "keyboard focus should reveal the matching square preview");
assert.match(mobileServices.body, /\.service-process-media\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0[^}]*width:\s*100%[^}]*height:\s*100%/s, "mobile should retain its contained image treatment");
assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.service-process-media\s*\{[^}]*transform:\s*none/s, "reduced motion should remove preview translation and rotation");
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
node --test content-pages.test.mjs
```

Expected: FAIL on the new square-overlay contract because the deployed CSS still uses the image as a permanent second grid column.

- [ ] **Step 3: Implement the desktop square overlay**

Change the desktop Services rules to:

```css
.service-process-row {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  min-height: 0;
  overflow: visible;
  border-top: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
  isolation: isolate;
  transition: background 200ms ease;
}

.service-process-copy {
  position: relative;
  z-index: 2;
  min-width: 0;
  padding: 22px clamp(300px, 34vw, 520px) 20px 96px;
  background: transparent;
}

.service-process-media {
  position: absolute;
  z-index: 8;
  top: 50%;
  right: clamp(26px, 4vw, 76px);
  width: clamp(320px, 24vw, 420px);
  aspect-ratio: 1 / 1;
  margin: 0;
  overflow: hidden;
  border-radius: 6px;
  background: #171a1d;
  box-shadow: 12px 18px 38px rgba(0, 0, 0, 0.42);
  opacity: 0;
  pointer-events: none;
  transform: translate3d(0, 12px, 0) rotate(0deg);
  transform-origin: 50% 50%;
  transition: opacity 500ms ease-out, transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}

.service-process-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  filter: saturate(0.94) contrast(1.06) brightness(0.8);
  opacity: 1;
}

.service-process-arrow {
  position: absolute;
  z-index: 5;
  top: 50%;
  right: 34px;
  left: auto;
  color: var(--muted);
  font-size: 25px;
  transform: translate(-100%, -50%);
  transition: color 200ms ease, transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

.service-process-row:focus-visible .service-process-media {
  opacity: 1;
  transform: translate3d(0, -12px, 0) rotate(-5deg);
}
```

Remove the old permanent two-column media treatment and all `[data-active]`
rules that change `.service-process-media` or its image. Keep `[data-active]`
text, left-edge, and neutral-row highlighting.

- [ ] **Step 4: Implement stable fine-pointer hover and mobile containment**

Inside the existing fine-pointer media block, use:

```css
.service-process-row:hover {
  z-index: 7;
  background: #171a1d;
}

.service-process-row:hover .service-process-media {
  opacity: 1;
  transform: translate3d(0, -12px, 0) rotate(-5deg);
}

.service-process-row:hover .service-process-arrow {
  transform: translate(-100%, -50%) rotate(45deg);
}
```

Inside `@media (max-width: 767px)`, restore the image to the existing contained
mobile row and make the row square:

```css
.service-process-row {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  width: 100%;
  min-height: 0;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

.service-process-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  aspect-ratio: auto;
  border-radius: 0;
  box-shadow: none;
  opacity: 1;
  transform: none;
  will-change: auto;
}
```

Inside `@media (prefers-reduced-motion: reduce)`, use:

```css
.service-process-media {
  transform: none;
  transition: opacity 120ms linear;
}

.service-process-row:hover .service-process-media,
.service-process-row:focus-visible .service-process-media {
  transform: none;
}
```

- [ ] **Step 5: Run the focused and full static test suite**

Run:

```bash
node --test content-pages.test.mjs
node --test *.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 6: Verify desktop and mobile interaction visually**

Serve the static site locally and inspect:

```bash
python3 -m http.server 4193
```

Desktop checks at `1900 x 1050`:

- all six horizontal samples are visible before hover;
- hovering rows 01 through 06 reveals the matching image;
- the permanent horizontal sample remains visible while the square preview is open;
- crossing number, title, description, and arrow does not flicker;
- each image is square and does not move the rail;
- first and last row previews remain inside the Services canvas;
- focus-visible reveals the correct image and keeps the blue outline.

Mobile checks at `390 x 844`:

- each row is square and contains its own image;
- no duplicate square overlay is displayed;
- text remains readable;
- no horizontal overflow occurs;
- header and footer remain unchanged.

- [ ] **Step 7: Commit the implementation**

```bash
git add pages/services.html content-pages.css content-pages.test.mjs docs/superpowers/specs/2026-07-18-services-square-hover-preview-design.md docs/superpowers/plans/2026-07-18-services-square-hover-preview.md
git commit -m "Keep services samples with hover previews"
```
