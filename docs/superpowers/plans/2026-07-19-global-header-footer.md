# Global Header And Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every public LONMA DYNAMIC page one consistent bilingual header and footer, with a 77px desktop header and a compact 104px two-row mobile header.

**Architecture:** Keep the existing static HTML architecture and current language scripts. Put all shell styling in `styles.css` and shared canvas dimensions in `layout-canvas.css`; page-specific styles remain untouched. Add one structural test that covers every public page, then extend the existing responsive and interaction tests before changing production files.

**Tech Stack:** Static HTML, CSS custom properties and media queries, vanilla JavaScript, Node.js built-in test runner.

## Global Constraints

- The shared content canvas remains capped at exactly `1900px`.
- Desktop header height remains exactly `77px`.
- Mobile header height is exactly `104px`, inside the approved `96–112px` range.
- Mobile keeps all four navigation links visible in one row; no hamburger menu.
- Do not use `transform: scale()` to resize a page.
- Default borders remain neutral gray; BMW blue is limited to active, hover, arrow, and focus states.
- Keep visible `:focus-visible` indicators and respect `prefers-reduced-motion`.
- Do not change homepage, Case, Case detail, Services, or Service detail body layouts, images, copy, or existing animations.
- Do not add dependencies, a framework, a CMS feature, SEO work, or form infrastructure.
- Do not publish or deploy until the user explicitly requests upload.

---

### Task 1: Lock The Global Shell Contract

**Files:**
- Create: `global-shell.test.mjs`
- Modify: `index.html`
- Modify: `pages/about.html`
- Modify: `pages/services.html`
- Modify: `pages/cases.html`
- Modify: `pages/contact.html`
- Modify: `pages/cases/case-01.html`
- Modify: `pages/cases/case-02.html`
- Modify: `pages/cases/case-03.html`
- Modify: `pages/cases/case-04.html`
- Modify: `pages/cases/case-05.html`
- Modify: `pages/cases/case-06.html`
- Modify: `pages/services/build.html`
- Modify: `pages/services/parts.html`
- Modify: `pages/services/photo.html`
- Modify: `pages/services/ecu.html`
- Modify: `pages/services/chassis.html`
- Modify: `pages/services/exhaust.html`

**Interfaces:**
- Consumes: existing `.topbar`, `.brand`, `.nav`, `.top-actions`, `.lang-toggle`, `data-section`, and `aria-current`.
- Produces: a static shell contract where every public page exposes its current section before JavaScript runs.

- [ ] **Step 1: Write the failing structural test**

Create `global-shell.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const pageGroups = [
  {
    section: "home",
    pages: ["./index.html"],
    currentHref: null,
  },
  {
    section: "about",
    pages: ["./pages/about.html"],
    currentHref: "./about.html",
  },
  {
    section: "services",
    pages: [
      "./pages/services.html",
      "./pages/services/build.html",
      "./pages/services/parts.html",
      "./pages/services/photo.html",
      "./pages/services/ecu.html",
      "./pages/services/chassis.html",
      "./pages/services/exhaust.html",
    ],
    currentHref: (path) => path.includes("/services/") ? "../services.html" : "./services.html",
  },
  {
    section: "cases",
    pages: [
      "./pages/cases.html",
      "./pages/cases/case-01.html",
      "./pages/cases/case-02.html",
      "./pages/cases/case-03.html",
      "./pages/cases/case-04.html",
      "./pages/cases/case-05.html",
      "./pages/cases/case-06.html",
    ],
    currentHref: (path) => path.includes("/cases/") ? "../cases.html" : "./cases.html",
  },
  {
    section: "contact",
    pages: ["./pages/contact.html"],
    currentHref: "./contact.html",
  },
];

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

for (const group of pageGroups) {
  for (const path of group.pages) {
    test(`${path} exposes the shared header and current section`, () => {
      const html = read(path);
      const header = html.match(/<header class="topbar">([\s\S]*?)<\/header>/)?.[1] ?? "";

      assert.match(html, new RegExp(`<body[^>]*data-section="${group.section}"`));
      assert.match(header, /<a class="brand"[^>]*data-zh-aria-label="回到首页"[^>]*data-en-aria-label="Back to home"/);
      assert.match(header, /<nav class="nav"[^>]*data-zh-aria-label="主导航"[^>]*data-en-aria-label="Main navigation"/);
      assert.equal((header.match(/<a href=/g) || []).length, 4);
      assert.match(header, /<button class="lang-toggle"[^>]*aria-label="Switch to English"/);

      const currentHref = typeof group.currentHref === "function"
        ? group.currentHref(path)
        : group.currentHref;

      if (currentHref) {
        const escapedHref = escapeRegExp(currentHref);
        assert.match(header, new RegExp(`<a href="${escapedHref}" aria-current="page">`));
        assert.equal((header.match(/aria-current="page"/g) || []).length, 1);
      } else {
        assert.doesNotMatch(header, /aria-current="page"/);
      }
    });
  }
}
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run:

```bash
node --test global-shell.test.mjs
```

Expected: FAIL because the homepage and three content pages do not all have `data-section`, several headers lack bilingual ARIA attributes, and some current links are only assigned after JavaScript runs.

- [ ] **Step 3: Add the exact section and header semantics**

Use these exact body sections:

| File group | Body attribute |
| --- | --- |
| `index.html` | `data-section="home"` |
| `pages/about.html` | `data-section="about"` |
| `pages/services.html` and six service detail pages | `data-section="services"` |
| `pages/cases.html` and six Case detail pages | `data-section="cases"` |
| `pages/contact.html` | `data-section="contact"` |

Use these exact shared ARIA attributes on every non-home header and preserve the correct relative `href`:

```html
<a
  class="brand"
  href="../index.html"
  aria-label="回到首页"
  data-zh-aria-label="回到首页"
  data-en-aria-label="Back to home"
