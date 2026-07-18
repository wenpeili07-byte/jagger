# Services Workshop Process Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Services hero and flat list with the selected Workshop Process Rail while preserving all six service routes, bilingual content, shared header, and the existing LONMA visual system.

**Architecture:** Keep this as an isolated static-page change. `pages/services.html` owns the service-rail markup, `content-pages.css` owns all responsive presentation behind `.services-page` selectors, and `content-pages.js` owns the small active-row interaction in addition to its existing language logic. `content-pages.test.mjs` remains the structural regression contract.

**Tech Stack:** Semantic HTML5, CSS Grid, vanilla JavaScript, Node.js `assert` tests, local in-app browser verification.

## Global Constraints

- The primary desktop canvas is 1900 x 1050 and remains centered at `max-width: 1900px`.
- Keep the existing shared header, six service routes, written service content, footer, and bilingual `data-zh` / `data-en` system.
- Use only existing LONMA photography in the first implementation.
- Do not change the homepage, cases pages, About page, Contact page, or service-detail pages.
- Do not use rounded cards, nested cards, gradients, decorative blobs, permanent blue borders, `transform: scale()` for layout, or `width: 100vw`.
- Default separators stay neutral gray. Blue is limited to active navigation, the active row edge, numbers, arrows, short rules, and keyboard focus.
- Images use `object-fit: cover` and never zoom, scale, or move on row activation.
- The 390 px mobile layout must not overflow horizontally.
- Preserve accessible keyboard focus and respect reduced-motion preferences.
- Do not stage, discard, or commit unrelated dirty-worktree changes.

---

### Task 1: Lock The Service-Rail Contract

**Files:**
- Modify: `content-pages.test.mjs:37-67`
- Test: `content-pages.test.mjs`

**Interfaces:**
- Consumes: Existing `servicesHtml`, `css`, and `js` strings loaded at the top of the test.
- Produces: Structural contracts for `.services-workspace`, `.service-process-rail`, six `[data-service-row]` links, six image slots, the active-row controller, and desktop/mobile CSS.

- [ ] **Step 1: Replace the old service-list assertions with failing rail assertions**

Keep the existing `serviceLinks` array and replace the assertions beginning with
the old `.service-index-row` count with:

```js
assert.match(servicesHtml, /class="services-workspace"/, "services should use the selected workshop workspace");
assert.match(servicesHtml, /class="services-intro"/, "services should keep a dedicated editorial introduction");
assert.match(servicesHtml, /class="service-process-rail"/, "services should present one continuous process rail");
assert.doesNotMatch(servicesHtml, /class="content-hero services-hero"/, "services should remove the old standalone hero");
assert.doesNotMatch(servicesHtml, /class="service-index"/, "services should remove the old flat service index");
assert.equal((servicesHtml.match(/data-service-row/g) || []).length, 6, "services should contain six interactive process rows");
assert.equal((servicesHtml.match(/class="service-process-media"/g) || []).length, 6, "each service row should include LONMA photography");

for (const href of serviceLinks) {
  assert.match(servicesHtml, new RegExp(`href="${href.replaceAll(".", "\\.")}"`), `services should link to ${href}`);
}

assert.match(
  servicesHtml,
  /01[\s\S]*BUILD[\s\S]*02[\s\S]*PARTS[\s\S]*03[\s\S]*PHOTO[\s\S]*04[\s\S]*ECU[\s\S]*05[\s\S]*CHASSIS[\s\S]*06[\s\S]*EXHAUST/,
  "services should keep the established service order",
);

for (const caseNumber of ["01", "02", "03", "04", "05", "06"]) {
  const imagePath = `./assets/images/网页/optimized/case-${caseNumber}.jpg`;
  assert.ok(existsSync(new URL(imagePath, import.meta.url)), `${imagePath} should exist`);
  assert.match(servicesHtml, new RegExp(`optimized/case-${caseNumber}\\.jpg`), `services should use case-${caseNumber}.jpg`);
}
```

Append these CSS and JavaScript contracts after the existing content-page CSS
assertions:

