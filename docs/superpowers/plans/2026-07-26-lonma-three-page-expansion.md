# LONMA DYNAMIC Three-Page Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved project planner, forged-wheel product detail, and Case 02 video story as three bilingual, responsive pages inside the existing LONMA DYNAMIC site.

**Architecture:** Keep the current static HTML/CSS/vanilla JavaScript structure and shared header, footer, language controller, 2200px production canvas token, and mobile bottom navigation. Each new experience owns one focused stylesheet and controller, while the existing contact page receives a small allowlisted query-prefill layer and the existing render scripts remain the source of truth for generated Shop and Case detail HTML.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node.js ES modules, Node test runner, existing local WebP/JPEG photography, Vercel static hosting.

## Global Constraints

- English is the default language on every fresh page load.
- Chinese and English content remain available through the existing language toggle.
- Use the existing dark automotive editorial palette and type system.
- Default dividers and borders stay neutral gray.
- Dark blue is limited to active states, arrows, small rules, and primary actions.
- Use existing LONMA vehicle and product photography; do not introduce stock imagery.
- Preserve the current desktop canvas behavior and mobile breakpoint conventions.
- Keep the shared header and footer behavior consistent with the rest of the site.
- Each page has one primary action and no decorative dashboard cards.
- All visible interface text receives `data-en` and `data-zh` values.
- Default document text is English.
- Product measurements and vehicle chassis codes remain language-neutral.
- Maintain visible keyboard focus using the brighter accent blue.
- Images use useful alt text and fixed aspect ratios to prevent layout shift.
- Lazy-load below-the-fold images.
- Keep animation transform- and opacity-based.
- Disable nonessential motion under `prefers-reduced-motion`.
- Do not add checkout, payments, customer accounts, order tracking, live inventory, automatic quotes, CMS migration, or 3D rendering.
- Do not use `100vw`, whole-page `transform: scale()`, permanent blue card borders, decorative gradients, or invented stock imagery.
- The existing Contact page remains available as the fallback inquiry path.
- The existing Resend delivery limitation is not changed or represented as resolved by this feature.

---

## File Structure

### Create

- `pages/project.html`: four-step complete-car project planner and shared site shell.
- `project.css`: planner layout, controls, progress, image stage, review, and responsive behavior.
- `project.js`: planner state, step navigation, validation, review rendering, and contact handoff.
- `project-planner.test.mjs`: planner route, bilingual copy, state preservation, and contact URL tests.
- `pages/shop/forged-wheel.html`: forged-wheel configuration and fitment page.
- `shop-product.css`: product stage, configuration controls, swatches, specifications, and mobile action bar.
- `shop-product.js`: fitment state, option selection, URL preservation, and planner/contact handoff.
- `shop-product.test.mjs`: product route, fitment, configuration, and handoff tests.
- `three-page-expansion.test.mjs`: shared route, entry-point, localization, and generated-page contracts.

### Modify

- `index.html`: route the strongest homepage project CTA to the planner.
- `pages/contact.html`: add a prefill notice hook without changing the existing form fields or API action.
- `contact-form.js`: safely prefill vehicle, service, and message fields from allowlisted query parameters.
- `contact-form.test.mjs`: verify safe query prefill and preserve existing submission behavior.
- `scripts/render-detail-pages.mjs`: route the Vehicle Build detail CTA to the planner and render the new Case 02 story.
- `scripts/render-shop-page.mjs`: render the forged-wheel card as a product-detail link.
- `pages/shop.html`: regenerated Shop catalog containing the new product-detail entry point.
- `shop.js`: preserve vehicle/category query parameters when following the forged-wheel detail link.
- `shop.test.mjs`: verify the forged-wheel link and query preservation.
- `pages/cases/case-02.html`: regenerated Case 02 video story.
- `case-02.css`: replace the parts-marker layout with the approved video and editorial layout.
- `case-02.js`: replace marker synchronization with poster-only video behavior and reduced-motion-safe reveals.
- `case-02.test.mjs`: verify the new story, video fallback, localization, and navigation.
- `global-shell.test.mjs`: include the three routes in shared header/footer checks.
- `english-copy.test.mjs`: include the three routes in English-default and bilingual coverage.
- `responsive-layout.test.mjs`: cover the new page selectors and overflow guards.
- `shared-cache.test.mjs`: include new page assets and updated cache keys.
- `design-qa.md`: record final desktop, split-screen, and mobile visual checks.

---

### Task 1: Add Shared Routes, Entry Points, And Safe Contact Prefill

**Files:**
- Create: `three-page-expansion.test.mjs`
- Modify: `global-shell.test.mjs`
- Modify: `english-copy.test.mjs`
- Modify: `index.html`
- Modify: `scripts/render-detail-pages.mjs`
- Modify: `pages/contact.html`
- Modify: `contact-form.js`
- Modify: `contact-form.test.mjs`

**Interfaces:**
- Consumes: the existing `.topbar`, `.nav`, `.lang-toggle`, `.content-footer`, `data-section`, `data-en`, and `data-zh` conventions.
- Produces: `/pages/project.html`, `/pages/shop/forged-wheel.html`, and the existing `/pages/cases/case-02.html` as tested routes; `readContactPrefill(search)` returning `{ vehicle, service, message }`; query keys `vehicle`, `service`, `message`, `product`, and `subject`.

- [ ] **Step 1: Write failing shared route and contact-prefill tests**

Create `three-page-expansion.test.mjs` with exact route and entry-point assertions:

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("the three approved customer routes exist", () => {
  for (const path of [
    "./pages/project.html",
    "./pages/shop/forged-wheel.html",
    "./pages/cases/case-02.html",
  ]) {
    assert.equal(existsSync(new URL(path, import.meta.url)), true, path);
  }
});

test("the strongest project calls route to the planner", () => {
  assert.match(read("./index.html"), /href="\.\/pages\/project\.html"[^>]*data-en="START YOUR PROJECT →"/);
  assert.match(read("./pages/services/build.html"), /href="\.\.\/project\.html"[^>]*data-en="START YOUR PROJECT →"/);
});

test("the contact page exposes a bilingual prefill notice", () => {
  const html = read("./pages/contact.html");
  assert.match(html, /data-contact-prefill-status/);
  assert.match(html, /data-en="PROJECT DETAILS ADDED FROM YOUR SELECTIONS\."/);
  assert.match(html, /data-zh="已载入你选择的项目资料。"/);
});
```

Extend `contact-form.test.mjs` with a VM harness that provides `window.location.search`, `URLSearchParams`, named form controls, and these cases:

```js
test("contact prefill accepts known services and strips control characters", () => {
  const harness = runController({
    search: "?vehicle=2024%20BMW%20G80%20M3&service=Custom%20Vehicle%20Builds&message=Street%0Asetup",
    fetchImpl: async () => ({ ok: true }),
  });

  assert.equal(harness.fields.vehicle.value, "2024 BMW G80 M3");
  assert.equal(harness.fields.service.value, "Custom Vehicle Builds");
  assert.equal(harness.fields.message.value, "Street setup");
  assert.equal(harness.prefillStatus.hidden, false);
});