>LONMA DYNAMIC</a>
<nav
  class="nav"
  aria-label="主导航"
  data-zh-aria-label="主导航"
  data-en-aria-label="Main navigation"
>
```

For detail pages, keep `../../index.html` on the brand. Mark exactly one static current navigation link:

```html
<a href="./about.html" aria-current="page">ABOUT</a>
<a href="./services.html" aria-current="page">SERVICES</a>
<a href="./cases.html" aria-current="page">CASES</a>
<a href="./contact.html" aria-current="page">CONTACT</a>
```

Use only the line matching each page's `data-section`; detail pages use `../services.html` or `../cases.html` and keep their existing Chinese default labels.

On the homepage, add bilingual ARIA data without changing its `data-i18n` behavior:

```html
<a
  class="brand"
  href="#"
  aria-label="回到首页"
  data-i18n-aria="brand.home"
  data-zh-aria-label="回到首页"
  data-en-aria-label="Back to home"
>LONMA DYNAMIC</a>
<nav
  class="nav"
  aria-label="主导航"
  data-zh-aria-label="主导航"
  data-en-aria-label="Main navigation"
>
```

- [ ] **Step 4: Run the focused and existing header tests**

Run:

```bash
node --test global-shell.test.mjs header-layout.test.mjs link-closure.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 5: Commit the structural header contract**

```bash
git add global-shell.test.mjs index.html pages
git commit -m "Unify global header semantics"
```

---

### Task 2: Add One Shared Bilingual Footer To Every Page

**Files:**
- Modify: `global-shell.test.mjs`
- Modify: `styles.css`
- Modify: `content-pages.css`
- Modify: `script.js`
- Modify: `index.html`
- Modify: `pages/cases.html`
- Modify: `pages/cases/case-01.html`
- Modify: `pages/cases/case-02.html`
- Modify: `pages/cases/case-03.html`
- Modify: `pages/cases/case-04.html`
- Modify: `pages/cases/case-05.html`
- Modify: `pages/cases/case-06.html`
- Modify: `pages/services/build.html`
- Modify: `pages/services/parts.html`
- Modify: `pages/services/photo.html`
- Modify: `pages/services/ecu.html`
- Modify: `pages/services/chassis.html`
- Modify: `pages/services/exhaust.html`
- Verify unchanged markup: `pages/about.html`
- Verify unchanged markup: `pages/services.html`
- Verify unchanged markup: `pages/contact.html`

**Interfaces:**
- Consumes: homepage `data-i18n` dictionaries and non-home `[data-zh][data-en]` translation handling.
- Produces: `.content-footer` markup on all 17 pages and one global footer style definition in `styles.css`.

- [ ] **Step 1: Extend the shell test with failing footer assertions**

Add this configuration and test to `global-shell.test.mjs`:

```js
const footerLinks = new Map([
  ["./index.html", "./pages/contact.html"],
  ["./pages/about.html", "./contact.html"],
  ["./pages/services.html", "./contact.html"],
  ["./pages/cases.html", "./contact.html"],
  ["./pages/contact.html", "./cases.html"],
]);

for (const number of ["01", "02", "03", "04", "05", "06"]) {
  footerLinks.set(`./pages/cases/case-${number}.html`, "../contact.html");
}

for (const slug of ["build", "parts", "photo", "ecu", "chassis", "exhaust"]) {
  footerLinks.set(`./pages/services/${slug}.html`, "../contact.html");
}

for (const [path, href] of footerLinks) {
  test(`${path} exposes one bilingual global footer`, () => {
    const html = read(path);
    const footers = [...html.matchAll(/<footer class="content-footer">([\s\S]*?)<\/footer>/g)];

    assert.equal(footers.length, 1);
    assert.match(footers[0][1], /<span>LONMA DYNAMIC<\/span>/);
    assert.match(
      footers[0][1],
      /data-zh="龙马态度 · 2026" data-en="AUTOMOTIVE ATTITUDE · 2026"/
    );
    assert.match(footers[0][1], new RegExp(`<a href="${escapeRegExp(href)}"`));
    assert.match(footers[0][1], /<a [^>]*data-zh="[^"]+ →" data-en="[^"]+ →"/);
  });
}

test("footer styling is global and not duplicated by content pages", () => {
  const sharedCss = read("./styles.css");
  const contentCss = read("./content-pages.css");

  assert.match(sharedCss, /\.content-footer\s*\{[^}]*grid-template-columns:\s*1fr auto 1fr/s);
  assert.match(sharedCss, /\.content-footer a:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent-bright\)/s);
  assert.doesNotMatch(contentCss, /\.content-footer/);
});
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run:

```bash
node --test global-shell.test.mjs
```

Expected: FAIL because 14 pages have no footer and the footer CSS still lives only in `content-pages.css`.

- [ ] **Step 3: Move the footer styling into `styles.css`**

Remove the existing `.content-footer` desktop and mobile rules from `content-pages.css`. Add this shared block to `styles.css`:

```css
.content-footer {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 112px;
  padding: 24px clamp(24px, 5vw, 92px);
  border-top: 1px solid var(--line);
  color: var(--muted);
  background: #0d0f11;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.06em;
}

.content-footer span:first-child {
  color: var(--ink);
  font-weight: 700;
}

.content-footer a {
  justify-self: end;
  color: var(--ink);
  text-decoration: none;
  transition: color 180ms ease, text-shadow 180ms ease;
}

.content-footer a:hover {
  color: var(--accent-bright);
  text-shadow: 0 0 12px var(--accent-glow);
}

.content-footer a:focus-visible {
  color: var(--accent-bright);
  outline: 2px solid var(--accent-bright);
  outline-offset: 5px;
}
```

Add a new `@media (max-width: 767px)` block for the mobile footer. Task 3 will add the mobile header rules to this same breakpoint:

```css
.content-footer {
  grid-template-columns: 1fr;
  gap: 14px;
  min-height: 154px;
  padding: 28px 18px;
}

