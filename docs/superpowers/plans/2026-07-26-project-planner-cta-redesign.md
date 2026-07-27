# Project Planner CTA and Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the four-step project planner easy to discover from every page and redesign its first screen to match the approved compact split-workspace concept.

**Architecture:** Keep the site as static HTML, CSS, and JavaScript. Add one shared header CTA pattern to every checked-in page and to the detail-page generator, add a two-button homepage action row, then change only the planner's markup and presentation while preserving `project.js` as the authoritative workflow and contact-handoff controller.

**Tech Stack:** Static HTML5, CSS custom properties and media queries, vanilla JavaScript, Node.js built-in test runner.

## Global Constraints

- Preserve the existing four planner steps: `VEHICLE`, `GOAL`, `DIRECTION`, and `REVIEW`.
- Preserve vehicle validation, direction validation, Shop query hydration, bilingual review values, and contact-page prefill.
- English remains the default language when no session language exists.
- Header CTA labels are `START PROJECT` / `开始项目` on desktop and tablet, and `BUILD` / `规划` on mobile.
- Homepage primary CTA labels are `START YOUR PROJECT →` / `开始你的项目 →`.
- Use `assets/images/网页/optimized/case-02.jpg` for the planner media on every step.
- Keep the shared maximum-width canvas and do not use `width: 100vw` or `transform: scale()`.
- Default borders remain neutral gray; blue is limited to actions, active states, arrows, and focus-visible states.
- Keep minimum 44px touch targets, visible keyboard focus, and `prefers-reduced-motion` support.
- Do not modify Shop product behavior, Cases behavior, service content, contact delivery, or planner query parameter names.
- Do not stage or modify the existing untracked `audit/` directory.

## File Map

- `styles.css`: shared header CTA, homepage action-row styling, tablet/mobile fitting, focus, and reduced-motion rules.
- `script.js`: homepage translation keys for the new header and hero CTAs.
- `index.html`: homepage header CTA and first-screen action row.
- `pages/about.html`, `pages/services.html`, `pages/cases.html`, `pages/contact.html`, `pages/project.html`, `pages/shop.html`: same-level header CTA markup.
- `pages/shop/forged-wheel.html`: parent-level header CTA markup.
- `scripts/render-detail-pages.mjs`: source of truth for header CTA markup on six service-detail and six case-detail pages.
- `pages/services/*.html`, `pages/cases/case-*.html`: regenerated outputs from `scripts/render-detail-pages.mjs`.
- `project.css`: compact planner progress rail, 39/61 desktop workspace, clean media panel, and mobile layout.
- `project.js`: no behavior change expected; used unchanged by regression tests.
- `global-shell.test.mjs`: all-page route and bilingual header-CTA coverage.
- `header-layout.test.mjs`: shared header, homepage CTA, responsive label, focus, and motion coverage.
- `project-planner.test.mjs`: planner structure, media, workflow, and contact-handoff coverage.
- `responsive-layout.test.mjs`: 39/61 desktop layout and mobile clearance coverage.

---

### Task 1: Add the Project Entry to Every Header

**Files:**
- Modify: `global-shell.test.mjs`
- Modify: `header-layout.test.mjs`
- Modify: `scripts/render-detail-pages.mjs`
- Modify: `index.html`
- Modify: `pages/about.html`
- Modify: `pages/services.html`
- Modify: `pages/cases.html`
- Modify: `pages/contact.html`
- Modify: `pages/project.html`
- Modify: `pages/shop.html`
- Modify: `pages/shop/forged-wheel.html`
- Regenerate: `pages/services/build.html`
- Regenerate: `pages/services/parts.html`
- Regenerate: `pages/services/photo.html`
- Regenerate: `pages/services/ecu.html`
- Regenerate: `pages/services/chassis.html`
- Regenerate: `pages/services/exhaust.html`
- Regenerate: `pages/cases/case-01.html`
- Regenerate: `pages/cases/case-02.html`
- Regenerate: `pages/cases/case-03.html`
- Regenerate: `pages/cases/case-04.html`
- Regenerate: `pages/cases/case-05.html`
- Regenerate: `pages/cases/case-06.html`
- Modify: `styles.css`
- Modify: `script.js`

