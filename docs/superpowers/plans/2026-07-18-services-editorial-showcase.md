# Services Editorial Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the standalone Services page's full-width business rows with a six-item editorial index and one shared photographic preview while preserving its hero, routes, bilingual copy, homepage modules, and service detail pages.

**Architecture:** `pages/services.html` owns the six service rows, their mobile images, and six desktop preview images. Services-only rules in `content-pages.css` create the 42/58 desktop composition and the in-flow mobile layout. A small controller inside `content-pages.js` synchronizes hover, focus, and click state through matching data indices without adding scroll listeners or dependencies.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node.js assertion tests.

## Global Constraints

- Keep the existing 1900 px centered content canvas and 540 px Services hero.
- Keep the shared header, bilingual system, six service routes, footer, homepage business modules, and service detail pages unchanged.
- Use neutral gray separators by default; use BMW blue only for active and focus states.
- Preview motion is opacity plus `translateY(12px)` over approximately 480 milliseconds.
- Images never zoom or scale.
- Below 760 px, hide the shared preview and show one 4:3 image inside each service row.
- Do not add GSAP, page-scroll listeners, new routes, or new image assets.
- Do not upload or deploy before user approval.

---

### Task 1: Lock The Editorial Services Contract

**Files:**
- Modify: `content-pages.test.mjs`
- Test: `content-pages.test.mjs`

**Interfaces:**
- Consumes: Existing static files `pages/services.html`, `content-pages.css`, and `content-pages.js`.
- Produces: Assertions for `.service-showcase`, `data-service-index`, `data-service-preview-index`, `setActiveService(index)`, mobile images, neutral separators, fade motion, and no scaling.

- [ ] **Step 1: Write the failing test**

Add assertions after the established service route assertions:

```js
assert.match(
  servicesHtml,
  /<section class="service-showcase"[\s\S]*<div class="service-index-list">[\s\S]*<div class="service-preview"/,
  "services should pair its text index with one shared preview"
);
assert.equal(
  (servicesHtml.match(/data-service-index="\d"/g) || []).length,
  6,
  "services should expose six selectable rows"
);
assert.equal(
  (servicesHtml.match(/class="service-index-row-image"/g) || []).length,
  6,
  "mobile services should include one image per row"
);
assert.equal(
  (servicesHtml.match(/data-service-preview-index="\d"/g) || []).length,
  6,
  "desktop services should include six cross-fade preview images"
);
assert.match(
  css,
  /\.service-showcase-layout\s*\{[^}]*grid-template-columns:\s*minmax\(360px,\s*0\.72fr\)\s+minmax\(520px,\s*1fr\)/s,
  "desktop services should use the selected editorial split"
);
assert.match(
  css,
  /\.service-preview-image\s*\{[^}]*object-fit:\s*cover[^}]*opacity:\s*0[^}]*transform:\s*translateY\(12px\)/s,
  "service preview images should begin transparent and slightly lowered"
);
const activeServicePreviewBlock =
  css.match(/\.service-preview-image\.is-active\s*\{[\s\S]*?\n\}/)?.[0] || "";
assert.match(activeServicePreviewBlock, /opacity:\s*1/, "the active service preview should be visible");
assert.doesNotMatch(activeServicePreviewBlock, /scale\(/, "service preview images must not scale");
assert.match(
  css,
  /@media \(max-width:\s*760px\)[\s\S]*\.service-index-row-image\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3[^}]*object-fit:\s*cover/s,
  "mobile services should use stable in-flow images"
);
assert.match(js, /querySelectorAll\("\[data-service-index\]"\)/, "services should discover selectable rows");
assert.match(js, /function setActiveService\(index\)/, "services should expose one active-state controller");
assert.match(js, /servicePreviewIndex/, "services should synchronize shared preview images");
assert.doesNotMatch(js, /window\.addEventListener\("scroll"|requestAnimationFrame/, "services should not be driven by page scroll");
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node content-pages.test.mjs
```

Expected: FAIL at `services should pair its text index with one shared preview`.

- [ ] **Step 3: Commit the failing contract**

```bash
git add content-pages.test.mjs
git commit -m "Test services editorial showcase"
```

### Task 2: Build The Services Editorial Showcase

**Files:**
- Modify: `pages/services.html`
- Modify: `content-pages.css`
- Modify: `content-pages.js`
- Test: `content-pages.test.mjs`

**Interfaces:**
- Consumes: Row indices from `data-service-index` and preview indices from `data-service-preview-index`.
- Produces: `setActiveService(index)`; `.is-active` and `aria-current="true"` on the selected row; `.is-active` on the matching preview image.

