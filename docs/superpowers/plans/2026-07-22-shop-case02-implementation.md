# LONMA DYNAMIC Shop And Case 02 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved model-first Shop catalog and the approved photo-led Case 02 parts layout without redesigning the other confirmed public pages.

**Architecture:** Keep the existing static-site deployment and generation pipeline. A small shop data module feeds a build-time HTML renderer so products remain visible without JavaScript; `shop.js` adds filtering and the accessible detail dialog, while a Case 02-only renderer branch and controller add the parts rail without changing Case 01/03-06.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node.js ES modules, Node test runner, local raster/WebP assets, Vercel static hosting.

## Global Constraints

- Preserve the current English-first bilingual behavior and `sessionStorage` language key.
- Preserve the existing centered `--site-max-width: 2200px` canvas.
- Use `#111315`, `#171A1D`, `#E8E7E2`, `#8D9195`, neutral default borders, `#1C5D99`, and `#2E7DBD` exactly as specified.
- Keep blue limited to active navigation, selected filters, markers, arrows, short rules, and focus-visible indicators.
- Do not ship real prices, brands, part numbers, stock quantities, or guaranteed fitment.
- Use `INQUIRE` / `请咨询`; do not use `IN STOCK`.
- Preserve the current homepage, About, Services, Cases archive, Contact, and Case 01/03-06 layouts.
- Do not add Shopify, Sanity, payment, cart, account, search, or product-detail routes in this release.
- Do not use `100vw`, whole-page `transform: scale()`, decorative gradients, or permanent blue card borders.
- Use the existing Case 02 photograph unchanged as the Case 02 hero source.
- New core controls must work with mouse, keyboard, and touch and honor reduced motion.

---

## File Structure

### Create

- `shop-data.mjs`: canonical bilingual sample catalog and selector data.
- `scripts/render-shop-page.mjs`: safe build-time Shop HTML renderer.
- `pages/shop.html`: generated, no-JavaScript-readable Shop page.
- `shop.css`: Shop-only layout, state, dialog, and responsive styles.
- `shop.js`: client-side selector, filter, sort, query-string, and dialog behavior.
- `shop.test.mjs`: Shop renderer, truthfulness, accessibility, and behavior contract.
- `case-02.css`: Case 02-only visual layout and responsive behavior.
- `case-02.js`: marker/parts-rail synchronization.
- `case-02.test.mjs`: Case 02 generation and interaction contract.
- `assets/images/shop/*.webp`: six consistent square product images.
- `design-qa.md`: final visual comparison report.

### Modify

- `index.html`: add the root-relative Shop navigation item.
- `pages/about.html`, `pages/services.html`, `pages/cases.html`, `pages/contact.html`: add the page-relative Shop navigation item.
- `script.js`: add homepage `nav.shop` translations.
- `content-pages.js`: add Shop navigation translation and query-aware active state.
- `styles.css`: fit five header items at desktop, split-screen, and mobile widths.
- `scripts/render-detail-pages.mjs`: add Shop to generated detail headers and dispatch Case 02 to its special template.
- `detail-pages-data.mjs`: add the four category-level Case 02 parts references.
- `global-shell.test.mjs`: include Shop and require five navigation links.
- `english-copy.test.mjs`: include Shop in public-page and translation coverage.
- `header-layout.test.mjs`: require a five-column mobile navigation grid.
- `responsive-layout.test.mjs`: include Shop and Case 02 overflow guards.

---

### Task 1: Add The Shared Shop Route And Navigation

**Files:**
- Modify: `global-shell.test.mjs`
- Modify: `english-copy.test.mjs`
- Modify: `header-layout.test.mjs`
- Modify: `index.html`
- Modify: `pages/about.html`
- Modify: `pages/services.html`
- Modify: `pages/cases.html`
- Modify: `pages/contact.html`
- Modify: `script.js`
- Modify: `content-pages.js`
- Modify: `styles.css`
- Modify: `scripts/render-detail-pages.mjs`
- Create: `pages/shop.html`

**Interfaces:**
- Consumes: existing `.topbar`, `.nav`, language toggle, `data-section`, and shared footer conventions.
- Produces: one working Shop navigation route at `pages/shop.html`, `data-section="shop"`, and a five-link header contract used by all later tasks.

