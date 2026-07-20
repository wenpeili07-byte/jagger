# LONMA DYNAMIC Link Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give all six cases and all six services complete, bilingual, responsive detail-page routes without changing the confirmed homepage, cases rail, or services index design.

**Architecture:** Keep the deployed site static. Store approved case and service copy in one structured ES module, render committed HTML pages with one Node script, and reuse the existing language controller. Case pages use `case-detail.css`; service pages use a focused `service-detail.css`.

**Tech Stack:** Static HTML, CSS, browser JavaScript, Node.js ES modules, `node:test`, Vercel static hosting.

## Global Constraints

- The shared site canvas remains capped at `1900px`.
- The cases masked vertical image rail remains a background-selection control and does not become navigation.
- Case pages contain no video, blue module-label rail, image captions, dense specification tables, heavy card borders, or dark bars attached to images.
- Service pages use only the approved service descriptions and existing imagery; no prices, guarantees, brands, or technical claims are invented.
- Chinese is the default language and the existing `lonma-language` local-storage key persists selection.
- Blue is limited to small interactive, active, arrow, and focus-visible states.
- No page uses `width: 100vw` or whole-page `transform: scale()`.
- Generated HTML files are committed so Vercel needs no build command.

---

## File Structure

- Create `detail-pages-data.mjs`: owns the complete bilingual case and service content records.
- Create `scripts/render-detail-pages.mjs`: renders deterministic static HTML from those records.
- Create `link-closure.test.mjs`: verifies route coverage, generated content, language attributes, assets, and non-empty detail pages.
- Create `service-detail.css`: owns service-detail layout and breakpoints.
- Modify `case-detail.css`: simplifies the shared case-detail layout.
- Modify `content-pages.js`: marks nested Case and Services navigation correctly.
- Modify `pages/cases.html`: replaces Case 02-06 `#` links with real routes.
- Modify `pages/cases/case-01.html`: generated minimal Case 01 baseline.
- Create `pages/cases/case-02.html` through `case-06.html`: generated case pages.
- Modify the six files under `pages/services/`: generated service pages.
- Modify `content-pages.test.mjs`: verifies nested navigation support.
- Modify `responsive-layout.test.mjs`: includes all generated public pages in canvas checks.

---

### Task 1: Lock Route And Content Contracts

**Files:**
- Create: `link-closure.test.mjs`
- Modify: `pages/cases.html`

**Interfaces:**
- Consumes: Existing archive card markup and existing routes under `pages/cases/` and `pages/services/`.
- Produces: A failing contract for six case routes, six service routes, bilingual attributes, and required navigation.

- [ ] **Step 1: Write the failing route test**

Create `link-closure.test.mjs`:

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const casesHtml = read("./pages/cases.html");
const caseIds = ["01", "02", "03", "04", "05", "06"];
const serviceIds = ["build", "parts", "photo", "ecu", "chassis", "exhaust"];

for (const id of caseIds) {
  const route = `./pages/cases/case-${id}.html`;
  assert.ok(existsSync(new URL(route, import.meta.url)), `${route} should exist`);
  const html = read(route);
  assert.match(html, /<main[^>]*data-detail-page/, `${route} should contain real detail content`);
  assert.match(html, /data-section="cases"/, `${route} should mark the Cases navigation section`);
  assert.match(html, /data-zh="[^"]+"[^>]*data-en="[^"]+"/, `${route} should contain bilingual content`);
  assert.match(html, /class="detail-contact"/, `${route} should contain a contact action`);
  assert.match(html, /class="detail-pagination"/, `${route} should contain previous and next links`);
}

for (const id of serviceIds) {
  const route = `./pages/services/${id}.html`;
  assert.ok(existsSync(new URL(route, import.meta.url)), `${route} should exist`);
  const html = read(route);
  assert.match(html, /<main[^>]*data-detail-page/, `${route} should contain real detail content`);
  assert.match(html, /data-section="services"/, `${route} should mark the Services navigation section`);
  assert.match(html, /data-zh="[^"]+"[^>]*data-en="[^"]+"/, `${route} should contain bilingual content`);
  assert.match(html, /class="detail-contact"/, `${route} should contain a contact action`);
}