```js
assert.match(css, /\.services-workspace\s*\{[^}]*grid-template-columns:/s, "services should use the selected split workspace");
assert.match(css, /\.service-process-rail\s*\{[^}]*grid-template-rows:\s*repeat\(6,/s, "desktop rail should reserve six equal rows");
assert.match(css, /\.service-process-media img\s*\{[^}]*object-fit:\s*cover/s, "service imagery should crop without distortion");
assert.doesNotMatch(css, /\.service-process-row:hover[\s\S]{0,800}\.service-process-media img\s*\{[^}]*transform:/s, "service hover should not zoom or move images");
assert.match(css, /\.service-process-row:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent-bright\)/s, "service rows should keep visible keyboard focus");
assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*\.services-workspace\s*\{[^}]*grid-template-columns:\s*1fr/s, "services should stack cleanly on mobile");
assert.match(js, /querySelectorAll\("\[data-service-row\]"\)/, "services should initialize the active process row");
assert.match(js, /toggleAttribute\("data-active"/, "only one process row should remain active");
```

- [ ] **Step 2: Run the targeted test and verify the new contract fails**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node content-pages.test.mjs
```

Expected: FAIL at `services should use the selected workshop workspace`.

- [ ] **Step 3: Commit the failing contract**

```bash
git add content-pages.test.mjs
git commit -m "test: define services process rail contract"
```

---

### Task 2: Replace The Services Markup And Add Active-Row Behavior

**Files:**
- Modify: `pages/services.html:32-185`
- Modify: `content-pages.js`
- Test: `content-pages.test.mjs`

**Interfaces:**
- Consumes: Existing header, `data-zh` / `data-en` language attributes, six service routes, six optimized case images.
- Produces: Six anchors with `data-service-row`; one default `data-active` row; `.service-process-copy`, `.service-process-media`, and `.service-process-arrow` hooks; a single-active-row controller.

- [ ] **Step 1: Replace the old hero, service index, and method section**

Keep the existing header and footer. Replace everything between them with this
structure:

```html
<section class="services-workspace" aria-labelledby="services-title">
  <aside class="services-intro">
    <p class="content-eyebrow">SERVICES <span>01—06</span></p>
    <h1 id="services-title" data-zh="从目标到成车" data-en="FROM INTENT TO COMPLETE CAR">从目标到成车</h1>
    <span class="content-accent-line" aria-hidden="true"></span>
    <p
      data-zh="六大核心能力，覆盖改装全流程。专业分工、循环测试，只为最终驾驶体验。"
      data-en="Six core capabilities cover the complete build process. Focused craft and repeated testing serve the final driving experience."
    >
      六大核心能力，覆盖改装全流程。专业分工、循环测试，只为最终驾驶体验。
    </p>
    <p class="services-intro-signature">PRECISION WORK.<br />DRIVING OBSESSION.</p>
  </aside>

  <div class="service-process-rail" aria-label="六项业务">
    <a class="service-process-row" href="./services/build.html" data-service-row>
      <span class="service-process-number">01</span>
      <div class="service-process-copy">
        <span class="service-process-label">BUILD</span>
        <h2 data-zh="汽车改装" data-en="VEHICLE BUILD">汽车改装</h2>
        <p
          data-zh="外观、轮毂、避震、刹车与整车风格升级方案。"
          data-en="Exterior, wheels, suspension, brakes, and a coherent complete-car direction."
        >外观、轮毂、避震、刹车与整车风格升级方案。</p>
      </div>
      <figure class="service-process-media" aria-hidden="true">
        <img src="../assets/images/网页/optimized/case-01.jpg" alt="" />
      </figure>
      <span class="service-process-arrow" aria-hidden="true">→</span>
    </a>

    <a class="service-process-row" href="./services/parts.html" data-service-row>
      <span class="service-process-number">02</span>
      <div class="service-process-copy">
        <span class="service-process-label">PARTS</span>
        <h2 data-zh="汽车配件" data-en="PERFORMANCE PARTS">汽车配件</h2>
        <p
          data-zh="性能件、外观件、轮毂、避震与品牌配件选型供应。"
          data-en="Selection and supply of performance, exterior, wheel, suspension, and branded parts."
        >性能件、外观件、轮毂、避震与品牌配件选型供应。</p>
      </div>
      <figure class="service-process-media" aria-hidden="true">
        <img src="../assets/images/网页/optimized/case-02.jpg" alt="" loading="lazy" />
      </figure>
      <span class="service-process-arrow" aria-hidden="true">→</span>
    </a>

    <a class="service-process-row" href="./services/photo.html" data-service-row>
      <span class="service-process-number">03</span>
      <div class="service-process-copy">
        <span class="service-process-label">PHOTO</span>
        <h2 data-zh="汽车摄影" data-en="AUTOMOTIVE MEDIA">汽车摄影</h2>
        <p
          data-zh="静态拍摄、Rolling Shot、短视频与社交媒体内容制作。"
          data-en="Still photography, rolling shots, short films, and social content production."
        >静态拍摄、Rolling Shot、短视频与社交媒体内容制作。</p>
      </div>
      <figure class="service-process-media" aria-hidden="true">
        <img src="../assets/images/网页/optimized/case-03.jpg" alt="" loading="lazy" />
      </figure>
      <span class="service-process-arrow" aria-hidden="true">→</span>
    </a>

    <a class="service-process-row" href="./services/ecu.html" data-service-row data-active>
      <span class="service-process-number">04</span>
      <div class="service-process-copy">
        <span class="service-process-label">ECU</span>
        <h2 data-zh="ECU 特调" data-en="ECU CALIBRATION">ECU 特调</h2>
        <p
          data-zh="动力程序、数据记录、道路优化与 Stage 方案规划。"
          data-en="Power calibration, data logging, road refinement, and staged upgrade planning."
        >动力程序、数据记录、道路优化与 Stage 方案规划。</p>
      </div>
      <figure class="service-process-media" aria-hidden="true">
        <img src="../assets/images/网页/optimized/case-04.jpg" alt="" loading="lazy" />
      </figure>
      <span class="service-process-arrow" aria-hidden="true">→</span>
    </a>

    <a class="service-process-row" href="./services/chassis.html" data-service-row>
      <span class="service-process-number">05</span>
      <div class="service-process-copy">
        <span class="service-process-label">CHASSIS</span>
        <h2 data-zh="底盘设定" data-en="CHASSIS SETUP">底盘设定</h2>
        <p
          data-zh="车高、轮毂数据、定位与街道 / 赛道驾驶设定。"
          data-en="Ride height, wheel fitment, alignment, and road or track-focused setup."
        >车高、轮毂数据、定位与街道 / 赛道驾驶设定。</p>
      </div>
      <figure class="service-process-media" aria-hidden="true">
        <img src="../assets/images/网页/optimized/case-05.jpg" alt="" loading="lazy" />
      </figure>
      <span class="service-process-arrow" aria-hidden="true">→</span>
    </a>

    <a class="service-process-row" href="./services/exhaust.html" data-service-row>
      <span class="service-process-number">06</span>
      <div class="service-process-copy">
        <span class="service-process-label">EXHAUST</span>
        <h2 data-zh="进排气" data-en="INTAKE / EXHAUST">进排气</h2>
        <p
          data-zh="进气、头段、中尾段、声浪与动力响应升级。"
          data-en="Intake, downpipe, center and rear sections, sound, and power response."
        >进气、头段、中尾段、声浪与动力响应升级。</p>
      </div>
      <figure class="service-process-media" aria-hidden="true">
        <img src="../assets/images/网页/optimized/case-06.jpg" alt="" loading="lazy" />
      </figure>
      <span class="service-process-arrow" aria-hidden="true">→</span>
    </a>
  </div>