- [ ] **Step 1: Replace the Services list markup**

Replace the existing `<section class="service-index">` block with:

```html
<section class="service-showcase" aria-label="六项业务">
  <div class="service-showcase-layout">
    <div class="service-index-list">
      <a
        class="service-index-row is-active"
        href="./services/build.html"
        data-service-index="0"
        aria-current="true"
      >
        <img class="service-index-row-image" src="../assets/images/网页/optimized/case-01.jpg" alt="" />
        <span class="service-index-number">01</span>
        <span class="service-index-label">BUILD</span>
        <strong data-zh="汽车改装" data-en="VEHICLE BUILD">汽车改装</strong>
        <p
          data-zh="外观、轮毂、避震、刹车与整车风格升级方案。"
          data-en="Exterior, wheels, suspension, brakes, and a coherent complete-car direction."
        >
          外观、轮毂、避震、刹车与整车风格升级方案。
        </p>
        <span class="service-index-arrow" aria-hidden="true">↗</span>
      </a>
      <a class="service-index-row" href="./services/parts.html" data-service-index="1">
        <img class="service-index-row-image" src="../assets/images/网页/optimized/case-02.jpg" alt="" />
        <span class="service-index-number">02</span>
        <span class="service-index-label">PARTS</span>
        <strong data-zh="汽车配件" data-en="PERFORMANCE PARTS">汽车配件</strong>
        <p
          data-zh="性能件、外观件、轮毂、避震与品牌配件选型供应。"
          data-en="Selection and supply of performance, exterior, wheel, suspension, and branded parts."
        >
          性能件、外观件、轮毂、避震与品牌配件选型供应。
        </p>
        <span class="service-index-arrow" aria-hidden="true">↗</span>
      </a>
      <a class="service-index-row" href="./services/photo.html" data-service-index="2">
        <img class="service-index-row-image" src="../assets/images/网页/optimized/case-03.jpg" alt="" />
        <span class="service-index-number">03</span>
        <span class="service-index-label">PHOTO</span>
        <strong data-zh="汽车摄影" data-en="AUTOMOTIVE MEDIA">汽车摄影</strong>
        <p
          data-zh="静态拍摄、Rolling Shot、短视频与社交媒体内容制作。"
          data-en="Still photography, rolling shots, short films, and social content production."
        >
          静态拍摄、Rolling Shot、短视频与社交媒体内容制作。
        </p>
        <span class="service-index-arrow" aria-hidden="true">↗</span>
      </a>
      <a class="service-index-row" href="./services/ecu.html" data-service-index="3">
        <img class="service-index-row-image" src="../assets/images/网页/optimized/case-04.jpg" alt="" />
        <span class="service-index-number">04</span>
        <span class="service-index-label">ECU</span>
        <strong data-zh="ECU 特调" data-en="ECU CALIBRATION">ECU 特调</strong>
        <p
          data-zh="动力程序、数据记录、道路优化与 Stage 方案规划。"
          data-en="Power calibration, data logging, road refinement, and staged upgrade planning."
        >
          动力程序、数据记录、道路优化与 Stage 方案规划。
        </p>
        <span class="service-index-arrow" aria-hidden="true">↗</span>
      </a>
      <a class="service-index-row" href="./services/chassis.html" data-service-index="4">
        <img class="service-index-row-image" src="../assets/images/网页/optimized/case-05.jpg" alt="" />
        <span class="service-index-number">05</span>
        <span class="service-index-label">CHASSIS</span>
        <strong data-zh="底盘设定" data-en="CHASSIS SETUP">底盘设定</strong>
        <p
          data-zh="车高、轮毂数据、定位与街道 / 赛道驾驶设定。"
          data-en="Ride height, wheel fitment, alignment, and road or track-focused setup."
        >
          车高、轮毂数据、定位与街道 / 赛道驾驶设定。
        </p>
        <span class="service-index-arrow" aria-hidden="true">↗</span>
      </a>
      <a class="service-index-row" href="./services/exhaust.html" data-service-index="5">
        <img class="service-index-row-image" src="../assets/images/网页/optimized/case-06.jpg" alt="" />
        <span class="service-index-number">06</span>
        <span class="service-index-label">EXHAUST</span>
        <strong data-zh="进排气" data-en="INTAKE / EXHAUST">进排气</strong>
        <p
          data-zh="进气、头段、中尾段、声浪与动力响应升级。"
          data-en="Intake, downpipe, center and rear sections, sound, and power response."
        >
          进气、头段、中尾段、声浪与动力响应升级。
        </p>
        <span class="service-index-arrow" aria-hidden="true">↗</span>
      </a>
    </div>
    <div class="service-preview" aria-hidden="true">
      <img
        class="service-preview-image is-active"
        src="../assets/images/网页/optimized/case-01.jpg"
        alt=""
        data-service-preview-index="0"
      />
      <img
        class="service-preview-image"
        src="../assets/images/网页/optimized/case-02.jpg"
        alt=""
        data-service-preview-index="1"
      />
      <img
        class="service-preview-image"
        src="../assets/images/网页/optimized/case-03.jpg"
        alt=""
        data-service-preview-index="2"
      />
      <img
        class="service-preview-image"
        src="../assets/images/网页/optimized/case-04.jpg"
        alt=""
        data-service-preview-index="3"
      />
      <img
        class="service-preview-image"
        src="../assets/images/网页/optimized/case-05.jpg"
        alt=""
        data-service-preview-index="4"
      />
      <img
        class="service-preview-image"
        src="../assets/images/网页/optimized/case-06.jpg"
        alt=""
        data-service-preview-index="5"
      />
    </div>
  </div>
</section>
```