- [ ] **Step 1: Write failing shared-shell tests**

Add Shop to `pageGroups`, require five links, and add the Shop footer expectation:

```js
{
  section: "shop",
  pages: ["./pages/shop.html"],
  currentHref: "./shop.html",
},

assert.equal((header.match(/<a href=/g) || []).length, 5);
assert.match(header, /<a href="(?:\.\/|\.\.\/)?shop\.html"(?: aria-current="page")?>SHOP<\/a>/);

footerLinks.set("./pages/shop.html", "./contact.html");
```

Extend `publicPages` in `english-copy.test.mjs` with `"./pages/shop.html"` and add:

```js
test("shop navigation is bilingual in both controllers", () => {
  assert.match(read("./script.js"), /"nav\.shop": "商店"/);
  assert.match(read("./script.js"), /"nav\.shop": "SHOP"/);
  assert.match(read("./content-pages.js"), /"shop\.html": \{ zh: "商店", en: "SHOP" \}/);
});
```

Update `header-layout.test.mjs` to require:

```js
assert.match(
  mobileHeader,
  /\.nav\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/s,
);
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
node --test global-shell.test.mjs english-copy.test.mjs header-layout.test.mjs
```

Expected: failures for the missing `pages/shop.html`, four-link headers, missing translations, and four-column mobile navigation.

- [ ] **Step 3: Add the minimal Shop route and five-link header**

Insert one Shop link after Contact using this path matrix:

```text
index.html                    ./pages/shop.html
pages/*.html                 ./shop.html
pages/cases/case-*.html      ../shop.html (via renderer)
pages/services/*.html        ../shop.html (via renderer)
```

Add homepage translations to both language dictionaries:

```js
"nav.shop": "商店",
"nav.shop": "SHOP",
```

Add the content-page label:

```js
"shop.html": { zh: "商店", en: "SHOP" },
```

Add this minimal page before Task 2 expands it:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Browse sample performance-part categories for a selected vehicle and contact LONMA DYNAMIC for fitment and installation details." />
    <title>Shop | LONMA DYNAMIC</title>
    <link rel="stylesheet" href="../styles.css?v=global-shell-20260722" />
    <link rel="stylesheet" href="../layout-canvas.css?v=canvas-20260721-2200" />
  </head>
  <body data-section="shop">
    <main class="site-shell shop-page" aria-label="LONMA DYNAMIC shop" data-zh-aria-label="LONMA DYNAMIC 商店" data-en-aria-label="LONMA DYNAMIC shop">
      <header class="topbar">
        <a class="brand" href="../index.html" aria-label="Back to home" data-zh-aria-label="回到首页" data-en-aria-label="Back to home">LONMA DYNAMIC</a>
        <nav class="nav" aria-label="Main navigation" data-zh-aria-label="主导航" data-en-aria-label="Main navigation">
          <a href="./about.html">ABOUT</a>
          <a href="./services.html">SERVICES</a>
          <a href="./cases.html">CASES</a>
          <a href="./contact.html">CONTACT</a>
          <a href="./shop.html" aria-current="page">SHOP</a>
        </nav>
        <div class="top-actions">
          <button class="lang-toggle" type="button" aria-label="切换到中文">
            <span class="lang-option" data-lang-option="zh">中</span>
            <span class="lang-separator" aria-hidden="true">/</span>
            <span class="lang-option is-current" data-lang-option="en">EN</span>
          </button>
        </div>
      </header>
      <section class="shop-placeholder">
        <h1 data-zh="商店" data-en="SHOP">SHOP</h1>
      </section>
      <footer class="content-footer">
        <span>LONMA DYNAMIC</span>
        <span data-zh="龙马态度 · 2026" data-en="AUTOMOTIVE ATTITUDE · 2026">AUTOMOTIVE ATTITUDE · 2026</span>
        <a href="./contact.html" data-zh="开始你的项目 →" data-en="START YOUR PROJECT →">START YOUR PROJECT →</a>
      </footer>
    </main>
    <script src="../content-pages.js?v=english-copy-20260721"></script>
  </body>