</section>
```

- [ ] **Step 2: Add the isolated active-row controller**

Append this block after the existing language initialization in
`content-pages.js`:

```js
const serviceRows = Array.from(document.querySelectorAll("[data-service-row]"));

const setActiveServiceRow = (activeRow) => {
  serviceRows.forEach((row) => {
    row.toggleAttribute("data-active", row === activeRow);
  });
};

serviceRows.forEach((row) => {
  row.addEventListener("pointerenter", () => setActiveServiceRow(row));
  row.addEventListener("focusin", () => setActiveServiceRow(row));
});
```

Do not add pointer-leave behavior. The last explored service remains active,
matching the selected visual target and avoiding a flash back to row 04.

- [ ] **Step 3: Run the targeted test**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node content-pages.test.mjs
```

Expected: service structure and JavaScript assertions PASS; CSS rail assertions
still FAIL because Task 3 has not added the styles.

- [ ] **Step 4: Commit the markup and behavior**

```bash
git add pages/services.html content-pages.js
git commit -m "feat: add services workshop process rail"
```

---

### Task 3: Implement Desktop And Mobile Rail Styling

**Files:**
- Modify: `content-pages.css:43-360`
- Test: `content-pages.test.mjs`

**Interfaces:**
- Consumes: `.services-workspace`, `.services-intro`, `.service-process-rail`, `.service-process-row`, `.service-process-copy`, `.service-process-media`, `.service-process-arrow`, and `[data-active]`.
- Produces: Six equal desktop rows, a stable active treatment, and a mobile stacked layout with no horizontal overflow.