The first row and first preview image start with `is-active`; the first row also starts with `aria-current="true"`. Keep every established title, description, and `./services/*.html` route.

- [ ] **Step 2: Add Services-only responsive presentation**

Replace the old full-width row styling with:

```css
.service-showcase {
  padding: clamp(64px, 6vw, 108px) clamp(24px, 5vw, 92px);
  border-bottom: 1px solid var(--line);
  background: #111315;
}

.service-showcase-layout {
  display: grid;
  grid-template-columns: minmax(360px, 0.72fr) minmax(520px, 1fr);
  gap: clamp(42px, 5vw, 96px);
  min-height: 620px;
}

.service-index-list {
  display: grid;
  grid-template-rows: repeat(6, minmax(0, 1fr));
}

.service-index-row {
  position: relative;
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) 28px;
  grid-template-rows: auto auto auto;
  align-content: center;
  min-width: 0;
  padding: 12px 0;
  border: 0;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
}

.service-index-row:first-child {
  border-top: 1px solid var(--line);
}

.service-index-row::before {
  position: absolute;
  top: 50%;
  left: -12px;
  width: 2px;
  height: 0;
  background: var(--accent-bright);
  box-shadow: 0 0 16px rgba(46, 125, 189, 0.72);
  content: "";
  transform: translateY(-50%);
  transition: height 180ms ease;
}

.service-index-row:hover::before,
.service-index-row.is-active::before,
.service-index-row:focus-visible::before {
  height: 38px;
}

.service-index-row:focus-visible {
  outline: 2px solid var(--accent-bright);
  outline-offset: 4px;
}

.service-index-row-image {
  display: none;
}

.service-index-number {
  grid-column: 1;
  grid-row: 1 / 4;
  align-self: start;
  color: var(--muted);
  font-size: 19px;
}

.service-index-label {
  grid-column: 2;
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
}

.service-index-row strong {
  grid-column: 2;
  margin-top: 3px;
  font-size: 22px;
  font-weight: 600;
}

.service-index-row p {
  grid-column: 2;
  max-width: 34em;
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.service-index-arrow {
  grid-column: 3;
  grid-row: 1 / 4;
  align-self: center;
  color: var(--muted);
  font-size: 21px;
  transition: color 180ms ease, transform 180ms ease;
}

.service-index-row:hover .service-index-number,
.service-index-row:hover .service-index-arrow,
.service-index-row.is-active .service-index-number,
.service-index-row.is-active .service-index-arrow,
.service-index-row:focus-visible .service-index-number,
.service-index-row:focus-visible .service-index-arrow {
  color: var(--accent-bright);
}

.service-index-row:hover .service-index-arrow,
.service-index-row.is-active .service-index-arrow,
.service-index-row:focus-visible .service-index-arrow {
  transform: translate(3px, -3px);
}

.service-preview {
  position: relative;
  min-height: 620px;
  overflow: hidden;
  background: #0d0f11;
}

.service-preview-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 480ms ease, transform 480ms cubic-bezier(0.22, 1, 0.36, 1);
}

.service-preview-image.is-active {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 1180px) {
  .service-showcase-layout {
    grid-template-columns: minmax(300px, 0.8fr) minmax(420px, 1.2fr);
    gap: 40px;
    min-height: 590px;
  }

  .service-preview {
    min-height: 590px;
  }
}

@media (max-width: 760px) {
  .service-showcase {
    padding: 56px 22px 68px;
  }

  .service-showcase-layout {
    display: block;
    min-height: 0;
  }

  .service-index-list {
    display: grid;
    grid-template-rows: none;
    gap: 44px;
  }

  .service-index-row {
    grid-template-columns: 44px minmax(0, 1fr) 24px;
    grid-template-rows: auto auto auto auto;
    padding: 0 0 28px;
  }

  .service-index-row-image {
    display: block;
    grid-column: 1 / -1;
    width: 100%;
    aspect-ratio: 4 / 3;
    margin-bottom: 18px;
    object-fit: cover;
  }

  .service-index-number {
    grid-row: 2 / 5;
  }

  .service-index-label {
    grid-row: 2;
  }

  .service-index-row strong {
    grid-row: 3;
  }

  .service-index-row p {
    grid-column: 2 / 4;
    grid-row: 4;
  }

  .service-index-arrow {
    grid-row: 2 / 4;
  }

  .service-preview {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .service-index-row::before,
  .service-index-arrow,
  .service-preview-image {
    transition: none;
  }

  .service-preview-image {
    transform: none;
  }
}
```