</html>
```

Change the mobile navigation grid in `styles.css` from four to five equal columns and reduce only the mobile navigation font enough to preserve full labels:

```css
.nav {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.nav a {
  font-size: 10px;
  letter-spacing: 0;
}
```

- [ ] **Step 4: Regenerate details and verify GREEN**

Run:

```bash
node scripts/render-detail-pages.mjs
node --test global-shell.test.mjs english-copy.test.mjs header-layout.test.mjs
```

Expected: all focused tests pass, all 18 public pages expose five links, and only Shop marks Shop current.

- [ ] **Step 5: Commit**

```bash
git add index.html pages script.js content-pages.js styles.css scripts/render-detail-pages.mjs global-shell.test.mjs english-copy.test.mjs header-layout.test.mjs
git commit -m "Add Shop to the shared site navigation"
```

---

### Task 2: Build The Static Model-First Shop Catalog

**Files:**
- Create: `shop-data.mjs`
- Create: `scripts/render-shop-page.mjs`
- Create: `shop.css`
- Create: `shop.test.mjs`
- Create: `assets/images/shop/forged-wheel.webp`
- Create: `assets/images/shop/carbon-intake.webp`
- Create: `assets/images/shop/coilover-kit.webp`
- Create: `assets/images/shop/brake-kit.webp`
- Create: `assets/images/shop/carbon-aero.webp`
- Create: `assets/images/shop/performance-exhaust.webp`
- Modify: `pages/shop.html`

**Interfaces:**
- Consumes: five-link Shop header from Task 1 and the shared visual variables in `styles.css`.
- Produces: `shopProducts`, `shopVehicles`, `renderShopPage()`, six stable `data-product-card` nodes, and the DOM hooks consumed by `shop.js` in Task 3.

- [ ] **Step 1: Write the failing Shop renderer test**

Create `shop.test.mjs`:

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { shopProducts } from "./shop-data.mjs";
import { renderShopPage } from "./scripts/render-shop-page.mjs";

const html = readFileSync(new URL("./pages/shop.html", import.meta.url), "utf8");

test("shop renders six truthful bilingual sample products", () => {
  assert.equal(shopProducts.length, 6);
  assert.equal((html.match(/data-product-card/g) || []).length, 6);
  assert.match(html, /SAMPLE VEHICLE/);
  assert.match(html, /data-zh="示例车型" data-en="SAMPLE VEHICLE"/);
  assert.doesNotMatch(html, /\$\s?\d|IN STOCK|data-price|sku|part number/i);
  assert.equal((html.match(/data-en="INQUIRE"/g) || []).length, 6);
});

test("shop products own unique accessible media", () => {
  for (const product of shopProducts) {
    assert.ok(existsSync(new URL(`./${product.image}`, import.meta.url)), `${product.image} should exist`);
    assert.match(html, new RegExp(product.image.replaceAll(".", "\\.")));
    assert.ok(product.alt.en && product.alt.zh);
  }
});

test("renderShopPage escapes product copy", () => {
  const output = renderShopPage([{ ...shopProducts[0], title: { en: "<unsafe>", zh: "<危险>" } }]);
  assert.doesNotMatch(output, /<unsafe>|<危险>/);
  assert.match(output, /&lt;unsafe&gt;/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node --test shop.test.mjs
```

Expected: module-not-found failure for `shop-data.mjs` and `render-shop-page.mjs`.

- [ ] **Step 3: Generate and validate six product assets**

Generate six independent square product images with one shared direction: isolated automotive component, black studio surface, restrained top-left light, clear silhouette, no logo, no text, no watermark, no blue background, and no vehicle manufacturer marks. Save them at the exact paths listed in this task.

Validate each with:

```bash
file assets/images/shop/*.webp
```

Expected: six WebP images, each square and at least 1200px wide.

- [ ] **Step 4: Add canonical data and renderer**

`shop-data.mjs` must export this stable shape:

```js
export const shopVehicles = {
  makes: ["BMW", "AUDI", "MERCEDES-BENZ"],
  models: { BMW: ["G80 M3"], AUDI: [], "MERCEDES-BENZ": [] },
  years: { "G80 M3": ["2024"] },
  chassis: { "G80 M3": ["G8X"] },
};

export const shopProducts = [
  {
    id: "forged-wheel",
    category: "wheels",
    title: { en: "FORGED WHEEL", zh: "锻造轮毂" },
    description: {
      en: "A sample wheel category shown for design review. Confirm size, offset, finish, and vehicle fitment with LONMA DYNAMIC.",
      zh: "用于设计预览的轮毂分类示例。尺寸、ET、颜色与车型适配请向 LONMA DYNAMIC 确认。",
    },
    image: "assets/images/shop/forged-wheel.webp",
    alt: { en: "Forged performance wheel sample", zh: "锻造性能轮毂示例" },
  },
  {
    id: "carbon-intake",
    category: "intake",
    title: { en: "CARBON INTAKE SYSTEM", zh: "碳纤维进气系统" },
    description: {
      en: "A sample intake category shown for design review. Confirm platform, engine, and installation requirements with LONMA DYNAMIC.",
      zh: "用于设计预览的进气分类示例。平台、发动机与安装需求请向 LONMA DYNAMIC 确认。",
    },
    image: "assets/images/shop/carbon-intake.webp",
    alt: { en: "Carbon intake system sample", zh: "碳纤维进气系统示例" },
  },
  {
    id: "coilover-kit",
    category: "suspension",
    title: { en: "COILOVER KIT", zh: "绞牙避震套件" },
    description: {
      en: "A sample suspension category shown for design review. Confirm intended use, ride height, and chassis setup with LONMA DYNAMIC.",
      zh: "用于设计预览的避震分类示例。使用场景、车高与底盘设定请向 LONMA DYNAMIC 确认。",
    },
    image: "assets/images/shop/coilover-kit.webp",
    alt: { en: "Performance coilover kit sample", zh: "性能绞牙避震套件示例" },
  },
  {
    id: "brake-kit",
    category: "brakes",
    title: { en: "BIG BRAKE KIT", zh: "高性能刹车套件" },
    description: {
      en: "A sample brake category shown for design review. Confirm rotor, caliper, wheel-clearance, and use requirements with LONMA DYNAMIC.",
      zh: "用于设计预览的刹车分类示例。碟盘、卡钳、轮毂空间与用途请向 LONMA DYNAMIC 确认。",
    },
    image: "assets/images/shop/brake-kit.webp",
    alt: { en: "Performance brake kit sample", zh: "高性能刹车套件示例" },
  },
  {
    id: "carbon-aero",
    category: "aero",
    title: { en: "CARBON AERO", zh: "碳纤维空气动力套件" },
    description: {
      en: "A sample aero category shown for design review. Confirm body style, finish, installation, and complete-car direction with LONMA DYNAMIC.",
      zh: "用于设计预览的空气动力分类示例。车身版本、表面、安装与整车方向请向 LONMA DYNAMIC 确认。",
    },
    image: "assets/images/shop/carbon-aero.webp",
    alt: { en: "Carbon aerodynamic component sample", zh: "碳纤维空气动力部件示例" },
  },
  {
    id: "performance-exhaust",
    category: "exhaust",
    title: { en: "PERFORMANCE EXHAUST", zh: "性能排气系统" },
    description: {
      en: "A sample exhaust category shown for design review. Confirm sound target, configuration, road use, and installation with LONMA DYNAMIC.",
      zh: "用于设计预览的排气分类示例。声浪目标、配置、道路使用与安装请向 LONMA DYNAMIC 确认。",
    },
    image: "assets/images/shop/performance-exhaust.webp",
    alt: { en: "Performance exhaust system sample", zh: "性能排气系统示例" },
  },
];
```

`render-shop-page.mjs` must escape text and attributes, render English as live text, preserve bilingual data attributes, output the complete five-link header and footer, render six cards with `data-product-card` and `data-category`, and include these controls:

```html
<select id="shop-make" data-shop-make>
  <option value="BMW">BMW</option>
  <option value="AUDI">AUDI</option>
  <option value="MERCEDES-BENZ">MERCEDES-BENZ</option>
</select>
<select id="shop-model" data-shop-model>
  <option value="G80 M3">G80 M3</option>
</select>
<select id="shop-year" data-shop-year>
  <option value="2024">2024</option>
</select>
<select id="shop-chassis" data-shop-chassis>
  <option value="G8X">G8X</option>
</select>
<button type="button" data-find-parts>FIND PARTS</button>
<p data-results-status aria-live="polite">06 SAMPLE RESULTS</p>
<select data-shop-sort>
  <option value="featured" data-zh="推荐顺序" data-en="Featured">Featured</option>
  <option value="category" data-zh="按分类" data-en="Category">Category</option>
</select>
<dialog class="shop-dialog" data-product-dialog aria-labelledby="shop-dialog-title">
  <button type="button" data-dialog-close aria-label="Close product details" data-zh-aria-label="关闭产品详情" data-en-aria-label="Close product details">×</button>
  <img data-dialog-image src="../assets/images/shop/forged-wheel.webp" alt="Forged performance wheel sample" data-zh-alt="锻造性能轮毂示例" data-en-alt="Forged performance wheel sample" />
  <p data-dialog-category>WHEELS</p>
  <h2 id="shop-dialog-title" data-dialog-title>FORGED WHEEL</h2>
  <p data-dialog-description>A sample wheel category shown for design review.</p>
  <a data-dialog-inquiry href="./contact.html?product=forged-wheel" data-zh="咨询详情 →" data-en="REQUEST DETAILS →">REQUEST DETAILS →</a>
</dialog>
```

- [ ] **Step 5: Implement the selected catalog layout**

In `shop.css`, create the selected desktop composition:

```css
.shop-page {
  background: #111315;
}

.shop-selector {
  display: grid;
  grid-template-columns: minmax(220px, 1.15fr) repeat(4, minmax(150px, 1fr)) minmax(180px, 0.9fr);
  border-bottom: 1px solid var(--line);
}

.shop-catalog {
  display: grid;
  grid-template-columns: minmax(250px, 330px) minmax(0, 1fr);
}

.shop-product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.shop-product-card {
  border: 1px solid var(--line);
  background: #111315;
}

.shop-product-card img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}
```

Add the approved tablet and mobile changes: collapsed native filter disclosure and two columns from 768-1279px, then one column below 768px. Do not use permanent blue card borders.

- [ ] **Step 6: Generate the page and verify GREEN**

Run:

```bash
node scripts/render-shop-page.mjs
node --test shop.test.mjs
```

Expected: all Shop tests pass and `pages/shop.html` contains six visible products without JavaScript.

- [ ] **Step 7: Commit**

```bash
git add shop-data.mjs scripts/render-shop-page.mjs shop.css shop.test.mjs pages/shop.html assets/images/shop
git commit -m "Build the model-first Shop catalog"
```

---

### Task 3: Add Shop Filtering, Sorting, Query Links, And Dialog Behavior

**Files:**
- Modify: `shop.test.mjs`
- Create: `shop.js`
- Modify: `pages/shop.html` via `scripts/render-shop-page.mjs`
- Modify: `shop.css`

**Interfaces:**
- Consumes: Task 2 DOM hooks and product-card data attributes.
- Produces: `setCategoryFilters(Set<string>)`, `applyCatalogState()`, `openProductDialog(card, trigger)`, query support for `?category=`, and a keyboard-safe dialog.

- [ ] **Step 1: Add failing interaction-contract tests**

Append:

```js
const js = readFileSync(new URL("./shop.js", import.meta.url), "utf8");
const css = readFileSync(new URL("./shop.css", import.meta.url), "utf8");

test("shop controller supports filters, query links, and dialog focus", () => {
  assert.match(js, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(js, /querySelectorAll\("\[data-product-card\]"\)/);
  assert.match(js, /querySelectorAll\("\[data-category-filter\]"\)/);
  assert.match(js, /resultsStatus\.textContent/);
  assert.match(js, /productDialog\.showModal\(\)/);
  assert.match(js, /event\.key === "Escape"/);
  assert.match(js, /lastDialogTrigger\.focus\(\)/);
});

test("shop provides reduced-motion and visible focus states", () => {
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent-bright\)/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
```

- [ ] **Step 2: Run and verify RED**

Run:

```bash
node --test shop.test.mjs
```

Expected: missing `shop.js` and interaction hooks.

- [ ] **Step 3: Implement minimal catalog state**

Use one IIFE and DOM-owned data:

```js
(() => {
  const cards = [...document.querySelectorAll("[data-product-card]")];
  const filters = [...document.querySelectorAll("[data-category-filter]")];
  const resultsStatus = document.querySelector("[data-results-status]");
  const productDialog = document.querySelector("[data-product-dialog]");
  let lastDialogTrigger = null;

  function activeCategories() {
    return new Set(filters.filter((filter) => filter.checked).map((filter) => filter.value));
  }

  function applyCatalogState() {
    const active = activeCategories();
    let visibleCount = 0;
    cards.forEach((card) => {
      const visible = active.size === 0 || active.has(card.dataset.category);
      card.hidden = !visible;
      visibleCount += Number(visible);
    });
    resultsStatus.textContent = `${String(visibleCount).padStart(2, "0")} SAMPLE RESULTS`;
  }

  function openProductDialog(card, trigger) {
    lastDialogTrigger = trigger;
    // Copy bilingual card data into the existing dialog fields.
    productDialog.showModal();
  }

  // Initialize ?category=, controls, dialog close paths, and sort.
  applyCatalogState();
})();
```

Use a hidden empty-state section with a real link to `./contact.html`; never remove cards from the DOM. Keep dialog close behavior native and restore focus after `close`.

- [ ] **Step 4: Verify interactions and full language coverage**

Run:

```bash
node --test shop.test.mjs english-copy.test.mjs content-pages.test.mjs
```

Expected: all tests pass and Shop remains English-first with paired Chinese data.

- [ ] **Step 5: Commit**

```bash
git add shop.js shop.css shop.test.mjs scripts/render-shop-page.mjs pages/shop.html
git commit -m "Add Shop catalog interactions"
```

---

### Task 4: Build The Special Case 02 Parts-Used Layout

**Files:**
- Create: `case-02.test.mjs`
- Create: `case-02.css`
- Create: `case-02.js`
- Modify: `detail-pages-data.mjs`
- Modify: `scripts/render-detail-pages.mjs`
- Modify: `pages/cases/case-02.html` via generation
- Modify: `case-detail.test.mjs`

**Interfaces:**
- Consumes: Task 2 product images and `pages/shop.html?category=<category>` query handling.
- Produces: `renderCase02Page(record)`, four `data-case-part` rows, four `data-case-marker` controls, and synchronized `data-active` state.

- [ ] **Step 1: Write failing Case 02 tests**

Create:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { caseDetails } from "./detail-pages-data.mjs";
import { renderCasePage } from "./scripts/render-detail-pages.mjs";

const case02 = caseDetails.find((record) => record.id === "02");
const html = readFileSync(new URL("./pages/cases/case-02.html", import.meta.url), "utf8");

test("Case 02 owns four category-level parts references", () => {
  assert.equal(case02.partsUsed.length, 4);
  assert.deepEqual(case02.partsUsed.map((part) => part.category), ["brakes", "suspension", "wheels", "ecu"]);
});

test("Case 02 uses the approved special layout and real hero", () => {
  assert.match(html, /class="case02-showcase"/);
  assert.match(html, /optimized\/case-02\.jpg/);
  assert.equal((html.match(/data-case-marker/g) || []).length, 4);
  assert.equal((html.match(/data-case-part/g) || []).length, 4);
  assert.match(html, /PARTS USED/);
  assert.match(html, /href="\.\.\/shop\.html\?category=brakes"/);
  assert.doesNotMatch(html, /\$\s?\d|IN STOCK|data-price/i);
});

test("other cases retain the generic template", () => {
  for (const record of caseDetails.filter((item) => item.id !== "02")) {
    const output = renderCasePage(record);
    assert.match(output, /class="detail-hero"/);
    assert.doesNotMatch(output, /case02-showcase|data-case-marker|data-case-part/);
  }
});
```

Update `case-detail.test.mjs` so its generic assertions skip Case 02, then assert Case 02 contains `detail-story`, `detail-contact`, pagination, and no figcaption/heavy specification grid.

- [ ] **Step 2: Run and verify RED**

Run:

```bash
node --test case-02.test.mjs case-detail.test.mjs
```

Expected: failure because `partsUsed`, `case02-showcase`, marker, and rail markup do not exist.

- [ ] **Step 3: Add truthful Case 02 parts data**

Add:

```js
partsUsed: [
  {
    number: "01",
    category: "brakes",
    label: { en: "BRAKES", zh: "刹车" },
    title: { en: "BRAKE SYSTEM", zh: "刹车系统" },
    note: { en: "CASE 02 CATEGORY REFERENCE", zh: "案例 02 分类参考" },
    image: "assets/images/shop/brake-kit.webp",
  },
  {
    number: "02",
    category: "suspension",
    label: { en: "SUSPENSION", zh: "避震" },
    title: { en: "CHASSIS CONTROL", zh: "底盘控制" },
    note: { en: "CASE 02 CATEGORY REFERENCE", zh: "案例 02 分类参考" },
    image: "assets/images/shop/coilover-kit.webp",
  },
  {
    number: "03",
    category: "wheels",
    label: { en: "WHEELS", zh: "轮毂" },
    title: { en: "WHEEL FITMENT", zh: "轮毂数据" },
    note: { en: "CASE 02 CATEGORY REFERENCE", zh: "案例 02 分类参考" },
    image: "assets/images/shop/forged-wheel.webp",
  },
  {
    number: "04",
    category: "ecu",
    label: { en: "PERFORMANCE", zh: "动力" },
    title: { en: "ECU CALIBRATION", zh: "ECU 特调" },
    note: { en: "CASE 02 CATEGORY REFERENCE", zh: "案例 02 分类参考" },
    image: "assets/images/网页/optimized/case-04.jpg",
  },
],
```

- [ ] **Step 4: Add the special renderer and visual layout**

Make `renderCasePage(record)` delegate only for ID 02:

```js
export const renderCasePage = (record) =>
  record.id === "02" ? renderCase02Page(record) : renderGenericCasePage(record);
```

The special page must include the existing hero image, title, four `<button data-case-marker="01">` controls, four `<a data-case-part="01" href="../shop.html?category=brakes">` rows, the editorial story and contact sections, pagination, shared footer, `case-02.css`, `content-pages.js`, and `case-02.js`.

Implement the approved wide layout:

```css
.case02-showcase {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(360px, 1fr);
  min-height: min(calc(100vh - var(--site-header-height)), var(--site-first-screen-max));
}

.case02-media {
  position: relative;
  min-height: 0;
  overflow: hidden;
}

.case02-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 62%;
}