- [ ] **Step 1: Remove obsolete Services-only selectors**

Delete the complete rules whose selectors are listed below, from each opening
selector through its matching closing brace. Do not remove any selector shared
with About or Contact:

- `.services-hero`
- `.services-hero .content-hero-media img`
- `.service-index`
- `.service-index-row`
- `.service-index-row:first-child`
- `.service-index-row:hover`
- `.service-index-row:focus-visible`
- `.service-index-number`
- `.service-index-label`
- `.service-index-row strong`
- `.service-index-row p`
- `.service-index-arrow`
- `.service-index-row:hover .service-index-arrow`
- `.service-method`
- `.service-method h2`
- `.service-method a`
- `.service-method a:hover, .service-method a:focus-visible`

Also remove obsolete Services-only responsive declarations for those classes.

- [ ] **Step 2: Add the desktop workspace and row styles**

Insert this block where the old Services selectors lived:

```css
.services-workspace {
  display: grid;
  grid-template-columns: minmax(320px, 24%) minmax(0, 1fr);
  min-height: calc(min(1050px, 100vh) - 76px);
  border-bottom: 1px solid var(--line);
  background: #111315;
}

.services-intro {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: clamp(54px, 6vh, 82px) clamp(30px, 3.2vw, 62px) 42px;
  border-right: 1px solid var(--line);
  background: #111315;
}

.services-intro h1 {
  max-width: 8em;
  margin: 0;
  font-family: Impact, "Arial Narrow", Arial, Helvetica, sans-serif;
  font-size: clamp(56px, 4.2vw, 80px);
  font-weight: 800;
  line-height: 0.98;
  letter-spacing: 0;
}

.services-intro > p:not(.content-eyebrow):not(.services-intro-signature) {
  max-width: 30em;
  margin: 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.75;
}

.services-intro-signature {
  margin: auto 0 0;
  padding-top: 36px;
  border-top: 1px solid var(--line);
  color: rgba(232, 231, 226, 0.48);
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.6;
}

.service-process-rail {
  display: grid;
  grid-template-rows: repeat(6, minmax(132px, 1fr));
  min-width: 0;
  background: #111315;
}

.service-process-row {
  position: relative;
  display: grid;
  grid-template-columns: minmax(330px, 42%) minmax(0, 58%);
  min-width: 0;
  overflow: hidden;
  border-top: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
  isolation: isolate;
  transition: background 200ms ease;
}

.service-process-row:first-child {
  border-top: 0;
}

.service-process-row::before {
  position: absolute;
  z-index: 4;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  background: var(--accent-bright);
  box-shadow: 0 0 18px var(--accent-glow);
  content: "";
  transform: scaleY(0);
  transform-origin: center;
  transition: transform 200ms ease;
}

.service-process-number {
  position: absolute;
  z-index: 3;
  top: 24px;
  left: 34px;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 23px;
  line-height: 1;
  transition: color 200ms ease;
}

.service-process-copy {
  position: relative;
  z-index: 2;
  grid-column: 1;
  min-width: 0;
  padding: 22px 54px 20px 96px;
  background: rgba(17, 19, 21, 0.94);
}

.service-process-label {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
}

.service-process-copy h2 {
  margin: 8px 0 7px;
  font-family: "Arial Narrow", Arial, Helvetica, sans-serif;
  font-size: clamp(22px, 1.45vw, 29px);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: 0;
}

.service-process-copy p {
  max-width: 38em;
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.service-process-media {
  position: relative;
  z-index: 1;
  grid-column: 2;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  background: #171a1d;
}

.service-process-media::after {
  position: absolute;
  inset: 0;
  background: rgba(9, 11, 12, 0.2);
  content: "";
  transition: background 200ms ease;
}

.service-process-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  filter: saturate(0.82) contrast(1.05) brightness(0.68);
  opacity: 0.88;
  transition: filter 220ms ease, opacity 220ms ease;
}

.service-process-row:nth-child(2) .service-process-media img,
.service-process-row:nth-child(5) .service-process-media img {
  object-position: center 62%;
}

.service-process-row:nth-child(3) .service-process-media img {
  object-position: center 42%;
}

.service-process-arrow {
  position: absolute;
  z-index: 5;
  top: 50%;
  left: calc(42% - 30px);
  color: var(--muted);
  font-size: 25px;
  transform: translate(-100%, -50%);
  transition: color 200ms ease, translate 200ms ease;
}

.service-process-row[data-active],
.service-process-row:hover {
  background: rgba(28, 93, 153, 0.14);
}

.service-process-row[data-active]::before,
.service-process-row:hover::before,
.service-process-row:focus-visible::before {
  transform: scaleY(1);
}

.service-process-row[data-active] .service-process-number,
.service-process-row[data-active] .service-process-label,
.service-process-row[data-active] .service-process-arrow,
.service-process-row:hover .service-process-number,
.service-process-row:hover .service-process-label,
.service-process-row:hover .service-process-arrow {
  color: var(--accent-bright);
}

.service-process-row[data-active] .service-process-media::after,
.service-process-row:hover .service-process-media::after {
  background: rgba(9, 11, 12, 0.08);
}

.service-process-row[data-active] .service-process-media img,
.service-process-row:hover .service-process-media img {
  filter: saturate(0.94) contrast(1.06) brightness(0.8);
  opacity: 1;
}

.service-process-row[data-active] .service-process-arrow,
.service-process-row:hover .service-process-arrow {
  translate: 6px 0;
}

.service-process-row:focus-visible {
  z-index: 6;
  outline: 2px solid var(--accent-bright);
  outline-offset: -3px;
}
```