const archiveRoutes = [...casesHtml.matchAll(/class="archive-card" href="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(
  archiveRoutes,
  caseIds.map((id) => `./cases/case-${id}.html`),
  "all six archive cards should link to their matching detail pages"
);
assert.doesNotMatch(casesHtml, /class="archive-card" href="#"/, "case archive should not retain dead links");
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test link-closure.test.mjs
```

Expected: FAIL because Case 02-06 do not exist and the archive still contains `href="#"`.

- [ ] **Step 3: Replace the five dead archive routes**

In `pages/cases.html`, use:

```html
<a class="archive-card" href="./cases/case-02.html" data-brand="bmw" data-index="1">
<a class="archive-card" href="./cases/case-03.html" data-brand="benz" data-index="2">
<a class="archive-card" href="./cases/case-04.html" data-brand="bmw" data-index="3">
<a class="archive-card" href="./cases/case-05.html" data-brand="audi" data-index="4">
<a class="archive-card" href="./cases/case-06.html" data-brand="bmw" data-index="5">
```

Do not change the six `.mwg_effect060` buttons.

- [ ] **Step 4: Run the test and verify that only missing detail-page assertions remain**

Run the Task 1 command again.

Expected: FAIL for missing Case 02-06 and empty service pages; no archive-link assertion failure.

- [ ] **Step 5: Commit the route contract**

```bash
git add link-closure.test.mjs pages/cases.html
git commit -m "Test case and service link closure"
```

---

### Task 2: Add Structured Detail Content And Renderer

**Files:**
- Create: `detail-pages-data.mjs`
- Create: `scripts/render-detail-pages.mjs`
- Modify: `link-closure.test.mjs`

**Interfaces:**
- Consumes: Existing `case-01.jpg` through `case-06.jpg`, approved service descriptions, and fixed public routes.
- Produces: `caseDetails`, `serviceDetails`, `renderCasePage(record)`, and `renderServicePage(record)` used to generate committed HTML.

- [ ] **Step 1: Extend the test with data-shape assertions**

Append to `link-closure.test.mjs`:

```js
const { caseDetails, serviceDetails } = await import("./detail-pages-data.mjs");

assert.equal(caseDetails.length, 6, "case data should contain six records");
assert.equal(serviceDetails.length, 6, "service data should contain six records");

for (const record of [...caseDetails, ...serviceDetails]) {
  assert.match(record.id, /^(?:0[1-6]|build|parts|photo|ecu|chassis|exhaust)$/);
  assert.ok(record.title.zh && record.title.en, `${record.id} should have bilingual titles`);
  assert.ok(record.intro.zh && record.intro.en, `${record.id} should have bilingual introductions`);
  assert.match(record.image, /^assets\/images\/网页\/optimized\/case-0[1-6]\.jpg$/);
}

for (const record of caseDetails) {
  assert.match(record.previous, /^0[1-6]$/);
  assert.match(record.next, /^0[1-6]$/);
}
```

- [ ] **Step 2: Run the test and verify the expected module failure**

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `detail-pages-data.mjs`.

- [ ] **Step 3: Create the complete data module**

Create `detail-pages-data.mjs` with this exported shape:

```js
export const caseDetails = [
  {
    id: "01",
    slug: "street-widebody",
    title: { zh: "街道宽体", en: "STREET WIDEBODY" },
    subtitle: { zh: "车队视觉基准案例", en: "A VISUAL BENCHMARK FOR THE LONMA LINEUP" },
    intro: {
      zh: "从车身比例、轮毂姿态到底盘高度，记录一台街道项目车的完整视觉方向。",
      en: "A complete street-car direction shaped through body proportion, wheel fitment, and ride height.",
    },
    story: {
      zh: "这台车的调整从整体轮廓开始。每一次修改都经过观察、试装与道路使用，再保留真正适合车辆的部分。",
      en: "The work begins with the whole silhouette. Each change is observed, test-fitted, and road-checked before it stays.",
    },
    image: "assets/images/网页/optimized/case-01.jpg",
    previous: "06",
    next: "02",
  },
  {
    id: "02",
    slug: "track-setup",
    title: { zh: "赛道化升级", en: "TRACK SETUP" },
    subtitle: { zh: "街道与赛道之间的平衡", en: "BALANCE BETWEEN ROAD AND TRACK" },
    intro: {
      zh: "围绕制动、底盘反馈与持续驾驶需求，整理更明确的性能升级方向。",
      en: "A clearer performance direction built around braking, chassis feedback, and repeatable driving.",
    },
    story: {
      zh: "设定并不追求一组固定答案。车辆反馈、轮胎状态和实际道路会不断改变下一步调整。",
      en: "The setup is not a fixed answer. Vehicle feedback, tire condition, and real roads continue to shape the next adjustment.",
    },
    image: "assets/images/网页/optimized/case-02.jpg",
    previous: "01",
    next: "03",
  },
  {
    id: "03",
    slug: "low-stance",
    title: { zh: "姿态低趴", en: "LOW STANCE" },
    subtitle: { zh: "比例、车高与轮毂关系", en: "PROPORTION, HEIGHT, AND WHEEL FITMENT" },
    intro: {
      zh: "通过车高、轮毂数据与车身间隙，建立低而完整的侧面比例。",
      en: "A low, complete side profile shaped through ride height, wheel data, and body clearance.",
    },
    story: {
      zh: "低姿态仍然需要真实使用。每一次降低和数据变化，都要重新检查转向、通过性与视觉平衡。",
      en: "A low stance still has to work. Every height and fitment change is checked again for steering, clearance, and visual balance.",
    },
    image: "assets/images/网页/optimized/case-03.jpg",
    previous: "02",
    next: "04",
  },
  {
    id: "04",
    slug: "turbo-tune",
    title: { zh: "涡轮特调", en: "TURBO TUNE" },
    subtitle: { zh: "动力响应与道路优化", en: "POWER RESPONSE AND ROAD REFINEMENT" },
    intro: {
      zh: "结合车辆状态、数据记录与道路反馈，规划阶段性的动力响应升级。",
      en: "Staged power-response refinement informed by vehicle condition, data logs, and road feedback.",
    },
    story: {
      zh: "程序不是一次写入后的结束。记录、复查与道路反馈共同决定下一次修正。",
      en: "Calibration does not end after one flash. Logging, review, and road feedback determine every revision.",
    },
    image: "assets/images/网页/optimized/case-04.jpg",
    previous: "03",
    next: "05",
  },
  {
    id: "05",
    slug: "photo-feature",
    title: { zh: "影像作品车", en: "PHOTO FEATURE" },
    subtitle: { zh: "车辆状态转化为视觉内容", en: "TURNING VEHICLE CHARACTER INTO VISUAL CONTENT" },
    intro: {
      zh: "以静态、Rolling Shot 与短视频记录车辆完成后的姿态和细节。",
      en: "Still photography, rolling shots, and short films capture the completed stance and details.",
    },
    story: {
      zh: "影像不是改装结束后的附加项。拍摄角度、场地和运动方式会重新解释车辆的比例与性格。",
      en: "Media is not an afterthought. Angle, location, and motion reinterpret the vehicle's proportion and character.",
    },
    image: "assets/images/网页/optimized/case-05.jpg",
    previous: "04",
    next: "06",
  },
  {
    id: "06",
    slug: "blue-performance",
    title: { zh: "蓝色性能车", en: "BLUE PERFORMANCE" },
    subtitle: { zh: "统一性能与视觉方向", en: "ONE PERFORMANCE AND VISUAL DIRECTION" },
    intro: {
      zh: "让外观、底盘与动力响应围绕同一驾驶目标协同调整。",
      en: "Exterior, chassis, and power response are tuned around one driving objective.",
    },
    story: {
      zh: "完整项目不是零件数量的叠加。先确定目标，再通过多次测试保留真正改善车辆的变化。",
      en: "A complete build is not a parts count. The goal comes first, followed by repeated testing to keep only meaningful changes.",
    },
    image: "assets/images/网页/optimized/case-06.jpg",
    previous: "05",
    next: "01",
  },
];

export const serviceDetails = [
  {
    id: "build",
    number: "01",
    label: "BUILD",
    title: { zh: "汽车改装", en: "VEHICLE BUILD" },
    intro: {
      zh: "外观、轮毂、避震、刹车与整车风格升级方案。",
      en: "Exterior, wheels, suspension, brakes, and a coherent complete-car direction.",
    },
    scope: {
      zh: "从目标沟通和视觉参考开始，结合车辆状态完成选型、试装、调整与最终复查。",
      en: "We begin with goals and visual references, then select, test-fit, adjust, and review around the actual vehicle.",
    },
    image: "assets/images/网页/optimized/case-01.jpg",
  },
  {
    id: "parts",
    number: "02",
    label: "PARTS",
    title: { zh: "汽车配件", en: "PERFORMANCE PARTS" },
    intro: {
      zh: "性能件、外观件、轮毂、避震与品牌配件选型供应。",
      en: "Selection and supply of performance, exterior, wheel, suspension, and branded parts.",
    },
    scope: {
      zh: "根据车型、目标和现有配置筛选合适部件，并在安装前确认兼容性与整体方向。",
      en: "Parts are selected around the vehicle, goal, and current setup, with compatibility and direction checked before installation.",
    },
    image: "assets/images/网页/optimized/case-02.jpg",
  },
  {
    id: "photo",
    number: "03",
    label: "PHOTO",
    title: { zh: "汽车摄影", en: "AUTOMOTIVE MEDIA" },
    intro: {
      zh: "静态拍摄、Rolling Shot、短视频与社交媒体内容制作。",
      en: "Still photography, rolling shots, short films, and social content production.",
    },
    scope: {
      zh: "从场景、时间与车辆状态出发，规划静态、动态和短视频内容的统一视觉。",
      en: "Location, timing, and vehicle condition shape one visual direction across stills, motion, and short-form content.",
    },
    image: "assets/images/网页/optimized/case-03.jpg",
  },
  {
    id: "ecu",
    number: "04",
    label: "ECU",
    title: { zh: "ECU 特调", en: "ECU CALIBRATION" },
    intro: {
      zh: "动力程序、数据记录、道路优化与 Stage 方案规划。",
      en: "Power calibration, data logging, road refinement, and staged upgrade planning.",
    },
    scope: {
      zh: "先确认车辆状态和升级目标，再通过数据与道路反馈逐步修正动力响应。",
      en: "Vehicle condition and goals come first, followed by data-led and road-led refinement of power response.",
    },
    image: "assets/images/网页/optimized/case-04.jpg",
  },
  {
    id: "chassis",
    number: "05",
    label: "CHASSIS",
    title: { zh: "底盘设定", en: "CHASSIS SETUP" },
    intro: {
      zh: "车高、轮毂数据、定位与街道 / 赛道驾驶设定。",
      en: "Ride height, wheel fitment, alignment, and road- or track-focused setup.",
    },
    scope: {
      zh: "通过实际车辆反馈调整车高、间隙和定位，让视觉比例与驾驶目标保持一致。",
      en: "Ride height, clearance, and alignment are adjusted from real vehicle feedback so stance and driving goals stay aligned.",
    },
    image: "assets/images/网页/optimized/case-05.jpg",
  },
  {
    id: "exhaust",
    number: "06",
    label: "EXHAUST",
    title: { zh: "进排气", en: "INTAKE / EXHAUST" },
    intro: {
      zh: "进气、头段、中尾段、声浪与动力响应升级。",
      en: "Intake, downpipe, center and rear sections, sound, and power-response upgrades.",
    },
    scope: {
      zh: "围绕声音目标、道路使用和现有动力配置，选择并复查适合车辆的组合。",
      en: "The combination is selected and reviewed around sound goals, road use, and the vehicle's current power setup.",
    },
    image: "assets/images/网页/optimized/case-06.jpg",
  },
];
```

- [ ] **Step 4: Create the deterministic renderer**

Create `scripts/render-detail-pages.mjs` with:

```js
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { caseDetails, serviceDetails } from "../detail-pages-data.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const escapeAttribute = (value) =>
  String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const i18n = (tag, values, attributes = "") =>
  `<${tag}${attributes} data-zh="${escapeAttribute(values.zh)}" data-en="${escapeAttribute(values.en)}">${values.zh}</${tag}>`;

const header = (section) => `
  <header class="topbar">
    <a class="brand" href="../../index.html" aria-label="回到首页">LONMA DYNAMIC</a>
    <nav class="nav" aria-label="主导航">
      <a href="../about.html">关于</a>
      <a href="../services.html"${section === "services" ? ' aria-current="page"' : ""}>业务</a>
      <a href="../cases.html"${section === "cases" ? ' aria-current="page"' : ""}>案例</a>
      <a href="../contact.html">联系</a>
    </nav>
    <div class="top-actions">
      <button class="lang-toggle" type="button" aria-label="Switch to English">
        <span class="lang-option is-current" data-lang-option="zh">中</span>
        <span class="lang-separator" aria-hidden="true">/</span>
        <span class="lang-option" data-lang-option="en">EN</span>
      </button>
    </div>
  </header>`;

export const renderCasePage = (record) => `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Case ${record.id} | LONMA DYNAMIC</title>
    <link rel="stylesheet" href="../../styles.css?v=page-header-20260705" />
    <link rel="stylesheet" href="../../layout-canvas.css?v=canvas-20260719-1900" />
    <link rel="stylesheet" href="../../case-detail.css?v=case-detail-link-closure-20260719" />
  </head>
  <body data-section="cases">
    <main class="site-shell case-detail-page" data-detail-page>
      ${header("cases")}
      <section class="detail-hero">
        <div class="detail-copy">
          ${i18n("a", { zh: "← 返回案例", en: "← BACK TO CASES" }, ' class="detail-back" href="../cases.html"')}
          <p class="detail-index">CASE ${record.id}</p>
          ${i18n("h1", record.title)}
          ${i18n("h2", record.subtitle)}
          ${i18n("p", record.intro, ' class="detail-intro"')}
        </div>
        <figure class="detail-hero-media">
          <img src="../../${record.image}" alt="LONMA DYNAMIC ${record.title.zh}" />
        </figure>
      </section>
      <section class="detail-story">
        ${i18n("p", record.story)}
      </section>
      <section class="detail-contact">
        ${i18n("h2", { zh: "讨论你的下一台车", en: "DISCUSS YOUR NEXT BUILD" })}
        ${i18n("a", { zh: "开始咨询 →", en: "START AN INQUIRY →" }, ' href="../contact.html"')}
      </section>
      <nav class="detail-pagination" aria-label="Case pagination">
        <a href="./case-${record.previous}.html">← CASE ${record.previous}</a>
        <a href="./case-${record.next}.html">CASE ${record.next} →</a>
      </nav>
    </main>
    <script src="../../content-pages.js?v=detail-language-20260719"></script>
  </body>
</html>
`;

export const renderServicePage = (record) => `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${record.label} | LONMA DYNAMIC</title>
    <link rel="stylesheet" href="../../styles.css?v=page-header-20260705" />
    <link rel="stylesheet" href="../../layout-canvas.css?v=canvas-20260719-1900" />
    <link rel="stylesheet" href="../../service-detail.css?v=service-detail-20260719" />
  </head>
  <body data-section="services">
    <main class="site-shell service-detail-page" data-detail-page>
      ${header("services")}
      <section class="detail-hero">
        <div class="detail-copy">
          ${i18n("a", { zh: "← 返回业务", en: "← BACK TO SERVICES" }, ' class="detail-back" href="../services.html"')}
          <p class="detail-index">${record.number} · ${record.label}</p>
          ${i18n("h1", record.title)}
          ${i18n("p", record.intro, ' class="detail-intro"')}
        </div>
        <figure class="detail-hero-media">
          <img src="../../${record.image}" alt="LONMA DYNAMIC ${record.title.zh}" />
        </figure>
      </section>
      <section class="detail-story">
        ${i18n("p", record.scope)}
        ${i18n("p", { zh: "沟通目标 · 规划方案 · 执行调整 · 完成复查", en: "DISCUSS · PLAN · EXECUTE · REVIEW" }, ' class="detail-process"')}
      </section>
      <section class="detail-contact">
        ${i18n("h2", { zh: "开始你的项目", en: "START YOUR PROJECT" })}
        ${i18n("a", { zh: "提交车辆信息 →", en: "SEND VEHICLE DETAILS →" }, ' href="../contact.html"')}
      </section>
    </main>
    <script src="../../content-pages.js?v=detail-language-20260719"></script>
  </body>
</html>
`;

await mkdir(resolve(root, "pages/cases"), { recursive: true });
await mkdir(resolve(root, "pages/services"), { recursive: true });

for (const record of caseDetails) {
  await writeFile(resolve(root, `pages/cases/case-${record.id}.html`), renderCasePage(record));
}

for (const record of serviceDetails) {
  await writeFile(resolve(root, `pages/services/${record.id}.html`), renderServicePage(record));
}
```

- [ ] **Step 5: Run the renderer and data test**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node scripts/render-detail-pages.mjs
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test link-closure.test.mjs
```

Expected: Data assertions pass; style-specific assertions may still fail until Tasks 3 and 4.

- [ ] **Step 6: Commit the data and generated routes**

```bash
git add detail-pages-data.mjs scripts/render-detail-pages.mjs pages/cases/case-*.html pages/services/*.html link-closure.test.mjs
git commit -m "Generate case and service detail routes"
```

---

### Task 3: Simplify The Shared Case Detail Layout

**Files:**
- Modify: `case-detail.css`
- Modify: `case-detail.test.mjs`
- Regenerate: `pages/cases/case-01.html` through `case-06.html`

**Interfaces:**
- Consumes: The `.detail-*` markup rendered in Task 2.
- Produces: A photography-led case layout with stable desktop, split-screen, and mobile dimensions.

- [ ] **Step 1: Replace legacy test expectations**

Update `case-detail.test.mjs` to assert:

```js
for (const id of ["01", "02", "03", "04", "05", "06"]) {
  const html = read(`./pages/cases/case-${id}.html`);
  assert.match(html, /class="detail-hero"/);
  assert.match(html, /class="detail-story"/);
  assert.match(html, /class="detail-contact"/);
  assert.doesNotMatch(html, /<figcaption|case-spec-grid|case-section-kicker|case-detail-meta/);
}

assert.match(css, /\.detail-hero\s*\{[^}]*grid-template-columns:/s);
assert.match(css, /\.detail-hero-media img\s*\{[^}]*object-fit:\s*cover/s);
assert.match(css, /@media \(max-width:\s*899px\)[\s\S]*?\.detail-hero\s*\{[^}]*grid-template-columns:\s*1fr/s);
assert.doesNotMatch(css, /\.detail-hero-media\s*\{[^}]*border:/s);
assert.doesNotMatch(css, /\.detail-story\s*\{[^}]*border:/s);
assert.doesNotMatch(css, /figcaption|case-spec-grid|case-detail-meta/);
```

- [ ] **Step 2: Run the case-detail test and verify failure against legacy CSS**

Expected: FAIL because legacy metadata, caption, and card-grid selectors remain.

- [ ] **Step 3: Replace `case-detail.css` with focused editorial rules**

Implement these required blocks:

```css
.case-detail-page {
  background: #111315;
}

.case-detail-page::before,
.case-detail-page::after {
  display: none;
}

.detail-hero {
  display: grid;
  grid-template-columns: minmax(320px, 0.72fr) minmax(0, 1.28fr);
  min-height: min(calc(100vh - var(--site-header-height)), var(--site-first-screen-max));
}

.detail-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: clamp(48px, 7vw, 118px) var(--site-gutter);
}

.detail-back,
.detail-index {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 12px;
  text-decoration: none;
}

.detail-copy h1 {
  max-width: 8em;
  margin: 44px 0 16px;
  color: var(--ink);
  font-family: Impact, "Arial Narrow", Arial, sans-serif;
  font-size: clamp(64px, 7vw, 128px);
  line-height: 0.9;
}

.detail-copy h2 {
  margin: 0;
  color: var(--ink);
  font-size: clamp(24px, 2vw, 36px);
}

.detail-intro {
  max-width: 34em;
  margin: 24px 0 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.8;
}

.detail-hero-media {
  min-width: 0;
  min-height: 560px;
  margin: 0;
  overflow: hidden;
}

.detail-hero-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.94) contrast(1.06) brightness(0.82);
}

.detail-story,
.detail-contact,
.detail-pagination {
  max-width: 1440px;
  margin: 0 auto;
  padding: clamp(68px, 8vw, 128px) var(--site-gutter);
}

.detail-story p {
  max-width: 46em;
  margin: 0 auto;
  color: var(--ink);
  font-size: clamp(19px, 2vw, 30px);
  line-height: 1.65;
}

.detail-contact {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 32px;
}

.detail-contact h2 {
  margin: 0;
  font-size: clamp(34px, 4vw, 68px);
}

.detail-contact a,
.detail-pagination a {
  color: var(--ink);
  font-family: var(--mono);
  font-size: 12px;
  text-decoration: none;
}

.detail-contact a:hover,
.detail-contact a:focus-visible,
.detail-pagination a:hover,
.detail-pagination a:focus-visible,
.detail-back:hover,
.detail-back:focus-visible {
  color: var(--accent-bright);
  outline: 2px solid var(--accent-bright);
  outline-offset: 5px;
}

.detail-pagination {
  display: flex;
  justify-content: space-between;
  padding-block: 42px;
  border-top: 1px solid var(--line);
}

@media (max-width: 899px) {
  .detail-hero {
    grid-template-columns: 1fr;
  }

  .detail-copy {
    min-height: 520px;
  }

  .detail-hero-media {
    min-height: 0;
    aspect-ratio: 4 / 3;
  }
}

@media (max-width: 620px) {
  .detail-copy {
    min-height: 470px;
    padding-inline: 20px;
  }

  .detail-copy h1 {
    font-size: 64px;
  }

  .detail-story,
  .detail-contact,
  .detail-pagination {
    padding-inline: 20px;
  }

  .detail-contact {
    align-items: flex-start;
    flex-direction: column;
  }
}
```

- [ ] **Step 4: Regenerate pages and run case tests**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node scripts/render-detail-pages.mjs
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test case-detail.test.mjs link-closure.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit the case detail layout**

```bash
git add case-detail.css case-detail.test.mjs pages/cases/case-*.html
git commit -m "Build minimal case detail pages"
```

---

### Task 4: Build The Six Service Detail Pages

**Files:**
- Create: `service-detail.css`
- Modify: `link-closure.test.mjs`
- Regenerate: `pages/services/build.html`
- Regenerate: `pages/services/parts.html`
- Regenerate: `pages/services/photo.html`
- Regenerate: `pages/services/ecu.html`
- Regenerate: `pages/services/chassis.html`
- Regenerate: `pages/services/exhaust.html`

**Interfaces:**
- Consumes: `.detail-*` service markup and `serviceDetails` from Task 2.
- Produces: Six useful service landing pages with the same interface and no empty body.

- [ ] **Step 1: Add service-style assertions**

Append to `link-closure.test.mjs`:

```js
const serviceCss = read("./service-detail.css");
assert.match(serviceCss, /\.service-detail-page\s*\{/);
assert.match(serviceCss, /\.detail-hero\s*\{[^}]*grid-template-columns:/s);
assert.match(serviceCss, /\.detail-process\s*\{/);
assert.match(serviceCss, /@media \(max-width:\s*899px\)[\s\S]*?\.detail-hero\s*\{[^}]*grid-template-columns:\s*1fr/s);
assert.doesNotMatch(serviceCss, /width:\s*100vw|transform:\s*scale\(/);
assert.doesNotMatch(serviceCss, /\.detail-(?:hero|story|contact)\s*\{[^}]*border:\s*[^0]/s);
```

- [ ] **Step 2: Run the test and verify missing stylesheet failure**

Expected: FAIL because `service-detail.css` does not exist.

- [ ] **Step 3: Create `service-detail.css`**

Create the complete file:

```css
.service-detail-page {
  background: #111315;
}

.service-detail-page::before,
.service-detail-page::after {
  display: none;
}

.detail-hero {
  display: grid;
  grid-template-columns: minmax(360px, 0.82fr) minmax(0, 1.18fr);
  min-height: min(calc(100vh - var(--site-header-height)), var(--site-first-screen-max));
}

.detail-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: clamp(48px, 7vw, 118px) var(--site-gutter);
}

.detail-back,
.detail-index {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 12px;
  text-decoration: none;
}

.detail-index {
  margin: 44px 0 0;
  color: var(--accent-bright);
}

.detail-copy h1 {
  max-width: 8em;
  margin: 18px 0 20px;
  color: var(--ink);
  font-family: Impact, "Arial Narrow", Arial, sans-serif;
  font-size: clamp(64px, 7vw, 128px);
  line-height: 0.9;
}

.detail-intro {
  max-width: 34em;
  margin: 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.8;
}

.detail-hero-media {
  min-width: 0;
  min-height: 560px;
  margin: 0;
  overflow: hidden;
}

.detail-hero-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.94) contrast(1.06) brightness(0.82);
}

.detail-story,
.detail-contact {
  max-width: 1440px;
  margin: 0 auto;
  padding: clamp(68px, 8vw, 128px) var(--site-gutter);
}

.detail-story p:first-child {
  max-width: 46em;
  margin: 0;
  color: var(--ink);
  font-size: clamp(19px, 2vw, 30px);
  line-height: 1.65;
}

.detail-process {
  margin-top: 48px !important;
  color: var(--muted) !important;
  font-family: var(--mono);
  font-size: 12px !important;
  letter-spacing: 0.08em;
}

.detail-contact {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 32px;
  border-top: 1px solid var(--line);
}

.detail-contact h2 {
  margin: 0;
  color: var(--ink);
  font-size: clamp(34px, 4vw, 68px);
}

.detail-contact a {
  color: var(--ink);
  font-family: var(--mono);
  font-size: 12px;
  text-decoration: none;
}

.detail-contact a:hover,
.detail-contact a:focus-visible,
.detail-back:hover,
.detail-back:focus-visible {
  color: var(--accent-bright);
  outline: 2px solid var(--accent-bright);
  outline-offset: 5px;
}

@media (max-width: 899px) {
  .detail-hero {
    grid-template-columns: 1fr;
  }

  .detail-copy {
    min-height: 520px;
  }

  .detail-hero-media {
    min-height: 0;
    aspect-ratio: 4 / 3;
  }
}

@media (max-width: 620px) {
  .detail-copy {
    min-height: 470px;
    padding-inline: 20px;
  }

  .detail-copy h1 {
    font-size: 64px;
  }

  .detail-story,
  .detail-contact {
    padding-inline: 20px;
  }

  .detail-contact {
    align-items: flex-start;
    flex-direction: column;
  }
}
```

- [ ] **Step 4: Regenerate and run service tests**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node scripts/render-detail-pages.mjs
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test link-closure.test.mjs content-pages.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit the service pages**

```bash
git add service-detail.css link-closure.test.mjs pages/services/*.html
git commit -m "Build six service detail pages"
```

---

### Task 5: Complete Nested Navigation, Language, And Responsive Coverage

**Files:**
- Modify: `content-pages.js`
- Modify: `content-pages.test.mjs`
- Modify: `header-layout.test.mjs`
- Modify: `responsive-layout.test.mjs`
- Modify: `link-closure.test.mjs`

**Interfaces:**
- Consumes: `body[data-section]`, existing `[data-zh][data-en]`, and existing `data-lang-option`.
- Produces: Correct Cases/Services active navigation on nested pages and complete regression coverage.

- [ ] **Step 1: Add failing nested-navigation assertions**

Append to `content-pages.test.mjs`:

```js
assert.match(
  script,
  /const currentSection = document\.body\.dataset\.section/,
  "detail pages should expose their parent navigation section"
);
assert.match(
  script,
  /currentSection === pageSection/,
  "nested detail routes should mark their parent navigation item active"
);
```

Extend `responsive-layout.test.mjs`:

```js
for (const id of ["02", "03", "04", "05", "06"]) {
  publicPages.push(`./pages/cases/case-${id}.html`);
}
```

The existing six service detail routes remain in `publicPages`.

Update `header-layout.test.mjs` for generated case and service detail pages:

- Continue to assert their parent-level relative header links.
- Assert the renderer's Chinese default header labels rather than static English labels.
- Keep English navigation-label behavior under the `content-pages.test.mjs` language-controller contract, where Task 5 updates `content-pages.js`.

- [ ] **Step 2: Run tests and verify nested-navigation failure**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test content-pages.test.mjs header-layout.test.mjs responsive-layout.test.mjs link-closure.test.mjs
```

Expected: FAIL because `content-pages.js` does not read `body.dataset.section`.

- [ ] **Step 3: Update nested navigation logic**

In `content-pages.js`, update `updateNavigation`:

```js
function updateNavigation(language) {
  const currentSection = document.body.dataset.section;

  navLinks.forEach((link) => {
    const pageName = link.getAttribute("href").split("/").pop();
    const pageSection = pageName.replace(/\.html$/, "");
    const labels = navLabels[pageName];

    if (labels) {
      link.textContent = labels[language];
    }

    if (currentSection === pageSection || window.location.pathname.endsWith(pageName)) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}
```

- [ ] **Step 4: Run the complete automated suite**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node scripts/render-detail-pages.mjs
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test *.test.mjs
git diff --check
```

Expected: all tests PASS and `git diff --check` returns no output.

- [ ] **Step 5: Browser verification**

Start:

```bash
python3 -m http.server 4198 --bind 127.0.0.1
```

Verify in the in-app browser:

1. `http://127.0.0.1:4198/pages/cases.html`
2. Case 02 opens and returns to the archive.
3. Case 06 wraps to Case 01.
4. `http://127.0.0.1:4198/pages/services.html`
5. Build opens and returns to Services.
6. Chinese/English switching changes all visible copy and `html lang`.
7. Viewports `1900 x 1050`, `790 x 900`, and `390 x 844` have no horizontal overflow.
8. The browser console has no errors and all image requests return successfully.

- [ ] **Step 6: Commit language and responsive completion**

```bash
git add content-pages.js content-pages.test.mjs header-layout.test.mjs responsive-layout.test.mjs link-closure.test.mjs
git commit -m "Complete detail navigation and language behavior"
```

- [ ] **Step 7: Final branch verification**

Run:

```bash
git status -sb
git log --oneline --decorate -6
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test *.test.mjs
```

Expected:

- Worktree has no uncommitted source changes.
- The branch contains the design, route, generated-page, case-layout,
  service-layout, and language commits.
- All tests pass.