.case02-parts {
  display: grid;
  grid-template-rows: auto repeat(4, minmax(0, 1fr)) auto;
  background: #111315;
}
```

At 768-1279px stack image and rail, and below 768px hide image markers while retaining all numbered parts rows.

- [ ] **Step 5: Implement marker/rail synchronization**

`case-02.js` must use one state setter:

```js
(() => {
  const markers = [...document.querySelectorAll("[data-case-marker]")];
  const parts = [...document.querySelectorAll("[data-case-part]")];

  function setActivePart(id) {
    [...markers, ...parts].forEach((node) => {
      const active = (node.dataset.caseMarker || node.dataset.casePart) === id;
      node.toggleAttribute("data-active", active);
      if (node.matches("button")) node.setAttribute("aria-pressed", String(active));
    });
  }

  [...markers, ...parts].forEach((node) => {
    const id = node.dataset.caseMarker || node.dataset.casePart;
    node.addEventListener("pointerenter", () => setActivePart(id));
    node.addEventListener("focus", () => setActivePart(id));
    node.addEventListener("click", () => setActivePart(id));
  });

  setActivePart("01");
})();
```

Gate pointer hover styling with `@media (hover: hover) and (pointer: fine)` and use instant changes under `prefers-reduced-motion: reduce`.

- [ ] **Step 6: Regenerate and verify GREEN**

Run:

```bash
node scripts/render-detail-pages.mjs
node --test case-02.test.mjs case-detail.test.mjs link-closure.test.mjs english-copy.test.mjs
```

Expected: Case 02 special-layout tests pass and Case 01/03-06 remain unchanged in structure.

- [ ] **Step 7: Commit**

```bash
git add detail-pages-data.mjs scripts/render-detail-pages.mjs pages/cases case-02.css case-02.js case-02.test.mjs case-detail.test.mjs
git commit -m "Build the Case 02 parts-used layout"
```

---

### Task 5: Integration, Responsive Verification, And Design QA

**Files:**
- Modify: `responsive-layout.test.mjs`
- Modify: `global-shell.test.mjs`
- Modify: `shop.css`
- Modify: `case-02.css`
- Modify: `styles.css`
- Create: `design-qa.md`

**Interfaces:**
- Consumes: all pages, interactions, and assets from Tasks 1-4.
- Produces: a fully green branch and `design-qa.md` with `final result: passed`.

- [ ] **Step 1: Add failing responsive and integration assertions**

Add:

```js
const shopHtml = read("./pages/shop.html");
const shopCss = read("./shop.css");
const case02Html = read("./pages/cases/case-02.html");
const case02Css = read("./case-02.css");