- [ ] **Step 3: Add responsive and reduced-motion rules**

Add these declarations to the existing responsive sections:

```css
@media (max-width: 1180px) {
  .services-workspace {
    grid-template-columns: minmax(270px, 30%) minmax(0, 1fr);
  }

  .service-process-row {
    grid-template-columns: minmax(250px, 48%) minmax(0, 52%);
  }

  .service-process-copy {
    padding-right: 34px;
  }

  .service-process-arrow {
    left: calc(48% - 22px);
  }
}

@media (max-width: 760px) {
  .services-workspace {
    display: grid;
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .services-intro {
    min-height: 430px;
    padding: 54px 24px 34px;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .services-intro h1 {
    max-width: none;
    font-size: 54px;
  }

  .services-intro-signature {
    margin-top: 72px;
  }

  .service-process-rail {
    display: block;
  }

  .service-process-row {
    display: grid;
    grid-template-columns: 1fr;
    min-height: 360px;
  }

  .service-process-copy {
    z-index: 3;
    grid-column: 1;
    grid-row: 1;
    align-self: end;
    padding: 98px 52px 28px 68px;
    background: rgba(17, 19, 21, 0.76);
  }

  .service-process-media {
    grid-column: 1;
    grid-row: 1;
    min-height: 360px;
  }

  .service-process-number {
    top: 24px;
    left: 24px;
  }

  .service-process-arrow {
    top: auto;
    right: 24px;
    bottom: 28px;
    left: auto;
    transform: none;
  }

  .service-process-row[data-active] .service-process-arrow,
  .service-process-row:hover .service-process-arrow {
    translate: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .service-process-row,
  .service-process-row::before,
  .service-process-media::after,
  .service-process-media img,
  .service-process-arrow {
    transition: none;
  }
}
```