**Interfaces:**
- Consumes: existing `.top-actions`, `.lang-toggle`, `data-zh` / `data-en`, and homepage `data-i18n` translation behavior.
- Produces: `.project-entry`, `.project-entry-label-full`, and `.project-entry-label-compact` on all public pages, linking to the correct relative `project.html` route.

- [ ] **Step 1: Write failing all-page header tests**

Add route helpers and assertions to `global-shell.test.mjs` so every page header must expose exactly one project entry before the language toggle:

```js
const projectHrefFor = (path) => {
  if (path === "./index.html") return "./pages/project.html";
  if (path.includes("/cases/") || path.includes("/services/") || path.includes("/shop/")) {
    return "../project.html";
  }
  return "./project.html";
};

assert.match(
  header,
  new RegExp(
    `<a class="project-entry" href="${escapeRegExp(projectHrefFor(path))}">[\\s\\S]*` +
      `data-zh="开始项目" data-en="START PROJECT"[\\s\\S]*` +
      `data-zh="规划" data-en="BUILD"[\\s\\S]*</a>[\\s\\S]*` +
      `<button class="lang-toggle"`
  )
);
assert.equal((header.match(/class="project-entry"/g) || []).length, 1);
```

Add shared style expectations to `header-layout.test.mjs`:

```js
assert.match(
  css,
  /\.project-entry\s*\{[^}]*min-height:\s*44px[^}]*background:\s*var\(--accent\)/s
);
assert.match(
  css,
  /\.project-entry:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent-bright\)/s
);
assert.match(
  mobileHeader,
  /\.project-entry-label-full\s*\{[^}]*display:\s*none/s
);
assert.match(
  mobileHeader,
  /\.project-entry-label-compact\s*\{[^}]*display:\s*inline/s
);
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test global-shell.test.mjs header-layout.test.mjs
```

Expected: FAIL because `.project-entry` is absent from the headers and shared stylesheet.

- [ ] **Step 3: Add the shared bilingual header markup**

Insert this before `.lang-toggle` in `index.html`, using the homepage route:

```html
<a class="project-entry" href="./pages/project.html">
  <span class="project-entry-label-full" data-i18n="nav.projectCta" data-zh="开始项目" data-en="START PROJECT">START PROJECT</span>
  <span class="project-entry-label-compact" data-i18n="nav.projectCtaShort" data-zh="规划" data-en="BUILD">BUILD</span>
</a>
```

Insert the same structure into the six same-level pages with `href="./project.html"`. Insert it into `pages/shop/forged-wheel.html` with `href="../project.html"`.

Update the `header()` template in `scripts/render-detail-pages.mjs`:

```js
const header = (section) => `<header class="topbar">
    <a class="brand" href="../../index.html" ${i18nAttribute("aria-label", { zh: "回到首页", en: "Back to home" })}>LONMA DYNAMIC</a>
    <nav class="nav" ${i18nAttribute("aria-label", { zh: "主导航", en: "Main navigation" })}>
      <a href="../about.html">ABOUT</a>
      <a href="../services.html"${section === "services" ? ' aria-current="page"' : ""}>SERVICES</a>
      <a href="../cases.html"${section === "cases" ? ' aria-current="page"' : ""}>CASES</a>
      <a href="../contact.html">CONTACT</a>
      <a href="../shop.html">SHOP</a>
    </nav>
    <div class="top-actions">
      <a class="project-entry" href="../project.html">
        ${i18n("span", { zh: "开始项目", en: "START PROJECT" }, ' class="project-entry-label-full"')}
        ${i18n("span", { zh: "规划", en: "BUILD" }, ' class="project-entry-label-compact"')}
      </a>
      <button class="lang-toggle" type="button" aria-label="切换到中文">
        <span class="lang-option" data-lang-option="zh">中</span>
        <span class="lang-separator" aria-hidden="true">/</span>
        <span class="lang-option is-current" data-lang-option="en">EN</span>
      </button>
    </div>
  </header>`;
```