assert.doesNotMatch(`${shopCss}\n${case02Css}`, /width:\s*100vw|transform:\s*scale\(/);
assert.match(shopCss, /@media \(min-width:\s*768px\) and \(max-width:\s*1279px\)/);
assert.match(shopCss, /@media \(max-width:\s*767px\)[\s\S]*\.shop-product-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
assert.match(case02Css, /@media \(max-width:\s*767px\)[\s\S]*\[data-case-marker\]\s*\{[^}]*display:\s*none/s);
assert.match(shopHtml, /data-results-status aria-live="polite"/);
assert.match(case02Html, /aria-pressed="true"/);
```

- [ ] **Step 2: Run and verify RED if any guard is missing**

Run:

```bash
node --test responsive-layout.test.mjs global-shell.test.mjs
```

Expected: any missing responsive or accessibility contract fails before final CSS adjustment.

- [ ] **Step 3: Complete responsive and accessibility fixes**

Adjust only `shop.css`, `case-02.css`, and shared header rules needed to satisfy the failures. Do not alter established non-Shop/non-Case 02 section layouts.

- [ ] **Step 4: Run the complete automated suite**

Run:

```bash
node scripts/render-shop-page.mjs
node scripts/render-detail-pages.mjs
node --test *.test.mjs
git diff --check
```

Expected: all tests pass, no warnings, and no whitespace errors.

- [ ] **Step 5: Start a local preview and perform browser verification**

Run:

```bash
python3 -m http.server 4200
```

Verify Shop and Case 02 at:

```text
2200 x 1050
1440 x 1024
1440 x 900
1156 x 900
790 x 900
390 x 844
```

At each relevant width verify no overflow or text overlap. Exercise English-to-Chinese switching, Shop selectors, category filters, empty state, product dialog keyboard close/focus return, `?category=brakes`, Case 02 marker/rail synchronization, touch layout, and all navigation links. Check the browser console and missing assets.

- [ ] **Step 6: Run visual design QA against both approved images**

Compare 1440 x 1024 captures with `docs/superpowers/specs/assets/2026-07-22-shop-option-1.png` and `docs/superpowers/specs/assets/2026-07-22-case-02-shop-the-build.png`; crop only the reference's extra bottom pixels when needed so the comparison uses the same viewport area.

Write `design-qa.md` with:

```md
# Design QA

## Shop
- Reference viewport and state
- Implemented viewport and state
- P0/P1/P2 findings and fixes
- Remaining P3 polish

## Case 02
- Reference viewport and state
- Implemented viewport and state
- P0/P1/P2 findings and fixes
- Remaining P3 polish

final result: passed
```

Do not finish while P0, P1, or P2 items remain.

- [ ] **Step 7: Commit final integration fixes**

```bash
git add responsive-layout.test.mjs global-shell.test.mjs shop.css case-02.css styles.css design-qa.md
git commit -m "Verify Shop and Case 02 across viewports"
```