test("contact prefill rejects unknown services and caps field lengths", () => {
  const harness = runController({
    search: `?vehicle=${"M".repeat(150)}&service=Unknown&message=${"A".repeat(3100)}`,
    fetchImpl: async () => ({ ok: true }),
  });

  assert.equal(harness.fields.vehicle.value.length, 120);
  assert.equal(harness.fields.service.value, "");
  assert.equal(harness.fields.message.value.length, 3000);
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
node --test three-page-expansion.test.mjs contact-form.test.mjs
```

Expected: failures for the two missing routes, missing planner links, missing prefill status, and absent query-prefill behavior.

- [ ] **Step 3: Add the two empty route shells and shared navigation**

Create the complete shared shell in `pages/project.html` and `pages/shop/forged-wheel.html` before later tasks add page content. The planner uses page-relative navigation:

```html
<body data-section="project">
  <main class="site-shell project-page">
    <header class="topbar">
      <a class="brand" href="../index.html" aria-label="Back to home" data-zh-aria-label="回到首页" data-en-aria-label="Back to home">LONMA DYNAMIC</a>
      <nav class="nav" aria-label="Main navigation" data-zh-aria-label="主导航" data-en-aria-label="Main navigation">
        <a href="./about.html">ABOUT</a>
        <a href="./services.html">SERVICES</a>
        <a href="./cases.html">CASES</a>
        <a href="./contact.html">CONTACT</a>
        <a href="./shop.html">SHOP</a>
      </nav>
      <div class="top-actions">
        <button class="lang-toggle" type="button" aria-label="切换到中文">
          <span class="lang-option" data-lang-option="zh">中</span>
          <span class="lang-separator" aria-hidden="true">/</span>
          <span class="lang-option is-current" data-lang-option="en">EN</span>
        </button>
      </div>
    </header>
    <section aria-labelledby="project-title">
      <h1 id="project-title" data-en="BUILD YOUR DIRECTION." data-zh="确定你的改装方向。">BUILD YOUR DIRECTION.</h1>
    </section>
    <footer class="content-footer">
      <span>LONMA DYNAMIC</span>
      <span data-zh="龙马态度 · 2026" data-en="AUTOMOTIVE ATTITUDE · 2026">AUTOMOTIVE ATTITUDE · 2026</span>
      <a href="./contact.html" data-zh="直接联系 →" data-en="CONTACT DIRECTLY →">CONTACT DIRECTLY →</a>
    </footer>
  </main>
  <script src="../content-pages.js?v=three-page-expansion-20260726"></script>
</body>
```

The nested product shell uses `../../styles.css`, `../../layout-canvas.css`, `../../content-pages.js`, `../../index.html`, and `../about.html` through `../shop.html`; Shop receives `aria-current="page"`.

- [ ] **Step 4: Route the strongest project calls**

Change the homepage footer CTA to:

```html
<a href="./pages/project.html" data-i18n="footer.contact" data-zh="开始你的项目 →" data-en="START YOUR PROJECT →">START YOUR PROJECT →</a>
```

In `scripts/render-detail-pages.mjs`, use the planner only for the build record:

```js
const projectHref = record.id === "build"
  ? "../project.html"
  : "../contact.html";
```

Render the detail CTA with `href="${projectHref}"`, then run:

```bash
node scripts/render-detail-pages.mjs
```

Expected: `pages/services/build.html` points to `../project.html`; other service and case CTAs still point to Contact.

- [ ] **Step 5: Add a bilingual prefill notice to Contact**

Place this immediately before `.contact-form`:

```html
<p
  class="contact-prefill-status"
  data-contact-prefill-status
  data-en="PROJECT DETAILS ADDED FROM YOUR SELECTIONS."
  data-zh="已载入你选择的项目资料。"
  hidden
>PROJECT DETAILS ADDED FROM YOUR SELECTIONS.</p>
```

Style it in `content-pages.css` using the existing mono font, `var(--muted)` text, a 2px `var(--accent-bright)` left rule, and no card background.

- [ ] **Step 6: Implement safe query prefill**

Add these constants and functions inside `contact-form.js` before the submit listener:

```js
const prefillStatus = document.querySelector("[data-contact-prefill-status]");
const knownServices = new Set([
  "Custom Vehicle Builds",
  "Performance Parts",
  "Automotive Photography",
  "ECU Calibration",
  "Chassis Setup",
  "Intake & Exhaust",
]);

function cleanQueryValue(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function readContactPrefill(search) {
  const query = new URLSearchParams(search);
  const vehicle = cleanQueryValue(query.get("vehicle"), 120);
  const requestedService = cleanQueryValue(query.get("service"), 80);
  const product = cleanQueryValue(query.get("product"), 120);
  const subject = cleanQueryValue(query.get("subject"), 180);
  const directMessage = cleanQueryValue(query.get("message"), 3000);
  const message = directMessage || cleanQueryValue(
    [subject, product && `Product: ${product}`].filter(Boolean).join(". "),
    3000,
  );

  return {
    vehicle,
    service: knownServices.has(requestedService) ? requestedService : "",
    message,
  };
}

function applyContactPrefill() {
  const values = readContactPrefill(window.location.search);
  const fields = {
    vehicle: form.elements.namedItem("vehicle"),
    service: form.elements.namedItem("service"),
    message: form.elements.namedItem("message"),
  };
  let applied = false;

  Object.entries(values).forEach(([name, value]) => {
    if (value && fields[name] && !fields[name].value) {
      fields[name].value = value;
      applied = true;
    }
  });

  if (prefillStatus) prefillStatus.hidden = !applied;
}

applyContactPrefill();
```

Pass `window` and `URLSearchParams` into the existing VM tests.

- [ ] **Step 7: Regenerate and verify GREEN**

Run:

```bash
node scripts/render-detail-pages.mjs
node --test three-page-expansion.test.mjs contact-form.test.mjs global-shell.test.mjs english-copy.test.mjs
```

Expected: all focused route, shell, localization, and prefill tests pass.

- [ ] **Step 8: Commit**

```bash
git add index.html pages/project.html pages/shop/forged-wheel.html pages/contact.html pages/services/build.html content-pages.css contact-form.js scripts/render-detail-pages.mjs three-page-expansion.test.mjs contact-form.test.mjs global-shell.test.mjs english-copy.test.mjs
git commit -m "Add three page routes and contact prefill"
```

---

### Task 2: Build The Four-Step Project Planner

**Files:**
- Create: `project.css`
- Create: `project.js`
- Create: `project-planner.test.mjs`
- Modify: `pages/project.html`
- Modify: `three-page-expansion.test.mjs`
- Modify: `responsive-layout.test.mjs`

**Interfaces:**
- Consumes: query keys `vehicle`, `product`, `diameter`, `width`, `finish`, and `quantity`; existing local image `../assets/images/网页/optimized/case-01.jpg`.
- Produces: one `plannerState` object with `{ step, vehicle, goal, directions, product }`; `setStep(index)`, `readPlannerQuery(search)`, `buildContactUrl(state)`, and a final `/pages/contact.html` URL containing allowlisted `vehicle`, `service`, and `message`.

- [ ] **Step 1: Write failing planner structure and state tests**

Create `project-planner.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const html = readFileSync(new URL("./pages/project.html", import.meta.url), "utf8");
const source = readFileSync(new URL("./project.js", import.meta.url), "utf8");

test("planner exposes four bilingual steps and one primary handoff", () => {
  assert.equal((html.match(/data-planner-step=/g) || []).length, 4);
  assert.match(html, /data-en="VEHICLE" data-zh="车辆"/);
  assert.match(html, /data-en="GOAL" data-zh="目标"/);
  assert.match(html, /data-en="DIRECTION" data-zh="方向"/);
  assert.match(html, /data-en="REVIEW" data-zh="确认"/);
  assert.equal((html.match(/data-planner-submit/g) || []).length, 1);
});

test("planner controller keeps selections and builds a safe contact URL", () => {
  const exported = {};
  vm.runInNewContext(source, {
    URLSearchParams,
    document: createPlannerDocument(),
    window: {
      location: { href: "", search: "?product=forged-wheel&finish=Satin%20Black" },
      LonmaPlannerTest: exported,
    },
  });

  exported.setGoal("road-track");
  exported.toggleDirection("chassis", true);
  exported.setStep(0);
  exported.setStep(3);

  assert.equal(exported.getState().goal, "road-track");
  assert.deepEqual([...exported.getState().directions], ["chassis"]);
  const target = new URL(exported.buildContactUrl(exported.getState()), "https://example.test");
  assert.equal(target.pathname, "/pages/contact.html");
  assert.equal(target.searchParams.get("service"), "Chassis Setup");
  assert.match(target.searchParams.get("message"), /forged-wheel/i);
  assert.match(target.searchParams.get("message"), /Satin Black/);
});
```

The test harness supplies four step nodes, progress buttons, vehicle controls, goal radios, direction checkboxes, back/next/submit controls, image, and review text nodes. It must dispatch changes and clicks instead of inspecting private variables.

- [ ] **Step 2: Run the planner test and verify RED**

Run:

```bash
node --test project-planner.test.mjs
```

Expected: failure because the planner markup, controller, and stylesheet do not exist.

- [ ] **Step 3: Build the complete planner markup**

Replace the placeholder section in `pages/project.html` with:

```html
<section class="project-planner" aria-labelledby="project-title" data-project-planner>
  <header class="project-heading">
    <p data-en="PROJECT PLANNER · 01–04" data-zh="项目规划 · 01–04">PROJECT PLANNER · 01–04</p>
    <h1 id="project-title" data-en="BUILD YOUR DIRECTION." data-zh="确定你的改装方向。">BUILD YOUR DIRECTION.</h1>
  </header>
  <ol class="project-progress" aria-label="Project steps" data-en-aria-label="Project steps" data-zh-aria-label="项目步骤">
    <li><button type="button" data-progress-step="0" aria-current="step"><span>01</span><span data-en="VEHICLE" data-zh="车辆">VEHICLE</span></button></li>
    <li><button type="button" data-progress-step="1"><span>02</span><span data-en="GOAL" data-zh="目标">GOAL</span></button></li>
    <li><button type="button" data-progress-step="2"><span>03</span><span data-en="DIRECTION" data-zh="方向">DIRECTION</span></button></li>
    <li><button type="button" data-progress-step="3"><span>04</span><span data-en="REVIEW" data-zh="确认">REVIEW</span></button></li>
  </ol>
  <div class="project-workspace">
    <div class="project-controls">
      <section data-planner-step="0">
        <p class="project-kicker" data-en="01 / VEHICLE" data-zh="01 / 车辆">01 / VEHICLE</p>
        <h2 data-en="START WITH THE CAR." data-zh="先从车辆开始。">START WITH THE CAR.</h2>
        <div class="project-fields">
          <label><span data-en="MAKE" data-zh="品牌">MAKE</span><select data-vehicle-make><option>BMW</option><option>AUDI</option><option>MERCEDES-BENZ</option></select></label>
          <label><span data-en="MODEL" data-zh="车型">MODEL</span><input data-vehicle-model value="G80 M3" maxlength="40" /></label>
          <label><span data-en="CHASSIS" data-zh="底盘">CHASSIS</span><input data-vehicle-chassis value="G8X" maxlength="20" /></label>
          <label><span data-en="YEAR" data-zh="年份">YEAR</span><input data-vehicle-year inputmode="numeric" value="2024" maxlength="4" /></label>
        </div>
      </section>
      <section data-planner-step="1" hidden>
        <p class="project-kicker" data-en="02 / GOAL" data-zh="02 / 目标">02 / GOAL</p>
        <h2 data-en="HOW SHOULD IT FEEL?" data-zh="你希望它呈现什么状态？">HOW SHOULD IT FEEL?</h2>
        <div class="project-choice-list">
          <label><input type="radio" name="goal" value="street" checked /><span><strong data-en="STREET" data-zh="街道">STREET</strong><small data-en="Balanced response and daily usability." data-zh="兼顾响应与日常使用。">Balanced response and daily usability.</small></span></label>
          <label><input type="radio" name="goal" value="road-track" /><span><strong data-en="ROAD & TRACK" data-zh="道路与赛道">ROAD & TRACK</strong><small data-en="Repeatable performance with sharper feedback." data-zh="更直接的反馈与稳定表现。">Repeatable performance with sharper feedback.</small></span></label>
          <label><input type="radio" name="goal" value="show" /><span><strong data-en="SHOW" data-zh="展示">SHOW</strong><small data-en="A coherent visual direction for the complete car." data-zh="建立完整统一的整车视觉方向。">A coherent visual direction for the complete car.</small></span></label>
        </div>
      </section>
      <section data-planner-step="2" hidden>
        <p class="project-kicker" data-en="03 / DIRECTION" data-zh="03 / 方向">03 / DIRECTION</p>
        <h2 data-en="CHOOSE THE WORKSTREAMS." data-zh="选择需要推进的方向。">CHOOSE THE WORKSTREAMS.</h2>
        <div class="project-direction-grid">
          <label><input type="checkbox" value="build" /><span data-en="VEHICLE BUILD" data-zh="汽车改装">VEHICLE BUILD</span></label>
          <label><input type="checkbox" value="parts" /><span data-en="PERFORMANCE PARTS" data-zh="汽车配件">PERFORMANCE PARTS</span></label>
          <label><input type="checkbox" value="photo" /><span data-en="AUTOMOTIVE MEDIA" data-zh="汽车摄影">AUTOMOTIVE MEDIA</span></label>
          <label><input type="checkbox" value="ecu" /><span data-en="ECU CALIBRATION" data-zh="ECU 特调">ECU CALIBRATION</span></label>
          <label><input type="checkbox" value="chassis" /><span data-en="CHASSIS SETUP" data-zh="底盘设定">CHASSIS SETUP</span></label>
          <label><input type="checkbox" value="exhaust" /><span data-en="INTAKE / EXHAUST" data-zh="进排气">INTAKE / EXHAUST</span></label>
        </div>
      </section>
      <section data-planner-step="3" hidden>
        <p class="project-kicker" data-en="04 / REVIEW" data-zh="04 / 确认">04 / REVIEW</p>
        <h2 data-en="REVIEW THE DIRECTION." data-zh="确认项目方向。">REVIEW THE DIRECTION.</h2>
        <dl class="project-review">
          <div><dt data-en="VEHICLE" data-zh="车辆">VEHICLE</dt><dd data-review-vehicle></dd></div>
          <div><dt data-en="GOAL" data-zh="目标">GOAL</dt><dd data-review-goal></dd></div>
          <div><dt data-en="DIRECTION" data-zh="方向">DIRECTION</dt><dd data-review-directions></dd></div>
          <div data-review-product-row hidden><dt data-en="PRODUCT" data-zh="产品">PRODUCT</dt><dd data-review-product></dd></div>
        </dl>
      </section>
      <p class="project-error" data-project-error aria-live="polite"></p>
      <div class="project-actions">
        <button type="button" data-planner-back disabled><span aria-hidden="true">←</span><span data-en="BACK" data-zh="返回">BACK</span></button>
        <button type="button" data-planner-next><span data-en="CONTINUE" data-zh="继续">CONTINUE</span><span aria-hidden="true">→</span></button>
        <a data-planner-submit hidden data-en="SEND TO LONMA →" data-zh="发送给龙马 →">SEND TO LONMA →</a>
      </div>
    </div>
    <figure class="project-visual">
      <img src="../assets/images/网页/optimized/case-01.jpg" alt="LONMA DYNAMIC BMW project vehicle" data-en-alt="LONMA DYNAMIC BMW project vehicle" data-zh-alt="LONMA DYNAMIC BMW 项目车辆" />
      <figcaption data-en="DIRECTION BEFORE PARTS." data-zh="先确定方向，再选择部件。">DIRECTION BEFORE PARTS.</figcaption>
    </figure>
  </div>
</section>
```

Load `../project.css?v=project-planner-20260726` after the shared styles and `../project.js?v=project-planner-20260726` after `content-pages.js`.

- [ ] **Step 4: Implement planner state and handoff**

Use these exact maps and state shape in `project.js`:

```js
const serviceMap = {
  build: "Custom Vehicle Builds",
  parts: "Performance Parts",
  photo: "Automotive Photography",
  ecu: "ECU Calibration",
  chassis: "Chassis Setup",
  exhaust: "Intake & Exhaust",
};
const goalLabels = {
  street: { en: "STREET", zh: "街道" },
  "road-track": { en: "ROAD & TRACK", zh: "道路与赛道" },
  show: { en: "SHOW", zh: "展示" },
};
const plannerState = {
  step: 0,
  vehicle: { make: "BMW", model: "G80 M3", chassis: "G8X", year: "2024" },
  goal: "street",
  directions: new Set(),
  product: null,
};
```

Use this query reader so product selections cannot inject control characters or exceed the Contact message limits:

```js
function cleanSelection(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function readPlannerQuery(search) {
  const query = new URLSearchParams(search);
  const product = cleanSelection(query.get("product"), 120);
  const options = [
    ["Diameter", cleanSelection(query.get("diameter"), 80)],
    ["Width", cleanSelection(query.get("width"), 80)],
    ["Finish", cleanSelection(query.get("finish"), 80)],
    ["Quantity", cleanSelection(query.get("quantity"), 8)],
  ].filter(([, value]) => value);

  return {
    direction: query.get("direction") === "parts" ? "parts" : "",
    product: product
      ? [product, ...options.map(([label, value]) => `${label}: ${value}`)].join(", ")
      : null,
  };
}
```

Initialize `plannerState.product` from `readPlannerQuery(window.location.search)` and preselect `parts` when the returned direction is `parts`. `setStep(index)` clamps to `0..3`, validates nonempty vehicle fields before leaving step 0 and at least one direction before leaving step 2, hides inactive step sections, updates `aria-current`, and preserves all values.

`buildContactUrl(state)` uses:

```js
const selectedServices = [...state.directions].map((key) => serviceMap[key]).filter(Boolean);
const query = new URLSearchParams({
  vehicle: [state.vehicle.year, state.vehicle.make, state.vehicle.model, state.vehicle.chassis].filter(Boolean).join(" "),
  service: selectedServices[0] || "Custom Vehicle Builds",
  message: [
    `Goal: ${goalLabels[state.goal].en}.`,
    `Directions: ${selectedServices.join(", ")}.`,
    state.product ? `Product selection: ${state.product}.` : "",
  ].filter(Boolean).join(" "),
});
return `./contact.html?${query.toString()}`;
```

Expose only the following test bridge when it already exists:

```js
if (window.LonmaPlannerTest) {
  Object.assign(window.LonmaPlannerTest, {
    buildContactUrl,
    getState: () => plannerState,
    setGoal: (goal) => { plannerState.goal = goal; },
    setStep,
    toggleDirection: (key, enabled) => enabled
      ? plannerState.directions.add(key)
      : plannerState.directions.delete(key),
  });
}
```

- [ ] **Step 5: Implement planner layout and mobile behavior**

In `project.css`:

- `.project-planner` uses a neutral `#111315` background and `min-height: min(calc(100vh - var(--site-header-height)), var(--site-first-screen-max))`.
- `.project-heading` and `.project-progress` use `var(--site-gutter)` horizontal padding.
- `.project-workspace` uses `grid-template-columns: minmax(420px, 0.86fr) minmax(0, 1.14fr)`.
- `.project-controls` uses `padding: clamp(32px, 5vw, 88px)` and no surrounding card border.
- `.project-visual` uses `aspect-ratio: 4 / 3`, `overflow: hidden`, and `border-left: 1px solid var(--line)`.
- Form controls use neutral borders; checked controls, primary action, arrows, short rules, and focus-visible outlines use `var(--accent)` or `var(--accent-bright)`.
- At `max-width: 1100px`, stack the workspace and place the image after controls.
- At `max-width: 767px`, use one-column fields, a four-column compact progress rail, `min-height: 44px` controls, and `padding-bottom: calc(92px + env(safe-area-inset-bottom))` on `.project-controls`.
- The mobile `.project-actions` is sticky at `bottom: calc(64px + env(safe-area-inset-bottom))`, but remains in document flow and never covers form fields.
- Under `prefers-reduced-motion: reduce`, remove control and image transitions.

- [ ] **Step 6: Verify planner behavior**

Run:

```bash
node --check project.js
node --test project-planner.test.mjs three-page-expansion.test.mjs responsive-layout.test.mjs
```

Expected: the four steps preserve vehicle, goal, directions, and product query context; invalid progress is blocked; the final Contact URL is safe and complete.

- [ ] **Step 7: Commit**

```bash
git add pages/project.html project.css project.js project-planner.test.mjs three-page-expansion.test.mjs responsive-layout.test.mjs
git commit -m "Build the project planning flow"
```

---

### Task 3: Build The Forged-Wheel Product Detail And Fitment Flow

**Files:**
- Create: `shop-product.css`
- Create: `shop-product.js`
- Create: `shop-product.test.mjs`
- Modify: `pages/shop/forged-wheel.html`
- Modify: `scripts/render-shop-page.mjs`
- Modify: `pages/shop.html`
- Modify: `shop.js`
- Modify: `shop.test.mjs`
- Modify: `responsive-layout.test.mjs`

**Interfaces:**
- Consumes: Shop query keys `category`, `make`, `model`, `year`, and `chassis`; local image `../../assets/images/shop/forged-wheel.webp`.
- Produces: `productState` with `{ vehicle, diameter, width, finish, quantity, supported }`; `validateFitment(state)`; `syncProductActions(state)`; planner URL `../project.html?...`; contact URL `../contact.html?...`.

- [ ] **Step 1: Write failing Shop detail and entry-point tests**

Create `shop-product.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const html = readFileSync(new URL("./pages/shop/forged-wheel.html", import.meta.url), "utf8");
const source = readFileSync(new URL("./shop-product.js", import.meta.url), "utf8");

test("forged wheel page exposes fitment, configuration, and two honest actions", () => {
  assert.match(html, /data-product-fitment/);
  assert.match(html, /data-option-group="diameter"/);
  assert.match(html, /data-option-group="width"/);
  assert.match(html, /data-option-group="finish"/);
  assert.match(html, /data-product-quantity/);
  assert.match(html, /data-en="ADD TO BUILD"/);
  assert.match(html, /data-en="REQUEST FITMENT CHECK"/);
  assert.doesNotMatch(html, /CHECKOUT|BUY NOW|IN STOCK/i);
});

test("unsupported fitment disables add to build but keeps fitment inquiry", () => {
  const exported = {};
  const harness = createProductHarness();
  vm.runInNewContext(source, {
    URL,
    URLSearchParams,
    document: harness.document,
    window: {
      location: { href: "https://example.test/pages/shop/forged-wheel.html", search: "" },
      LonmaProductTest: exported,
    },
  });

  exported.setVehicle("AUDI", "RS 5", "2024", "B9.5");
  assert.equal(exported.getState().supported, false);
  assert.equal(harness.addToBuild.getAttribute("aria-disabled"), "true");
  assert.match(harness.fitmentMessage.textContent, /FITMENT CHECK REQUIRED/);
  assert.match(harness.fitmentInquiry.href, /contact\.html/);
});
```

Extend `shop.test.mjs` to require:

```js
assert.match(html, /href="\.\/shop\/forged-wheel\.html"[^>]*data-product-link="forged-wheel"/);
```

and verify the runtime appends `category`, `make`, `model`, `year`, and `chassis` without dropping existing values.

- [ ] **Step 2: Run focused Shop tests and verify RED**

Run:

```bash
node --test shop-product.test.mjs shop.test.mjs
```

Expected: failures for the placeholder product page, missing product link, and absent fitment controller.

- [ ] **Step 3: Render the forged-wheel card as a product link**

In `scripts/render-shop-page.mjs`, render this action only when `product.id === "forged-wheel"`:

```html
<a
  href="./shop/forged-wheel.html"
  data-product-link="forged-wheel"
  data-zh="查看配置 →"
  data-en="CONFIGURE →"
>CONFIGURE →</a>
```

All other product actions remain dialog buttons. Update the card-action CSS selector so the anchor inherits the existing button typography, focus style, and minimum touch target.

In `shop.js`, add:

```js
function syncProductLinks() {
  const source = new URLSearchParams(window.location.search);
  source.set("make", makeControl.value);
  source.set("model", modelControl.value);
  source.set("year", yearControl.value);
  source.set("chassis", chassisControl.value);

  document.querySelectorAll("[data-product-link]").forEach((link) => {
    const target = new URL(link.getAttribute("href"), window.location.href);
    ["category", "make", "model", "year", "chassis"].forEach((key) => {
      const value = source.get(key);
      if (value) target.searchParams.set(key, value);
    });
    link.href = `${target.pathname}${target.search}`;
  });
}
```

Call `syncProductLinks()` after initial vehicle setup and after every vehicle/filter change. Regenerate:

```bash
node scripts/render-shop-page.mjs
```

- [ ] **Step 4: Build the complete product page**

Use this first-viewport structure in `pages/shop/forged-wheel.html`:

```html
<section class="product-detail" aria-labelledby="product-title">
  <div class="product-stage">
    <a class="product-back" href="../shop.html" data-en="← BACK TO SHOP" data-zh="← 返回商店">← BACK TO SHOP</a>
    <div class="product-stage-main">
      <img src="../../assets/images/shop/forged-wheel.webp" alt="Forged performance wheel in satin black" data-en-alt="Forged performance wheel in satin black" data-zh-alt="缎面黑锻造性能轮毂" />
    </div>
    <div class="product-thumbnails" aria-label="Product views" data-en-aria-label="Product views" data-zh-aria-label="产品视图">
      <button type="button" aria-current="true"><img src="../../assets/images/shop/forged-wheel.webp" alt="" /></button>
    </div>
  </div>
  <div class="product-config">
    <p class="product-kicker" data-en="WHEELS / FORGED" data-zh="轮毂 / 锻造">WHEELS / FORGED</p>
    <h1 id="product-title" data-en="MONOBLOCK FORGED WHEEL" data-zh="单片式锻造轮毂">MONOBLOCK FORGED WHEEL</h1>
    <p data-en="A lightweight wheel direction configured around vehicle fitment, brake clearance, and complete-car proportion." data-zh="围绕车型适配、刹车空间与整车比例配置的轻量化轮毂方向。">A lightweight wheel direction configured around vehicle fitment, brake clearance, and complete-car proportion.</p>
    <p class="product-reference-price"><span data-en="REFERENCE PACKAGE" data-zh="参考套装">REFERENCE PACKAGE</span><strong>US$3,200</strong><small data-en="Final quote follows fitment verification." data-zh="最终报价以适配确认后为准。">Final quote follows fitment verification.</small></p>
    <fieldset data-product-fitment>
      <legend data-en="VEHICLE FITMENT" data-zh="车型适配">VEHICLE FITMENT</legend>
      <label><span data-en="MAKE" data-zh="品牌">MAKE</span><select data-fitment-make><option>BMW</option><option>AUDI</option><option>MERCEDES-BENZ</option></select></label>
      <label><span data-en="MODEL" data-zh="车型">MODEL</span><input data-fitment-model value="G80 M3" maxlength="40" /></label>
      <label><span data-en="YEAR" data-zh="年份">YEAR</span><input data-fitment-year value="2024" maxlength="4" inputmode="numeric" /></label>
      <label><span data-en="CHASSIS" data-zh="底盘">CHASSIS</span><input data-fitment-chassis value="G8X" maxlength="20" /></label>
    </fieldset>
    <fieldset data-option-group="diameter"><legend data-en="DIAMETER" data-zh="直径">DIAMETER</legend><label><input type="radio" name="diameter" value="19 inch" checked /><span>19"</span></label><label><input type="radio" name="diameter" value="20 inch" /><span>20"</span></label></fieldset>
    <fieldset data-option-group="width"><legend data-en="WIDTH" data-zh="宽度">WIDTH</legend><label><input type="radio" name="width" value="9.5J / 10.5J" checked /><span>9.5J / 10.5J</span></label><label><input type="radio" name="width" value="10J / 11J" /><span>10J / 11J</span></label></fieldset>
    <fieldset data-option-group="finish"><legend data-en="FINISH" data-zh="颜色">FINISH</legend><label><input type="radio" name="finish" value="Satin Black" checked /><span class="finish-swatch finish-swatch-black" aria-hidden="true"></span><span data-en="SATIN BLACK" data-zh="缎面黑">SATIN BLACK</span></label><label><input type="radio" name="finish" value="Brushed Silver" /><span class="finish-swatch finish-swatch-silver" aria-hidden="true"></span><span data-en="BRUSHED SILVER" data-zh="拉丝银">BRUSHED SILVER</span></label></fieldset>
    <label class="product-quantity"><span data-en="QUANTITY" data-zh="数量">QUANTITY</span><input data-product-quantity type="number" min="1" max="4" value="4" /></label>
    <p class="product-fitment-message" data-fitment-message aria-live="polite"></p>
    <div class="product-actions">
      <span class="product-action-price"><small data-en="REFERENCE PACKAGE" data-zh="参考套装">REFERENCE PACKAGE</small><strong>US$3,200</strong></span>
      <a data-add-to-build data-en="ADD TO BUILD" data-zh="加入项目">ADD TO BUILD</a>
      <a data-fitment-inquiry data-en="REQUEST FITMENT CHECK" data-zh="申请适配确认">REQUEST FITMENT CHECK</a>
    </div>
  </div>
</section>
```

Below it, add one unframed `.product-specifications` section with bilingual rows for `CONSTRUCTION / 单片式锻造`, `APPLICATION / 街道与道路性能`, `FINISH / 缎面黑或拉丝银`, and `FITMENT / 下单前确认`. Use `loading="lazy"` only for any image added below the first viewport.

- [ ] **Step 5: Implement fitment and handoff behavior**

Use this exact state and validation in `shop-product.js`:

```js
const productState = {
  vehicle: { make: "BMW", model: "G80 M3", year: "2024", chassis: "G8X" },
  diameter: "19 inch",
  width: "9.5J / 10.5J",
  finish: "Satin Black",
  quantity: 4,
  supported: true,
};

function validateFitment(state) {
  const supportedModel = /^(G80 M3|G82 M4|G83 M4)$/i.test(state.vehicle.model.trim());
  const supportedYear = Number(state.vehicle.year) >= 2021 && Number(state.vehicle.year) <= 2026;
  const supportedSize =
    (state.diameter === "19 inch" && state.width === "9.5J / 10.5J") ||
    (state.diameter === "20 inch" && state.width === "10J / 11J");
  return state.vehicle.make === "BMW"
    && state.vehicle.chassis.toUpperCase() === "G8X"
    && supportedModel
    && supportedYear
    && supportedSize;
}
```

`syncProductActions(state)` uses the validation result, localized fitment copy, `aria-disabled`, and `tabindex="-1"`:

```js
function syncProductActions(state) {
  state.supported = validateFitment(state);
  const language = document.documentElement.lang.startsWith("zh") ? "zh" : "en";
  const fitmentCopy = state.supported
    ? { en: "FITMENT MATCH · FINAL CLEARANCE CHECK REQUIRED", zh: "适配匹配 · 仍需最终空间确认" }
    : { en: "FITMENT CHECK REQUIRED", zh: "需要确认车型适配" };

  fitmentMessage.dataset.en = fitmentCopy.en;
  fitmentMessage.dataset.zh = fitmentCopy.zh;
  fitmentMessage.textContent = fitmentCopy[language];
  addToBuild.setAttribute("aria-disabled", String(!state.supported));
  addToBuild.toggleAttribute("tabindex", !state.supported);
  if (state.supported) addToBuild.removeAttribute("tabindex");
  else addToBuild.setAttribute("tabindex", "-1");
}
```

After setting the state, append the supported Add to Build route:

```js
const plannerQuery = new URLSearchParams({
  product: "forged-wheel",
  vehicle: [state.vehicle.year, state.vehicle.make, state.vehicle.model, state.vehicle.chassis].join(" "),
  direction: "parts",
  diameter: state.diameter,
  width: state.width,
  finish: state.finish,
  quantity: String(state.quantity),
});
addToBuild.href = `../project.html?${plannerQuery.toString()}`;
```

Fitment Inquiry always routes to Contact:

```js
const contactQuery = new URLSearchParams({
  vehicle: [state.vehicle.year, state.vehicle.make, state.vehicle.model, state.vehicle.chassis].join(" "),
  service: "Performance Parts",
  product: "forged-wheel",
  message: `Fitment check: ${state.diameter}, ${state.width}, ${state.finish}, quantity ${state.quantity}.`,
});
fitmentInquiry.href = `../contact.html?${contactQuery.toString()}`;
```

Read initial `make`, `model`, `year`, and `chassis` query values using the same control-character removal and field limits as Contact.

Expose this bridge only when the test object already exists:

```js
if (window.LonmaProductTest) {
  Object.assign(window.LonmaProductTest, {
    getState: () => productState,
    setVehicle(make, model, year, chassis) {
      productState.vehicle = { make, model, year, chassis };
      syncProductActions(productState);
    },
    validateFitment,
  });
}
```

- [ ] **Step 6: Implement desktop and mobile product layout**

In `shop-product.css`:

- `.product-detail` uses `grid-template-columns: minmax(0, 1.08fr) minmax(420px, 0.92fr)`.
- `.product-stage` is sticky only above `1100px`, top-aligned below the shared header, and never exceeds `calc(100vh - var(--site-header-height))`.
- `.product-stage-main` uses `aspect-ratio: 1`, `background: #0d0f11`, and a neutral border.
- The wheel image uses `object-fit: contain`, never `cover`.
- `.product-config` uses `padding: clamp(32px, 4vw, 72px)` and neutral separators between option groups.
- Swatches are real CSS color samples only: satin black `#1c1e20`, brushed silver `#a7a9aa`; they are form indicators, not decorative art.
- Primary action uses `var(--accent)` and brightens to `var(--accent-bright)` on hover/focus; secondary action has a neutral border.
- At `max-width: 1100px`, stack image then configuration.
- At `max-width: 767px`, thumbnails scroll horizontally, fields stack, and `.product-actions` is fixed above the existing 64px bottom navigation with the reference price, Add to Build, and Fitment Check.
- Add `padding-bottom: calc(148px + env(safe-area-inset-bottom))` so the mobile action bar never covers specifications.
- Unsupported state visibly disables the primary action without reducing text contrast below readable levels.

- [ ] **Step 7: Verify Shop behavior**

Run:

```bash
node scripts/render-shop-page.mjs
node --check shop.js
node --check shop-product.js
node --test shop-product.test.mjs shop.test.mjs three-page-expansion.test.mjs responsive-layout.test.mjs
```

Expected: the forged-wheel card opens the detail page, filter and vehicle query values survive, valid BMW G8X combinations enable Add to Build, unsupported combinations disable it, and Contact inquiry remains available.

- [ ] **Step 8: Commit**

```bash
git add pages/shop.html pages/shop/forged-wheel.html scripts/render-shop-page.mjs shop.js shop.css shop-product.css shop-product.js shop.test.mjs shop-product.test.mjs responsive-layout.test.mjs
git commit -m "Build forged wheel fitment detail"
```

---

### Task 4: Redesign Case 02 As A Video-Led Editorial Story

**Files:**
- Modify: `scripts/render-detail-pages.mjs`
- Modify: `pages/cases/case-02.html`
- Modify: `case-02.css`
- Modify: `case-02.js`
- Modify: `case-02.test.mjs`
- Modify: `case-detail.test.mjs`
- Modify: `responsive-layout.test.mjs`

**Interfaces:**
- Consumes: Case 02 title and adjacent-case data from `detail-pages-data.mjs`; poster `../../assets/images/网页/optimized/case-02.jpg`; detail images `../../assets/images/shop/brake-kit.webp`, `../../assets/images/shop/coilover-kit.webp`, and `../../assets/images/shop/forged-wheel.webp`.
- Produces: one native `[data-case-video]` element with no source until a real video exists, `[data-video-state="poster-only"]`, bilingual disabled video status, two editorial beats, previous/next navigation, and one Contact inquiry.

- [ ] **Step 1: Replace old Case 02 tests with failing story contracts**

Update `case-02.test.mjs` to require:

```js
test("Case 02 opens with a poster-only native video stage", () => {
  assert.match(html, /class="case02-video-stage"/);
  assert.match(html, /<video[^>]*data-case-video[^>]*poster="[^"]*case-02\.jpg"[^>]*controls[^>]*preload="metadata"/s);
  assert.match(html, /data-video-state="poster-only"/);
  assert.match(html, /data-en="FINAL FILM COMING SOON"/);
  assert.doesNotMatch(html, /<video[^>]*autoplay/);
  assert.doesNotMatch(html, /<source/);
});

test("Case 02 is an image-led bilingual story", () => {
  assert.match(html, /data-en="THE DIRECTION"/);
  assert.match(html, /data-en="TEST, ADJUST, REPEAT"/);
  assert.equal((html.match(/class="case02-story-media"/g) || []).length, 3);
  assert.equal((html.match(/loading="lazy"/g) || []).length, 3);
  assert.doesNotMatch(html, /PARTS USED|data-case-marker|data-case-part/);
});

test("Case 02 preserves archive, adjacent case, and inquiry links", () => {
  assert.match(html, /href="\.\.\/cases\.html"/);
  assert.match(html, /href="\.\/case-01\.html"/);
  assert.match(html, /href="\.\/case-03\.html"/);
  assert.match(html, /href="\.\.\/contact\.html\?service=Custom%20Vehicle%20Builds/);
});
```

Delete marker-scroll VM tests because the marker interface is intentionally removed. Add one controller test asserting a poster-only stage never calls `video.play()`.

- [ ] **Step 2: Run Case tests and verify RED**

Run:

```bash
node --test case-02.test.mjs case-detail.test.mjs
```

Expected: failures for the old marker/parts layout and missing video story.

- [ ] **Step 3: Replace the Case 02 renderer branch**

In `scripts/render-detail-pages.mjs`, render this structure for record `02`:

```html
<section class="case02-video-stage" data-video-state="poster-only" aria-labelledby="case02-title">
  <video
    data-case-video
    poster="../../assets/images/网页/optimized/case-02.jpg"
    controls
    preload="metadata"
    aria-label="Case 02 project film"
    data-en-aria-label="Case 02 project film"
    data-zh-aria-label="案例 02 项目影片"
  ></video>
  <div class="case02-video-copy">
    <a href="../cases.html" data-en="← BACK TO CASES" data-zh="← 返回案例">← BACK TO CASES</a>
    <p>CASE 02</p>
    <h1 id="case02-title" data-en="ROAD & TRACK SETUP" data-zh="赛道化升级">ROAD & TRACK SETUP</h1>
    <dl>
      <div><dt data-en="VEHICLE" data-zh="车辆">VEHICLE</dt><dd>BMW G80 M3</dd></div>
      <div><dt data-en="YEAR" data-zh="年份">YEAR</dt><dd>2024</dd></div>
    </dl>
  </div>
  <button type="button" class="case02-video-status" disabled data-en="FINAL FILM COMING SOON" data-zh="完整影片即将上线">FINAL FILM COMING SOON</button>
</section>
<div class="case02-story">
  <section class="case02-story-beat case02-story-beat-direction">
    <div class="case02-story-copy">
      <p>01</p>
      <h2 data-en="THE DIRECTION" data-zh="改装方向">THE DIRECTION</h2>
      <p data-en="Sharper response without turning the car into a single-purpose machine. Braking, chassis feedback, and wheel fitment are considered as one system." data-zh="提升响应，同时保留车辆在真实道路中的完整性。刹车、底盘反馈与轮毂数据作为一个系统共同调整。">Sharper response without turning the car into a single-purpose machine. Braking, chassis feedback, and wheel fitment are considered as one system.</p>
    </div>
    <figure class="case02-story-media"><img src="../../assets/images/shop/brake-kit.webp" loading="lazy" alt="Case 02 brake system detail" data-en-alt="Case 02 brake system detail" data-zh-alt="案例 02 刹车系统细节" /></figure>
  </section>
  <section class="case02-story-beat case02-story-beat-test">
    <figure class="case02-story-media"><img src="../../assets/images/shop/coilover-kit.webp" loading="lazy" alt="Case 02 chassis setup detail" data-en-alt="Case 02 chassis setup detail" data-zh-alt="案例 02 底盘设定细节" /></figure>
    <div class="case02-story-copy">
      <p>02</p>
      <h2 data-en="TEST, ADJUST, REPEAT" data-zh="测试、调整、再测试">TEST, ADJUST, REPEAT</h2>
      <p data-en="Each change is judged through real driving, tire condition, and driver feedback. The setup evolves until the car responds as one complete package." data-zh="每一次变化都通过真实驾驶、轮胎状态与驾驶反馈判断。持续调整，直到整车形成统一响应。">Each change is judged through real driving, tire condition, and driver feedback. The setup evolves until the car responds as one complete package.</p>
    </div>
  </section>
  <figure class="case02-story-media case02-story-wide"><img src="../../assets/images/shop/forged-wheel.webp" loading="lazy" alt="Case 02 forged wheel direction" data-en-alt="Case 02 forged wheel direction" data-zh-alt="案例 02 锻造轮毂方向" /></figure>
</div>
```

After the story, render one inquiry action to:

```text
../contact.html?service=Custom%20Vehicle%20Builds&vehicle=2024%20BMW%20G80%20M3&message=Case%2002%20road%20and%20track%20direction.
```

Then preserve existing Case 01 and Case 03 pagination and the shared footer.

- [ ] **Step 4: Implement the Case 02 visual system**

Replace `case-02.css` with:

- `.case02-video-stage` is relative, `aspect-ratio: 16 / 9`, max-height limited by `var(--site-first-screen-max)`, and uses `overflow: hidden`.
- The video is `width: 100%`, `height: 100%`, `object-fit: cover`, and receives no scale animation.
- A single dark overlay uses flat `rgba(9, 10, 11, 0.48)` with no gradient.
- `.case02-video-copy` sits at bottom-left with `max-width: 760px`; only case number, title, vehicle, and year are visible.
- `.case02-video-status` is a compact disabled control with a neutral border and muted text; it must not resemble an enabled play button.
- `.case02-story` uses generous vertical spacing and no enclosing card.
- Story beats alternate `minmax(280px, 0.7fr) minmax(0, 1.3fr)` and the reverse.
- Story images have `aspect-ratio: 4 / 3`; the wide ending image uses `aspect-ratio: 16 / 7`.
- Borders remain neutral; blue is limited to beat numbers, a short rule, arrows, and focus-visible states.
- At `max-width: 1000px`, story beats stack in reading order.
- At `max-width: 767px`, video copy moves below the poster when overlay text would cover the vehicle; all story text and images use one column; adjacent-case links are at least 48px high.
- Under `prefers-reduced-motion: reduce`, disable reveal transitions.

- [ ] **Step 5: Implement non-broken poster-only behavior**

Replace `case-02.js` with:

```js
(() => {
  const stage = document.querySelector(".case02-video-stage");
  const video = document.querySelector("[data-case-video]");
  if (!stage || !video) return;

  const hasSource = Boolean(video.currentSrc || video.querySelector("source[src]"));
  stage.dataset.videoState = hasSource ? "ready" : "poster-only";

  if (!hasSource) {
    video.removeAttribute("controls");
    video.setAttribute("aria-disabled", "true");
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".case02-story-beat, .case02-story-wide").forEach((node) => {
    node.dataset.motion = reducedMotion ? "none" : "fade";
  });
})();
```

This controller never calls `play()`, never autoplays audio, and leaves the poster visible until a verified local video source is added.

- [ ] **Step 6: Regenerate and verify Case 02**

Run:

```bash
node scripts/render-detail-pages.mjs
node --check case-02.js
node --test case-02.test.mjs case-detail.test.mjs three-page-expansion.test.mjs responsive-layout.test.mjs
```

Expected: Case 02 uses the video story, the poster-only state is noninteractive and nonbroken, Case 01/03-06 remain on the generic detail template, and adjacent navigation still works.

- [ ] **Step 7: Commit**

```bash
git add scripts/render-detail-pages.mjs pages/cases/case-02.html case-02.css case-02.js case-02.test.mjs case-detail.test.mjs responsive-layout.test.mjs
git commit -m "Redesign Case 02 as a video story"
```

---

### Task 5: Complete Cross-Page Responsive, Accessibility, And Regression Verification

**Files:**
- Modify: `global-shell.test.mjs`
- Modify: `english-copy.test.mjs`
- Modify: `responsive-layout.test.mjs`
- Modify: `shared-cache.test.mjs`
- Modify: `design-qa.md`
- Modify: cache query strings in changed HTML and render scripts

**Interfaces:**
- Consumes: all routes and controllers completed in Tasks 1-4.
- Produces: one passing full test suite, syntax-checked JavaScript, regenerated HTML that matches its render sources, and visual QA notes for 1900px desktop, 1440px desktop, split-screen, and mobile.

- [ ] **Step 1: Add complete route and localization coverage**

Add the three routes to `global-shell.test.mjs` and `english-copy.test.mjs`:

```js
"./pages/project.html",
"./pages/shop/forged-wheel.html",
"./pages/cases/case-02.html",
```

Require every new page to have:

- five shared navigation links;
- one language toggle;
- English visible by default;
- matching `data-en` and `data-zh` for visible interface text;
- one shared footer;
- no `width: 100vw`;
- no whole-page `transform: scale()`.

- [ ] **Step 2: Add exact responsive contracts**

Extend `responsive-layout.test.mjs` with:

```js
test("new pages preserve the shared canvas and mobile stacking", () => {
  const projectCss = read("./project.css");
  const productCss = read("./shop-product.css");
  const case02Css = read("./case-02.css");

  assert.doesNotMatch(`${projectCss}${productCss}${case02Css}`, /width:\s*100vw|transform:\s*scale\(/);
  assert.match(projectCss, /@media \(max-width:\s*1100px\)[\s\S]*\.project-workspace\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(productCss, /@media \(max-width:\s*1100px\)[\s\S]*\.product-detail\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(case02Css, /@media \(max-width:\s*1000px\)[\s\S]*\.case02-story-beat\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(productCss, /padding-bottom:\s*calc\(148px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(projectCss, /bottom:\s*calc\(64px \+ env\(safe-area-inset-bottom\)\)/);
});
```

- [ ] **Step 3: Update cache keys and regenerate generated pages**

Use one cache version across changed files:

```text
three-page-expansion-20260726
```

Apply it to `project.css`, `project.js`, `shop-product.css`, `shop-product.js`, `case-02.css`, `case-02.js`, `contact-form.js`, and changed shared CSS/JS references. Then run:

```bash
node scripts/render-shop-page.mjs
node scripts/render-detail-pages.mjs
```

Expected: generated `pages/shop.html`, service details, case details, and their render sources agree.

- [ ] **Step 4: Run syntax checks and the full automated suite**

Run:

```bash
node --check script.js
node --check content-pages.js
node --check contact-form.js
node --check project.js
node --check shop.js
node --check shop-product.js
node --check case-02.js
node --test
```

Expected: all syntax checks and all repository tests pass with no skipped failures.

- [ ] **Step 5: Start the production-style local preview**

Run:

```bash
python3 -m http.server 4202
```

Open these routes in the user's current in-app browser:

```text
http://127.0.0.1:4202/pages/project.html
http://127.0.0.1:4202/pages/shop/forged-wheel.html
http://127.0.0.1:4202/pages/cases/case-02.html
http://127.0.0.1:4202/pages/contact.html
```

Expected: all local assets load and every route remains within the centered site canvas.

- [ ] **Step 6: Verify the complete customer flow at four viewport classes**

Check each page at:

```text
1900 × 1050
1440 × 900
1100 × 900
390 × 844
430 × 932
```

For Project:

- complete all four steps;
- move backward and confirm selections remain;
- open Contact and confirm vehicle, service, and message are prefilled;
- confirm the mobile action area does not cover the bottom fields or navigation.

For forged wheel:

- arrive from Shop with query parameters;
- confirm the wheel remains fully visible;
- confirm a valid BMW G8X combination enables Add to Build;
- confirm an Audi selection disables Add to Build and leaves Fitment Check available;
- confirm the mobile action bar does not cover specifications.

For Case 02:

- confirm the 16:9 poster appears without zoom animation;
- confirm the disabled film status is clear and no broken media icon appears;
- confirm story text does not cover important image content on mobile;
- confirm Case 01, Case 03, archive, and inquiry links work.

Across all pages:

- switch English to Chinese and back;
- tab through controls and confirm bright-blue focus indicators;
- check no horizontal overflow, clipped labels, covered text, or permanent blue card borders.

- [ ] **Step 7: Record visual QA evidence**

Append this table to `design-qa.md` and fill every result with `PASS` or a specific issue resolved before proceeding:

```markdown
## Three-Page Expansion — 2026-07-26

| Page | 1900×1050 | 1440×900 | 1100×900 | 390×844 | 430×932 |
| --- | --- | --- | --- | --- | --- |
| Project Planner | PASS | PASS | PASS | PASS | PASS |
| Forged Wheel | PASS | PASS | PASS | PASS | PASS |
| Case 02 Story | PASS | PASS | PASS | PASS | PASS |
| Contact Prefill | PASS | PASS | PASS | PASS | PASS |

- English-first fresh load: PASS
- Chinese/English toggle: PASS
- Keyboard focus: PASS
- Reduced motion: PASS
- Entry and back links: PASS
- Horizontal overflow: PASS
```

- [ ] **Step 8: Run final verification and commit**

Run:

```bash
git diff --check
node --test
git status --short
```

Expected: no whitespace errors, full suite passes, and only intended feature files plus the pre-existing untracked `audit/` directory appear.

Commit:

```bash
git add index.html pages project.css project.js project-planner.test.mjs shop.css shop.js shop-product.css shop-product.js shop-product.test.mjs case-02.css case-02.js contact-form.js content-pages.css scripts three-page-expansion.test.mjs contact-form.test.mjs shop.test.mjs case-02.test.mjs case-detail.test.mjs global-shell.test.mjs english-copy.test.mjs responsive-layout.test.mjs shared-cache.test.mjs design-qa.md
git commit -m "Complete three page customer journeys"
```

---

## Self-Review

- Spec coverage: shared routing and bilingual helpers are Task 1; planner and Contact prefill are Task 2; product configuration and fitment are Task 3; video story and poster fallback are Task 4; required viewport, accessibility, performance, route, and full-suite checks are Task 5.
- Scope boundaries: checkout, accounts, order management, live inventory, automatic quotes, CMS migration, and 3D remain excluded.
- Generated files: `pages/shop.html`, `pages/services/build.html`, and `pages/cases/case-02.html` are regenerated from their existing scripts before testing and delivery.
- Data consistency: planner direction keys match `serviceMap`; product handoff uses the planner query keys consumed by `readPlannerQuery`; Contact receives only the keys consumed by `readContactPrefill`.
- Asset truthfulness: every image comes from the existing LONMA asset folders; Case 02 remains poster-only until a verified video file exists.
- No-placeholder scan: the plan contains concrete routes, selectors, field limits, option values, validation rules, commands, and expected outcomes for every implementation step.