Regenerate the detail pages:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/render-detail-pages.mjs
```

- [ ] **Step 4: Add homepage translation keys**

Add these keys to both language objects in `script.js`:

```js
// zh
"nav.projectCta": "开始项目",
"nav.projectCtaShort": "规划",

// en
"nav.projectCta": "START PROJECT",
"nav.projectCtaShort": "BUILD",
```

Content pages need no controller change because `content-pages.js` already updates every node carrying both `data-zh` and `data-en`.

- [ ] **Step 5: Add shared CTA styling and responsive fitting**

Add to `styles.css`:

```css
.project-entry {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--accent);
  border-radius: 4px;
  padding: 0 16px;
  color: #fff;
  background: var(--accent);
  font: 700 11px var(--mono);
  letter-spacing: 0;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.project-entry:hover {
  border-color: var(--accent-bright);
  color: #fff;
  background: var(--accent-bright);
  box-shadow: 0 0 18px var(--accent-glow);
}

.project-entry:focus-visible {
  outline: 2px solid var(--accent-bright);
  outline-offset: 3px;
  box-shadow: 0 0 18px var(--accent-glow);
}

.project-entry-label-compact {
  display: none;
}
```

In the tablet media range, keep the full label but compact the controls:

```css
@media (min-width: 768px) and (max-width: 1180px) {
  .top-actions {
    gap: 10px;
  }

  .project-entry {
    padding-inline: 11px;
    font-size: 10px;
  }

  .lang-toggle {
    width: 84px;
  }
}
```

In the existing `@media (max-width: 767px)` block:

```css
.top-actions {
  gap: 8px;
}

.project-entry {
  min-width: 62px;
  min-height: 40px;
  padding-inline: 10px;
  font-size: 10px;
}

.project-entry-label-full {
  display: none;
}

.project-entry-label-compact {
  display: inline;
}
```

Add `.project-entry` to the shared reduced-motion selector so its transitions stop when reduced motion is requested.

- [ ] **Step 6: Advance the shared asset cache key**

Replace `three-page-expansion-20260726` with `project-planner-redesign-20260726` in public HTML, `scripts/render-detail-pages.mjs`, `header-layout.test.mjs`, and `responsive-layout.test.mjs`. Regenerate detail pages once more after updating the generator.

- [ ] **Step 7: Run header tests and verify pass**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test global-shell.test.mjs header-layout.test.mjs responsive-layout.test.mjs
```

Expected: PASS with one bilingual project entry on every public page and unchanged five-link navigation.

- [ ] **Step 8: Commit the header entry**

```bash
git add styles.css script.js index.html pages scripts/render-detail-pages.mjs global-shell.test.mjs header-layout.test.mjs responsive-layout.test.mjs
git commit -m "Add global project planner entry"
```

---

### Task 2: Add the Homepage First-Screen Action Row

**Files:**
- Modify: `header-layout.test.mjs`
- Modify: `index.html`
- Modify: `script.js`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `.left-panel`, `.note`, `.roll-table`, the homepage `translations` object, and the global `.project-entry` color tokens.
- Produces: `.hero-actions`, `.hero-project-action`, and a secondary `.enter-button` immediately above the featured case list.

- [ ] **Step 1: Write failing homepage action tests**

Add to `header-layout.test.mjs`:

```js
assert.match(
  html,
  /class="note"[\s\S]*class="hero-actions"[\s\S]*href="\.\/pages\/project\.html"[\s\S]*href="#services"[\s\S]*class="roll-table"/
);
assert.equal((html.match(/class="hero-project-action"/g) || []).length, 1);
assert.equal((html.match(/class="enter-button"/g) || []).length, 1);
assert.match(js, /"hero\.projectCta":\s*"开始你的项目 →"/);
assert.match(js, /"hero\.projectCta":\s*"START YOUR PROJECT →"/);
assert.match(css, /\.hero-actions\s*\{[^}]*display:\s*flex/s);
assert.match(css, /\.hero-project-action\s*\{[^}]*background:\s*var\(--accent\)/s);
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test header-layout.test.mjs
```

Expected: FAIL because the homepage still has only the old service button beneath the case list.

- [ ] **Step 3: Replace the old homepage button with the action row**

In `index.html`, insert this after `.note` and before `.roll-table`:

```html
<div class="hero-actions">
  <a class="hero-project-action" href="./pages/project.html" data-i18n="hero.projectCta">START YOUR PROJECT →</a>
  <a class="enter-button" href="#services" data-i18n="hero.servicesCta">VIEW SERVICES</a>
</div>
```

Remove the old standalone `.enter-button` after `.roll-table`.

- [ ] **Step 4: Add exact bilingual homepage copy**

Replace the old `hero.cta` translation with:

```js
// zh
"hero.projectCta": "开始你的项目 →",
"hero.servicesCta": "查看业务",

// en
"hero.projectCta": "START YOUR PROJECT →",
"hero.servicesCta": "VIEW SERVICES",
```

- [ ] **Step 5: Style the primary and secondary actions**

Replace the standalone `.enter-button` spacing with:

```css
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0 0 24px;
}

.hero-project-action,
.enter-button {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  border-radius: 4px;
  font: 700 11px var(--mono);
  letter-spacing: 0;
  text-decoration: none;
}

.hero-project-action {
  border: 1px solid var(--accent);
  color: #fff;
  background: var(--accent);
}

.enter-button {
  width: auto;
  margin: 0;
  border: 1px solid var(--line);
  color: var(--ink);
  background: rgba(17, 19, 21, 0.36);
}
```

Give `.hero-project-action` the same hover and focus-visible treatment as `.project-entry`. Add it to the reduced-motion selector.

In the mobile range, keep both actions at least 44px tall and allow them to share a row only when their labels fit:

```css
@media (max-width: 620px) {
  .hero-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .hero-project-action,
  .enter-button {
    width: 100%;
  }
}
```

- [ ] **Step 6: Run the focused tests and verify pass**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test header-layout.test.mjs english-copy.test.mjs
```

Expected: PASS with English default copy, bilingual action labels, and exactly one primary and one secondary homepage action.

- [ ] **Step 7: Commit the homepage entry**

```bash
git add index.html script.js styles.css header-layout.test.mjs
git commit -m "Add homepage project action"
```

---

### Task 3: Rebuild the Planner First Screen Around the Approved Split Layout

**Files:**
- Modify: `project-planner.test.mjs`
- Modify: `responsive-layout.test.mjs`
- Modify: `pages/project.html`
- Modify: `project.css`
- Verify unchanged: `project.js`

**Interfaces:**
- Consumes: all existing `data-project-planner`, `data-planner-step`, `data-progress-step`, vehicle field, goal, direction, review, error, back, next, and submit selectors used by `project.js`.
- Produces: `.project-controls-heading`, `.project-lede`, a direct progress rail, a 39/61 desktop workspace, and one uncaptioned `case-02.jpg` media panel.

- [ ] **Step 1: Write failing planner structure and media tests**

Update the first structural test in `project-planner.test.mjs`:

```js
test("planner exposes the approved compact split structure", () => {
  assert.equal((html.match(/data-planner-step=/g) || []).length, 4);
  assert.match(html, /<ol class="project-progress"/);
  assert.match(html, /class="project-controls-heading"/);
  assert.match(html, /id="project-title" data-en="BUILD YOUR PROJECT" data-zh="规划你的项目"/);
  assert.match(
    html,
    /class="project-lede" data-en="Define your vehicle and goals\." data-zh="填写车辆信息与改装目标。"/
  );
  assert.match(html, /assets\/images\/网页\/optimized\/case-02\.jpg/);
  assert.doesNotMatch(html, /class="project-heading"/);
  assert.doesNotMatch(html, /<figcaption/);
  assert.equal((html.match(/data-planner-submit/g) || []).length, 1);
});
```

Retain all existing behavioral tests below it.

Update the planner layout test in `responsive-layout.test.mjs`:

```js
assert.match(
  projectCss,
  /\.project-workspace\s*\{[^}]*grid-template-columns:\s*minmax\(420px,\s*39fr\)\s+minmax\(0,\s*61fr\)/s
);
assert.match(
  projectCss,
  /\.project-visual\s*\{[^}]*min-height:\s*100%[^}]*overflow:\s*hidden/s
);
assert.match(
  projectCss,
  /\.project-visual img\s*\{[^}]*object-fit:\s*cover[^}]*object-position:\s*center 62%/s
);
assert.doesNotMatch(projectCss, /transform:\s*scale\(/);
assert.doesNotMatch(projectCss, /\.project-visual img\s*\{[^}]*transition:[^}]*transform/s);
```

- [ ] **Step 2: Run planner tests and verify failure**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test project-planner.test.mjs responsive-layout.test.mjs
```