.content-footer a {
  justify-self: start;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
```

- [ ] **Step 4: Add the exact footer markup before `</main>`**

Use this structure on every page:

```html
<footer class="content-footer">
  <span>LONMA DYNAMIC</span>
  <span data-zh="龙马态度 · 2026" data-en="AUTOMOTIVE ATTITUDE · 2026">龙马态度 · 2026</span>
  <a href="./contact.html" data-zh="开始你的项目 →" data-en="START YOUR PROJECT →">开始你的项目 →</a>
</footer>
```

Use these exact relative links and CTA translations:

| Page | `href` | Chinese | English |
| --- | --- | --- | --- |
| `index.html` | `./pages/contact.html` | `开始你的项目 →` | `START YOUR PROJECT →` |
| `pages/about.html` | `./contact.html` | `开始你的项目 →` | `START YOUR PROJECT →` |
| `pages/services.html` | `./contact.html` | `开始你的项目 →` | `START YOUR PROJECT →` |
| `pages/cases.html` | `./contact.html` | `开始你的项目 →` | `START YOUR PROJECT →` |
| `pages/contact.html` | `./cases.html` | `查看案例 →` | `VIEW CASE FILES →` |
| six Case detail pages | `../contact.html` | `开始你的项目 →` | `START YOUR PROJECT →` |
| six Service detail pages | `../contact.html` | `开始你的项目 →` | `START YOUR PROJECT →` |

The existing About, Services, and Contact footer structures already match these values and must remain single instances.

For the homepage footer only, add `data-i18n` keys:

```html
<span
  data-i18n="footer.attitude"
  data-zh="龙马态度 · 2026"
  data-en="AUTOMOTIVE ATTITUDE · 2026"
>龙马态度 · 2026</span>
<a
  href="./pages/contact.html"
  data-i18n="footer.contact"
  data-zh="开始你的项目 →"
  data-en="START YOUR PROJECT →"
>开始你的项目 →</a>
```

Add these exact entries to both homepage language dictionaries in `script.js`:

```js
"footer.attitude": "龙马态度 · 2026",
"footer.contact": "开始你的项目 →",
```

```js
"footer.attitude": "AUTOMOTIVE ATTITUDE · 2026",
"footer.contact": "START YOUR PROJECT →",
```

- [ ] **Step 5: Run footer, language, and content tests**

Run:

```bash
node --test global-shell.test.mjs content-pages.test.mjs header-layout.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 6: Commit the global footer**

```bash
git add global-shell.test.mjs styles.css content-pages.css script.js index.html pages
git commit -m "Add bilingual footer across public pages"
```

---

### Task 3: Implement The Compact Responsive Header

**Files:**
- Modify: `responsive-layout.test.mjs`
- Modify: `header-layout.test.mjs`
- Modify: `layout-canvas.css`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `--site-header-height`, `.topbar`, `.brand`, `.nav`, `.top-actions`, and `.lang-toggle`.
- Produces: 77px single-row header from 768px upward and 104px two-row header below 768px.

- [ ] **Step 1: Add failing responsive and accessibility assertions**

Append to `responsive-layout.test.mjs`:

```js
assert.match(
  canvasCss,
  /@media \(max-width:\s*767px\)\s*\{[\s\S]*?:root\s*\{[^}]*--site-header-height:\s*104px/s,
  "mobile canvas should expose the approved 104px header height"
);
assert.match(
  sharedCss,
  /@media \(min-width:\s*768px\) and \(max-width:\s*980px\)[\s\S]*?\.topbar\s*\{[^}]*grid-template-columns:\s*minmax\(150px,\s*1fr\)\s+auto\s+minmax\(120px,\s*1fr\)[^}]*min-height:\s*var\(--site-header-height\)/s,
  "tablet and narrow split screens should retain a 77px three-column header"
);
assert.match(
  sharedCss,
  /@media \(max-width:\s*767px\)[\s\S]*?\.topbar\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto[^}]*grid-template-rows:\s*44px 44px[^}]*min-height:\s*var\(--site-header-height\)/s,
  "mobile should use a stable two-row header"
);
assert.match(
  sharedCss,
  /@media \(max-width:\s*767px\)[\s\S]*?\.nav\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)[^}]*width:\s*100%/s,
  "mobile should keep four navigation links on one row"
);
assert.doesNotMatch(
  sharedCss,
  /@media \(max-width:\s*620px\)[\s\S]*?\.nav\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s,
  "small phones must not collapse navigation into two columns"
);
```

Append to `header-layout.test.mjs`:

```js
assert.match(
  css,
  /\.nav a:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent-bright\)[^}]*outline-offset:\s*5px/s,
  "navigation should keep a visible keyboard focus indicator"
);
assert.match(
  css,
  /@media \(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.nav a,[\s\S]*?\.lang-toggle,[\s\S]*?\.content-footer a\s*\{[^}]*transition:\s*none/s,
  "shell glow transitions should stop when reduced motion is requested"
);
```

- [ ] **Step 2: Run the tests and verify the expected failure**

Run:

```bash
node --test responsive-layout.test.mjs header-layout.test.mjs
```

Expected: FAIL because the current header becomes two rows at 980px, the small-phone navigation becomes two columns, and nav links lack their own focus rule.

- [ ] **Step 3: Add the shared mobile height**

Append to `layout-canvas.css`:

```css
@media (max-width: 767px) {
  :root {
    --site-header-height: 104px;
  }
}
```

- [ ] **Step 4: Replace the current compact header rules**

Remove header declarations from the existing `@media (max-width: 980px)` block while preserving unrelated service-grid rules. Add:

```css
@media (min-width: 768px) and (max-width: 980px) {
  .topbar {
    grid-template-columns: minmax(150px, 1fr) auto minmax(120px, 1fr);
    gap: 12px;
    min-height: var(--site-header-height);
    padding-inline: 20px;
  }

  .nav {
    gap: clamp(10px, 1.7vw, 18px);
  }

  .brand,
  .nav a {
    font-size: 13px;
  }
}

@media (max-width: 767px) {
  .topbar {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: 44px 44px;
    gap: 0 14px;
    min-height: var(--site-header-height);
    padding: 8px 18px;
  }

  .brand {
    grid-column: 1;
    grid-row: 1;
    align-self: center;
    min-width: 0;
    font-size: 13px;
    white-space: nowrap;
  }

  .top-actions {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
    align-self: center;
  }

  .nav {
    grid-column: 1 / -1;
    grid-row: 2;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    align-items: center;
    justify-self: stretch;
    width: 100%;
    gap: 8px;
  }

  .nav a {
    min-width: 0;
    padding-block: 10px;
    overflow: hidden;
    font-size: 11px;
    text-align: center;
    text-overflow: clip;
    white-space: nowrap;
  }

  .lang-toggle {
    min-width: 88px;
    min-height: 38px;
    padding: 6px 12px;
  }
}
```

Delete the `.nav` two-column override from `@media (max-width: 620px)`.

- [ ] **Step 5: Add focus and reduced-motion states**

Add:

```css
.nav a:focus-visible {
  color: var(--ink);
  outline: 2px solid var(--accent-bright);
  outline-offset: 5px;
  text-shadow: 0 0 12px var(--accent-glow);
}

@media (prefers-reduced-motion: reduce) {
  .nav a,
  .lang-toggle,
  .content-footer a {
    transition: none;
  }
}
```

- [ ] **Step 6: Run focused and full automated tests**

Run:

```bash
node --test responsive-layout.test.mjs header-layout.test.mjs
node --test *.test.mjs
```

Expected: all tests PASS with zero failures.

- [ ] **Step 7: Commit the responsive shell**

```bash
git add responsive-layout.test.mjs header-layout.test.mjs layout-canvas.css styles.css
git commit -m "Refine responsive global header"
```

---

### Task 4: Verify Language Behavior And Visual Regression

**Files:**
- Modify if a discovered regression requires it: `content-pages.test.mjs`
- Modify if a discovered regression requires it: `script.js`
- Modify if a discovered regression requires it: `content-pages.js`
- Verify: all public HTML and CSS files listed above

**Interfaces:**
- Consumes: `lonma-language` storage key, `data-i18n`, `[data-zh][data-en]`, `data-section`, and `aria-current`.
- Produces: verified bilingual shell behavior without altering page-specific interactions.

- [ ] **Step 1: Add a failing language assertion only if the manual toggle check exposes a real regression**

For a non-home regression, extend the existing VM test in `content-pages.test.mjs` with a footer node:

```js
const footerAttitude = new FakeElement({
  textContent: "龙马态度 · 2026",
  dataset: {
    zh: "龙马态度 · 2026",
    en: "AUTOMOTIVE ATTITUDE · 2026",
  },
});
translatedNodes.push(footerAttitude);
```

After `langToggle.dispatch("click")`, assert:

```js
assert.equal(footerAttitude.textContent, "AUTOMOTIVE ATTITUDE · 2026");
assert.equal(document.documentElement.lang, "en");
```

Run:

```bash
node --test content-pages.test.mjs
```

Expected: FAIL only if the discovered language regression is reproduced. If there is no regression, do not change the scripts.

- [ ] **Step 2: Apply the smallest language fix when a failing test exists**

Keep the established translation loop:

```js
translatedNodes.forEach((node) => {
  node.textContent = node.dataset[currentLanguage];
});
```

Do not add another language state or storage key. Fix only a missing selector, attribute, or dictionary entry identified by the failing test.

- [ ] **Step 3: Start a local static server**

Run:

```bash
python3 -m http.server 4200
```

Expected: the site is available at `http://127.0.0.1:4200/`.

- [ ] **Step 4: Check the complete page set at required widths**

Verify these routes:

- `/index.html`
- `/pages/about.html`
- `/pages/services.html`
- `/pages/cases.html`
- `/pages/contact.html`
- `/pages/cases/case-01.html`
- `/pages/services/build.html`

Verify each representative route at:

- `1900 × 1050`
- `1440 × 900`
- `900 × 1050`
- `768 × 1024`
- `390 × 844`

At each width confirm:

- no horizontal overflow;
- desktop header is 77px and mobile header is 104px;
- all four mobile navigation links stay on one row;
- current navigation state is correct;
- footer has one instance and the correct CTA;
- Chinese and English toggle in both directions;
- Case background/rail interaction still works;
- Services permanent images and square hover previews still work;
- Case and Service detail body composition is unchanged.

- [ ] **Step 5: Run the final verification commands**

Run:

```bash
node --test *.test.mjs
git diff --check
git status --short
```

Expected: all tests PASS, `git diff --check` prints nothing, and only intentional files are modified.

- [ ] **Step 6: Commit any test-backed verification fix**

Only if Step 1 produced a failing regression test and Step 2 fixed it:

```bash
git add content-pages.test.mjs content-pages.js script.js
git commit -m "Preserve shell language behavior"
```

Do not push or deploy in this task.