- [ ] **Step 4: Run the targeted test and verify it passes**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node content-pages.test.mjs
```

Expected: PASS with no output.

- [ ] **Step 5: Commit the isolated Services styling**

```bash
git add content-pages.css
git commit -m "style: match services workshop process design"
```

---

### Task 4: Visual QA And Full Regression Check

**Files:**
- Create: `docs/superpowers/qa/2026-07-18-services-workshop-process-qa.md`
- Modify only if visual comparison finds a mismatch: `pages/services.html`, `content-pages.css`, `content-pages.js`, `content-pages.test.mjs`
- Test: all `*.test.mjs`

**Interfaces:**
- Consumes: Selected target image
  `/Users/wenpeili/.codex/generated_images/019edc34-b0b1-7e33-adc9-d777315e90eb/call_EYiEgDevLPftYPjI4dbu35el.png`
  and the local Services URL.
- Produces: Desktop/mobile screenshots, a side-by-side target comparison, a QA record, and a passing full test suite.

- [ ] **Step 1: Reload the local Services page and verify core behavior**

Use the in-app browser at:

```text
http://127.0.0.1:4190/pages/services.html
```

Verify:

- six service rows are present
- row 04 is active initially
- pointer movement activates exactly one row
- keyboard focus activates exactly one row and retains a visible outline
- the language toggle translates the intro, all six titles, descriptions, and
  shared navigation
- every row retains its existing service-detail link
- the console reports no errors

- [ ] **Step 2: Capture required viewports**

Capture:

```text
1900 x 1050 -> outputs/services-workshop-process-1900.png
1440 x 900  -> outputs/services-workshop-process-1440.png
390 x 844   -> outputs/services-workshop-process-mobile.png
```

At 390 px, read `document.documentElement.scrollWidth` and
`document.documentElement.clientWidth`; both must equal `390`.

- [ ] **Step 3: Build and inspect the 1900 px side-by-side comparison**

Place the selected target on the left and the rendered implementation on the
right at equal 1900 x 1050 dimensions. Save:

```text
outputs/services-workshop-process-comparison.png
```

Judge and fix:

- 24% / 76% column balance
- all six rows visible in the first canvas
- title scale and left-column spacing
- neutral default dividers
- active row blue edge and arrow
- image crop, brightness, and clarity
- no card framing or permanent blue borders

Repeat the comparison after any fix. Do not treat screenshots alone as QA.

- [ ] **Step 4: Run the complete test suite**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" zsh -lc 'for test_file in *.test.mjs; do node "$test_file" || exit 1; done'
```

Expected: every existing test exits `0`.

Run:

```bash
git diff --check
```

Expected: no whitespace errors.

- [ ] **Step 5: Record QA evidence**

Create `docs/superpowers/qa/2026-07-18-services-workshop-process-qa.md` with:

```markdown
# Services Workshop Process QA

- Source target: `call_EYiEgDevLPftYPjI4dbu35el.png`
- Desktop checks: 1900 x 1050 and 1440 x 900
- Mobile check: 390 x 844
- Horizontal overflow at 390 px: none
- Six service links: passed
- Chinese / English toggle: passed
- Pointer and keyboard active states: passed
- Console errors: none
- Full Node test suite: passed
- Final comparison: `outputs/services-workshop-process-comparison.png`
- Result: passed
```

- [ ] **Step 6: Commit the verified redesign**

Stage only files that belong to this redesign:

```bash
git add pages/services.html content-pages.css content-pages.js content-pages.test.mjs docs/superpowers/qa/2026-07-18-services-workshop-process-qa.md
git commit -m "feat: redesign services as workshop process rail"
```