Rows keep neutral `var(--line)` separators, a stable grid, no card background, and a two-pixel blue active marker.

- [ ] **Step 3: Add the active-state controller**

Add after the contact selectors:

```js
const serviceRows = [...document.querySelectorAll("[data-service-index]")];
const servicePreviewImages = [...document.querySelectorAll("[data-service-preview-index]")];

function setActiveService(index) {
  serviceRows.forEach((row) => {
    const isActive = Number(row.dataset.serviceIndex) === index;
    row.classList.toggle("is-active", isActive);
    if (isActive) {
      row.setAttribute("aria-current", "true");
    } else {
      row.removeAttribute("aria-current");
    }
  });

  servicePreviewImages.forEach((image) => {
    image.classList.toggle(
      "is-active",
      Number(image.dataset.servicePreviewIndex) === index
    );
  });
}

serviceRows.forEach((row) => {
  const index = Number(row.dataset.serviceIndex);
  row.addEventListener("mouseenter", () => setActiveService(index));
  row.addEventListener("focus", () => setActiveService(index));
  row.addEventListener("click", () => setActiveService(index));
});

if (serviceRows.length && servicePreviewImages.length) {
  setActiveService(0);
}
```

- [ ] **Step 4: Run the focused test**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node content-pages.test.mjs
```

Expected: PASS with no output.

- [ ] **Step 5: Commit the implementation**

```bash
git add pages/services.html content-pages.css content-pages.js
git commit -m "Build services editorial showcase"
```

### Task 3: Verify The Complete Local Experience

**Files:**
- Modify: `design-qa.md`
- Test: all root `*.test.mjs` files

**Interfaces:**
- Consumes: The completed Services page and the existing local HTTP preview.
- Produces: A local QA record covering desktop, mobile, language, routes, active-state synchronization, and unchanged neighboring pages.

- [ ] **Step 1: Run the complete automated suite**

Run:

```bash
for test in *.test.mjs; do
  /Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node "$test" || exit 1
done
```

Expected: every test exits zero.

- [ ] **Step 2: Inspect the 1900 x 1050 desktop state**

Open `http://127.0.0.1:4192/pages/services.html` in the in-app browser. Confirm the hero remains unchanged, the six rows fit beside one stable preview, the image does not scale, hover over all six rows updates the preview, and the next section remains visible after scrolling.

- [ ] **Step 3: Inspect the 1440 x 900 desktop state**

Confirm the content remains centered, both columns remain legible, the preview crops cleanly, and no element creates horizontal overflow.

- [ ] **Step 4: Inspect the 390 x 844 mobile state**

Confirm the shared preview is absent, every row has one 4:3 image, bilingual copy wraps without clipping, and every route remains easy to tap.

- [ ] **Step 5: Record QA**

Append a dated Services section to `design-qa.md` recording:

```markdown
## Services Editorial Showcase — 2026-07-18

- Automated tests: all root `*.test.mjs` files passed.
- Desktop: checked at 1900 × 1050 and 1440 × 900.
- Mobile: checked at 390 × 844.
- Interaction: six hover/focus states synchronize rows and preview images.
- Motion: preview uses opacity and translateY only; no scale.
- Scope: homepage, Cases page, service detail pages, and production deployment unchanged.
```

- [ ] **Step 6: Commit the QA record**

```bash
git add design-qa.md
git commit -m "Document services showcase QA"
```