Expected: FAIL because the oversized heading, 0.86/1.14 split, `case-01.jpg`, and figcaption are still present.

- [ ] **Step 3: Replace the planner heading and media markup**

In `pages/project.html`:

1. Delete the entire `.project-heading`.
2. Keep `.project-progress` directly after the global header.
3. Add this as the first child of `.project-controls`:

```html
<header class="project-controls-heading">
  <p class="project-kicker" data-en="PROJECT PLANNER · 01–04" data-zh="项目规划 · 01–04">PROJECT PLANNER · 01–04</p>
  <h1 id="project-title" data-en="BUILD YOUR PROJECT" data-zh="规划你的项目">BUILD YOUR PROJECT</h1>
  <p class="project-lede" data-en="Define your vehicle and goals." data-zh="填写车辆信息与改装目标。">Define your vehicle and goals.</p>
</header>
```

4. Keep every existing step section and all `data-*` hooks unchanged.
5. Replace the media figure with:

```html
<figure class="project-visual">
  <img
    src="../assets/images/网页/optimized/case-02.jpg"
    alt="Pink BMW G80 M3 project vehicle"
    data-en-alt="Pink BMW G80 M3 project vehicle"
    data-zh-alt="粉色 BMW G80 M3 项目车辆"
  />
</figure>
```

- [ ] **Step 4: Implement the compact 39/61 desktop workspace**

Replace the obsolete `.project-heading` rules and current workspace sizing in `project.css` with:

```css
.project-planner {
  min-height: min(calc(100vh - var(--site-header-height)), var(--site-first-screen-max));
  background: #111315;
}

.project-progress {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 0 var(--site-gutter);
  border-bottom: 1px solid var(--line);
  list-style: none;
}

.project-workspace {
  display: grid;
  grid-template-columns: minmax(420px, 39fr) minmax(0, 61fr);
  min-height: min(
    calc(100vh - var(--site-header-height) - 68px),
    calc(var(--site-first-screen-max) - 68px)
  );
}

.project-controls {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: clamp(30px, 3.2vw, 56px);
}

.project-controls-heading {
  margin-bottom: clamp(24px, 3vw, 42px);
}

.project-controls-heading h1 {
  max-width: 560px;
  margin: 14px 0 10px;
  font-size: clamp(38px, 3.4vw, 58px);
  line-height: 0.94;
  letter-spacing: 0;
}

.project-lede {
  max-width: 440px;
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

.project-controls > section:not([hidden]) {
  flex: 1;
}

.project-controls h2 {
  max-width: 620px;
  padding: 14px 0 clamp(22px, 2.4vw, 36px);
  font-size: clamp(26px, 2.4vw, 42px);
  line-height: 1;
}

.project-actions {
  margin-top: auto;
}
```

Keep the existing form, choice, review, validation, active-blue, and focus-visible rules. Make the next or submit action visually dominant and full-width within the available action area without reducing the Back touch target:

```css
.project-actions [data-planner-next],
.project-actions [data-planner-submit] {
  min-width: min(100%, 280px);
  border-color: var(--accent);
  color: #fff;
  background: var(--accent);
}
```

- [ ] **Step 5: Make the image panel clean and stable**

Replace the current media and caption rules with:

```css
.project-visual {
  position: relative;
  min-width: 0;
  min-height: 100%;
  overflow: hidden;
  margin: 0;
  border-left: 1px solid var(--line);
  background: #0d0f11;
}

.project-visual img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 62%;
}
```

Do not add captions, labels, zoom, parallax, or transform animation.

- [ ] **Step 6: Preserve tablet and mobile behavior**

Keep the stack breakpoint at 1100px, but reset the desktop first-screen height when stacked:

```css
@media (max-width: 1100px) {
  .project-workspace {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .project-controls > section:not([hidden]) {
    min-height: 0;
  }

  .project-visual {
    min-height: 0;
    aspect-ratio: 16 / 10;
    border-top: 1px solid var(--line);
    border-left: 0;
  }
}
```

In the existing mobile range:

```css
.project-controls {
  padding: 24px var(--site-gutter);
  padding-bottom: calc(92px + env(safe-area-inset-bottom));
}

.project-controls-heading {
  margin-bottom: 22px;
}

.project-controls-heading h1 {
  font-size: 36px;
}

.project-lede {
  font-size: 13px;
}

.project-visual {
  aspect-ratio: 4 / 3;
}
```

Retain the existing four-column progress rail and sticky action bar above the 64px mobile navigation.

- [ ] **Step 7: Run planner and regression tests**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test project-planner.test.mjs responsive-layout.test.mjs shop-product.test.mjs contact-form.test.mjs
```

Expected: PASS, including unchanged Shop hydration and Contact handoff.

- [ ] **Step 8: Commit the planner redesign**

```bash
git add pages/project.html project.css project-planner.test.mjs responsive-layout.test.mjs
git commit -m "Redesign project planner workspace"
```

---

### Task 4: Verify the Complete Experience

**Files:**
- Verify: all tracked site files and tests
- Do not modify: `audit/`

**Interfaces:**
- Consumes: completed global header CTA, homepage action row, and planner redesign.
- Produces: automated and visual acceptance evidence for desktop, tablet, mobile, keyboard, language switching, and handoff behavior.

- [ ] **Step 1: Check JavaScript syntax**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check script.js
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check content-pages.js
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check project.js
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check scripts/render-detail-pages.mjs
```

Expected: four successful exits with no syntax output.

- [ ] **Step 2: Run the complete automated suite**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test
```

Expected: all tests pass with zero failures, cancellations, or skipped tests.

- [ ] **Step 3: Check generated files and worktree scope**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only planned tracked files are modified, and `audit/` remains untracked and unstaged.

- [ ] **Step 4: Start the local preview**

Run:

```bash
python3 -m http.server 4206 --bind 127.0.0.1
```

Expected: `http://127.0.0.1:4206/index.html` and `http://127.0.0.1:4206/pages/project.html` load successfully.

- [ ] **Step 5: Verify 1728 x 1050 desktop**

Check:

- all page headers show `START PROJECT` before the language toggle;
- the homepage first screen shows `START YOUR PROJECT →` and `VIEW SERVICES` above the case list;
- the project page has no oversized intermediate title band;
- progress rail sits directly below the header;
- controls and pink BMW occupy approximately 39% and 61%;
- the image has no caption or overlay;
- every planner step advances, returns, retains selections, and reaches review;
- the final link points to `pages/contact.html` with the expected allowlisted query fields;
- no horizontal overflow or clipped header text.

- [ ] **Step 6: Verify 1024 x 768 tablet**

Check:

- full `START PROJECT` label remains readable;
- five center navigation links, project CTA, and language toggle do not overlap;
- planner uses the stack breakpoint cleanly;
- the progress rail retains four readable steps;
- the pink BMW crop keeps the front of the car visible;
- all controls remain at least 44px tall.

- [ ] **Step 7: Verify 390 x 844 mobile**

Check:

- brand, `BUILD`, and language toggle share one header row without overflow;
- the five-link bottom navigation remains fixed and unobscured;
- homepage primary and secondary actions stack cleanly;
- planner progress remains four columns without horizontal scrolling;
- sticky Back/Continue controls remain above the bottom navigation;
- page content and pink BMW image remain visible without text clipping.

- [ ] **Step 8: Verify language, keyboard, and reduced motion**

Check:

- English is shown on a fresh session;
- language toggle changes `START PROJECT` to `开始项目`, mobile `BUILD` to `规划`, and homepage CTA to `开始你的项目 →`;
- Tab reaches the header project CTA, both homepage actions, all planner controls, and the final handoff link;
- every focused control has a visible blue outline;
- with reduced motion enabled, CTA and selection transitions are disabled.
