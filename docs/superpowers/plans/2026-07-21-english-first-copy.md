# English-First Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all 17 public pages open in polished American English, retain Chinese only within the active tab after a manual switch, and standardize automotive terminology across visible copy, metadata, accessibility text, forms, scripts, and generated detail pages.

**Architecture:** Keep the existing two language controllers and static bilingual attributes, but replace persistent `localStorage` with tab-scoped `sessionStorage` and make English the HTML and JavaScript fallback. Treat `detail-pages-data.mjs` plus `scripts/render-detail-pages.mjs` as the source of truth for 12 generated detail pages; keep the homepage and four editorial index pages in their current owning files.

**Tech Stack:** Static HTML, CSS, browser JavaScript, Node.js ESM generators, Node's built-in test runner

## Global Constraints

- Use concise, professional American English.
- Preserve all approved Chinese copy.
- Preserve layout, spacing, typography, images, colors, animations, and interaction behavior.
- Keep `CASES` and `CASE FILES` as editorial interface language.
- Use `build` and `project` in normal prose.
- Use the canonical service names `Custom Vehicle Builds`, `Performance Parts`, `Automotive Photography`, `ECU Calibration`, `Chassis Setup`, and `Intake & Exhaust`.
- Use `Mercedes-Benz`, never standalone `BENZ`, in customer-facing English.
- A fresh tab or reopened site starts in English.
- A manual Chinese selection persists only while navigating in the same tab.
- Do not add performance, emissions, warranty, pricing, or legal claims.
- Continue in the existing isolated `link-closure` worktree on branch `agent/english-copy-default`.

## File Map

- Create `english-copy.test.mjs`: full English-first, terminology, source-parity, and session-language regression contract.
- Modify `content-pages.js`: shared content-page language initialization, tab-scoped preference, navigation, form status, and email labels.
- Modify `script.js`: homepage language initialization, English translation dictionary, case summaries, and service summaries.
- Modify `index.html`: English-first homepage markup, metadata, language toggle, and initial card copy.
- Modify `pages/about.html`: English-first about copy, metadata, and accessibility defaults.
- Modify `pages/services.html`: English-first canonical service copy and metadata.
- Modify `pages/cases.html`: English-first case archive copy, brand terminology, metadata, and filter labels.
- Modify `pages/cases.js`: bilingual active-filter label using `ALL MAKES` and `全部品牌`.
- Modify `pages/contact.html`: English-first inquiry copy, canonical service options, placeholders, metadata, and accessibility defaults.
- Modify `detail-pages-data.mjs`: canonical English copy and English metadata for six cases and six services.
- Modify `scripts/render-detail-pages.mjs`: English-first generated markup and metadata.
- Regenerate `pages/cases/case-01.html` through `case-06.html` and all six files under `pages/services/`.

---

### Task 1: Lock And Implement The English-First Language Contract

**Files:**
- Create: `english-copy.test.mjs`
- Modify: `content-pages.js`
- Modify: `script.js`
- Modify: `index.html`
- Modify: `pages/about.html`
- Modify: `pages/services.html`
- Modify: `pages/cases.html`
- Modify: `pages/contact.html`
- Modify: `scripts/render-detail-pages.mjs`
- Regenerate: `pages/cases/*.html`
- Regenerate: `pages/services/*.html`

**Interfaces:**
- Consumes: existing `data-zh`, `data-en`, `data-lang-option`, and bilingual attribute conventions.
- Produces: `getInitialLanguage(): "zh" | "en"`, `setStoredLanguage(language)`, English-first HTML, and tab-scoped `lonma-language` state.

- [ ] **Step 1: Write the failing English-first contract test**

Create `english-copy.test.mjs` with this public-page matrix and direct-text helper:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const publicPages = [
  "./index.html",
  "./pages/about.html",
  "./pages/services.html",
  "./pages/services/build.html",
  "./pages/services/parts.html",
  "./pages/services/photo.html",
  "./pages/services/ecu.html",
  "./pages/services/chassis.html",
  "./pages/services/exhaust.html",
  "./pages/cases.html",
  "./pages/cases/case-01.html",
  "./pages/cases/case-02.html",
  "./pages/cases/case-03.html",
  "./pages/cases/case-04.html",
  "./pages/cases/case-05.html",
  "./pages/cases/case-06.html",
  "./pages/contact.html",
];

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const decode = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

test("all public pages ship English-first markup", () => {
  for (const path of publicPages) {
    const html = read(path);
    assert.match(html, /<html lang="en">/, `${path} should declare English`);
    assert.match(
      html,
      /<span class="lang-option is-current" data-lang-option="en">EN<\/span>/,
      `${path} should mark English current`,
    );
    assert.doesNotMatch(
      html,
      /<span class="lang-option is-current" data-lang-option="zh">中<\/span>/,
      `${path} should not mark Chinese current`,
    );

    const directBilingualNodes = [
      ...html.matchAll(/<([a-z][\w-]*)\b([^>]*\bdata-en="([^"]*)"[^>]*)>([^<]*)<\/\1>/gi),
    ];
    assert.ok(directBilingualNodes.length > 0, `${path} should expose bilingual direct text`);
    for (const match of directBilingualNodes) {
      assert.equal(match[4].trim(), decode(match[3]).trim(), `${path} should render data-en first`);
    }
  }
});

test("language controllers keep preference within one tab only", () => {
  for (const path of ["./script.js", "./content-pages.js"]) {
    const source = read(path);
    assert.match(source, /sessionStorage\.getItem\("lonma-language"\)/);
    assert.match(source, /sessionStorage\.setItem\("lonma-language", language\)/);
    assert.doesNotMatch(source, /localStorage\.(?:getItem|setItem)\("lonma-language"/);
    assert.match(source, /supportedLanguages\.includes\(language\) \? language : "en"/);
  }
});
```

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test english-copy.test.mjs
```

Expected: FAIL because pages declare `zh-CN`, Chinese is initially current, visible bilingual text is Chinese, and the controllers use `localStorage`.

- [ ] **Step 3: Replace persistent language storage with tab-scoped storage**

In both controllers, use the same guarded behavior:

```js
function getInitialLanguage() {
  try {
    const savedLanguage = sessionStorage.getItem("lonma-language");
    if (supportedLanguages.includes(savedLanguage)) {
      return savedLanguage;
    }
  } catch {
    // Storage can be unavailable in local previews without affecting page use.
  }

  return "en";
}

function setStoredLanguage(language) {
  try {
    sessionStorage.setItem("lonma-language", language);
  } catch {
    // Keep the current page functional when storage is unavailable.
  }
}
```

Change both invalid-language fallbacks to English:

```js
currentLanguage = supportedLanguages.includes(language) ? language : "en";
```

In `script.js`, call `setStoredLanguage(currentLanguage)` instead of writing directly to storage and use `translations.en` as the missing-key fallback.

- [ ] **Step 4: Make all hand-authored HTML English-first**

For `index.html`, `pages/about.html`, `pages/services.html`, `pages/cases.html`, and `pages/contact.html`:

```html
<html lang="en">
```

Use this language control as the initial state:

```html
<button class="lang-toggle" type="button" aria-label="切换到中文">
  <span class="lang-option" data-lang-option="zh">中</span>
  <span class="lang-separator" aria-hidden="true">/</span>
  <span class="lang-option is-current" data-lang-option="en">EN</span>
</button>
```

For every direct bilingual element, placeholder, `aria-label`, and meaningful `alt`, copy the `data-en` value into the initial live attribute or text content. Keep the `data-zh` value unchanged.

- [ ] **Step 5: Make generated detail markup English-first**

Change the generator helpers to render English initially:

```js
const i18n = (tag, values, attributes = "") =>
  `<${tag}${attributes} data-zh="${escapeAttribute(values.zh)}" data-en="${escapeAttribute(values.en)}">${values.en}</${tag}>`;
const i18nAttribute = (attribute, values) =>
  `${attribute}="${escapeAttribute(values.en)}" data-zh-${attribute}="${escapeAttribute(values.zh)}" data-en-${attribute}="${escapeAttribute(values.en)}"`;
```

Render English navigation, footer, and toggle defaults:

```html
<html lang="en">
<a href="../about.html">ABOUT</a>
<a href="../services.html">SERVICES</a>
<a href="../cases.html">CASES</a>
<a href="../contact.html">CONTACT</a>
<button class="lang-toggle" type="button" aria-label="切换到中文">
  <span class="lang-option" data-lang-option="zh">中</span>
  <span class="lang-separator" aria-hidden="true">/</span>
  <span class="lang-option is-current" data-lang-option="en">EN</span>
</button>
```

Render the global footer initially as `AUTOMOTIVE ATTITUDE · 2026` and `START YOUR PROJECT →`.

- [ ] **Step 6: Regenerate the twelve detail pages**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/render-detail-pages.mjs
```

Expected: six case files and six service files are rewritten from the generator.

- [ ] **Step 7: Run the focused and existing shell tests**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test english-copy.test.mjs global-shell.test.mjs header-layout.test.mjs
```

Expected: PASS. Update old tests only where they assert the former Chinese-first contract; do not weaken header, footer, or accessibility coverage.

- [ ] **Step 8: Commit the English-first behavior**

```bash
git add english-copy.test.mjs content-pages.js script.js index.html pages scripts/render-detail-pages.mjs
git commit -m "Make public pages English first"
```

---

### Task 2: Standardize Homepage Automotive Copy

**Files:**
- Modify: `english-copy.test.mjs`
- Modify: `script.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: homepage `translations`, `details`, `serviceCtaText`, and matching initial HTML.
- Produces: canonical homepage service names and natural case/project summaries.

- [ ] **Step 1: Add failing homepage terminology assertions**

Append:

```js
test("homepage uses canonical automotive service language", () => {
  const source = `${read("./index.html")}\n${read("./script.js")}`;
  for (const phrase of [
    "CORE SERVICES",
    "Custom Vehicle Builds",
    "Performance Parts",
    "Automotive Photography",
    "ECU Calibration",
    "Chassis Setup",
    "Intake & Exhaust",
  ]) {
    assert.match(source, new RegExp(phrase.replace(/[&]/g, "&(?:amp;)?"), "i"), `missing ${phrase}`);
  }
  for (const pattern of [
    /BUSINESS MODULES/i,
    /en:\s*"Automotive Photo"/i,
    /performance release/i,
    /road refinement/i,
  ]) {
    assert.doesNotMatch(source, pattern, `remove ${pattern}`);
  }
});
```

- [ ] **Step 2: Run the test and verify it fails on the old phrases**

Run the focused test. Expected: FAIL on `BUSINESS MODULES`, `Automotive Photo`, and `road refinement`.

- [ ] **Step 3: Replace homepage interface copy**

Use these exact English interface strings in `script.js` and matching initial HTML:

```text
Hero note: Six featured builds introduce LONMA DYNAMIC, followed by the workshop's six core services.
Case heading: LONMA-26-R1 · FEATURED BUILDS · 06 OF 36
Case list ARIA: Featured build list
Case panel ARIA: Featured build cards
Selection status: ● CURRENT SELECTION
Services section ARIA: Core services
Services heading: CORE SERVICES
Services count: 06 SERVICES · 03 × 02
```

- [ ] **Step 4: Replace homepage service copy**

Use these exact names and descriptions in the six service records:

```text
Custom Vehicle Builds — Exterior, wheels, suspension, and braking upgrades developed around one complete vehicle.
Performance Parts — A curated selection of performance, exterior, wheel, suspension, and OEM-grade components.
Automotive Photography — Still photography, rolling shots, short films, and social content created around the car.
ECU Calibration — Custom ECU calibration, data logging, road testing, and staged upgrade planning.
Chassis Setup — Ride height, wheel fitment, alignment, and chassis settings for street or track use.
Intake & Exhaust — Intake, downpipe, mid-pipe, and axle-back upgrades tuned for sound and response.
```

- [ ] **Step 5: Replace homepage case summaries**

Use these exact titles and summaries:

```text
Street Widebody — A street-focused widebody build shaped around daily drivability, wheel fitment, braking, and a more assertive stance.
Road & Track Setup — Braking, chassis support, weight, and tire grip developed for repeatable performance on road and track.
Low Stance — Ride height, wheel fitment, and body clearance tuned together for a clean, usable low stance.
Turbo Tuning — Intake, exhaust, boost control, and ECU calibration matched for stronger, more predictable power delivery.
Automotive Media Feature — Exterior detail, lighting, location, and motion planned as one complete automotive media feature.
Blue Performance Build — Exterior, chassis, and power delivery developed around a single performance objective.
```

- [ ] **Step 6: Add an English homepage meta description and update the cache key**

Use:

```html
<meta name="description" content="LONMA DYNAMIC creates complete vehicle builds, supplies performance parts, produces automotive photography, and provides ECU calibration, chassis setup, and intake and exhaust upgrades." />
```

Increment the `script.js` query string in `index.html` so the deployed page cannot retain the previous translation dictionary.

- [ ] **Step 7: Run focused tests and commit**

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test english-copy.test.mjs sanity.test.mjs
git add english-copy.test.mjs script.js index.html
git commit -m "Refine homepage automotive copy"
```

Expected: both tests PASS.

---

### Task 3: Rewrite About, Services, Cases, And Contact Copy

**Files:**
- Modify: `english-copy.test.mjs`
- Modify: `pages/about.html`
- Modify: `pages/services.html`
- Modify: `pages/cases.html`
- Modify: `pages/cases.js`
- Modify: `pages/contact.html`
- Modify: `content-pages.js`

**Interfaces:**
- Consumes: shared bilingual attributes and canonical service names from Task 2.
- Produces: natural English editorial pages, `ALL MAKES` filtering, and an English inquiry flow.

- [ ] **Step 1: Add failing editorial-page assertions**

Append:

```js
test("editorial pages use the approved English copy system", () => {
  const about = read("./pages/about.html");
  const services = read("./pages/services.html");
  const cases = `${read("./pages/cases.html")}\n${read("./pages/cases.js")}`;
  const contact = read("./pages/contact.html");

  assert.match(about, /BUILT THROUGH ITERATION\./);
  assert.match(services, /FROM VISION TO COMPLETE BUILD/);
  assert.match(cases, /PROJECT ARCHIVE · LONMA ATTITUDE/);
  assert.match(cases, /ALL MAKES/);
  assert.match(cases, /MERCEDES-BENZ/);
  assert.doesNotMatch(cases, />BENZ</);
  assert.match(contact, /SEND PROJECT INQUIRY/);
  assert.match(contact, /WHAT DO YOU WANT TO CHANGE\?/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Expected: FAIL on all new approved phrases.

- [ ] **Step 3: Rewrite the about page**

Use:

```text
Hero: BUILT THROUGH ITERATION.
Local title: BUILT THROUGH CHANGE, TESTING, AND REFINEMENT.
Intro: We establish a complete direction for the car, drive it, document its behavior, review the results, and refine it again. A build does not end with installation; it takes shape through iteration.
Observe: Understand the car, how it is used, and what needs to change.
Modify: Make purposeful, measurable changes around one complete direction.
Test: Evaluate the car on real roads and under real driving conditions.
Refine: Review the data and driver feedback, refine the setup, and return to the road.
People / Machines: The best decisions happen with people present and cars in motion.
```

Set the meta description to `Learn how LONMA DYNAMIC develops complete vehicle builds through observation, purposeful modification, real-world testing, and refinement.`

- [ ] **Step 4: Rewrite the services index**

Use:

```text
Headline: FROM VISION TO COMPLETE BUILD
Intro: Six core services support the complete build process. Specialized work and repeated testing stay focused on the final driving experience.
```

Use the six canonical names and descriptions from Task 2. Keep `PRECISION WORK. DRIVING OBSESSION.` unchanged.

Set the meta description to `Explore LONMA DYNAMIC services for custom vehicle builds, performance parts, automotive photography, ECU calibration, chassis setup, and intake and exhaust upgrades.`

- [ ] **Step 5: Rewrite the cases index and active filter**

Use:

```text
Eyebrow: 06 FEATURED BUILDS
Local title: PROJECT ARCHIVE · LONMA ATTITUDE
Hero description: From exterior design and chassis setup to ECU calibration, each case study documents one complete direction for the car.
Filter category: MAKE
All filter label: ALL MAKES
Archive count: 36 PERFORMANCE PROJECTS
Archive title: PROJECT ARCHIVE
Archive subtitle: LONMA PROJECT ARCHIVE · FILTER BY MAKE
```

Use `MERCEDES-BENZ` for the brand display while preserving `data-filter="benz"` and `data-brand="benz"` internally. Add bilingual values to the active all-makes label and make `pages/cases.js` read the current language:

```js
function getFilterLabel(filter) {
  if (filter !== "all") {
    return filter === "benz" ? "MERCEDES-BENZ" : filter.toUpperCase();
  }

  return document.body.dataset.lang === "zh" ? "全部品牌" : "ALL MAKES";
}
```

Set the meta description to `Explore LONMA DYNAMIC vehicle builds, including widebody, road and track, stance, turbo tuning, automotive media, and complete performance projects.`

- [ ] **Step 6: Rewrite the contact page and inquiry form**

Use:

```text
Hero local title: TELL US ABOUT YOUR CAR AND WHAT YOU WANT TO CHANGE
Inquiry heading: START WITH THE GOAL, NOT A PARTS LIST.
Inquiry intro: Share your vehicle details, the issue you want to solve, and the result you want to achieve. We will recommend a direction that fits the car and its intended use.
Message label: WHAT DO YOU WANT TO CHANGE?
Message placeholder: Describe the car's current setup, how you use it, and what you want to achieve
Submit: SEND PROJECT INQUIRY
```

Use the canonical service names in the select options. Set the meta description to `Contact LONMA DYNAMIC about your vehicle, current setup, intended use, and goals for a complete build or focused upgrade.`

Keep the generated email subject and body concise; change the success status to `Opening your email application…`.

- [ ] **Step 7: Run focused tests and commit**

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test english-copy.test.mjs content-pages.test.mjs cases-page.test.mjs
git add english-copy.test.mjs content-pages.js pages/about.html pages/services.html pages/cases.html pages/cases.js pages/contact.html
git commit -m "Refine editorial and inquiry copy"
```

Expected: all focused tests PASS.

---

### Task 4: Rewrite Canonical Detail Copy And Regenerate Pages

**Files:**
- Modify: `english-copy.test.mjs`
- Modify: `detail-pages-data.mjs`
- Modify: `scripts/render-detail-pages.mjs`
- Regenerate: `pages/cases/*.html`
- Regenerate: `pages/services/*.html`

**Interfaces:**
- Consumes: `caseDetails`, `serviceDetails`, `renderCasePage(record)`, and `renderServicePage(record)`.
- Produces: 12 English-first generated detail pages with copy and metadata matching the canonical records.

- [ ] **Step 1: Add failing canonical detail assertions**

Append:

```js
test("detail sources use approved case and service terminology", async () => {
  const { caseDetails, serviceDetails } = await import("./detail-pages-data.mjs");
  assert.deepEqual(serviceDetails.map((record) => record.title.en), [
    "CUSTOM VEHICLE BUILDS",
    "PERFORMANCE PARTS",
    "AUTOMOTIVE PHOTOGRAPHY",
    "ECU CALIBRATION",
    "CHASSIS SETUP",
    "INTAKE & EXHAUST",
  ]);
  assert.equal(caseDetails[3].subtitle.en, "POWER DELIVERY AND ROAD TESTING");
  assert.equal(caseDetails[5].title.en, "BLUE PERFORMANCE BUILD");
  for (const record of [...caseDetails, ...serviceDetails]) {
    assert.ok(record.meta, `${record.id} needs an English meta description`);
  }
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Expected: FAIL on old detail titles and missing `meta` fields.

- [ ] **Step 3: Replace the six case records with approved English copy**

Keep IDs, slugs, Chinese values, images, and pagination unchanged. Use:

```text
01 STREET WIDEBODY
Subtitle: A VISUAL BENCHMARK FOR THE LONMA LINEUP
Intro: Body proportions, wheel fitment, and ride height establish one complete direction for a street-focused build.
Story: The process began with the car's overall silhouette. Each change was evaluated, test-fitted, and road-tested before becoming part of the final build.

02 ROAD & TRACK SETUP
Subtitle: BALANCING ROAD AND TRACK
Intro: Braking, chassis feedback, and repeatable performance define a clearer road-and-track setup.
Story: There is no fixed answer. Vehicle feedback, tire condition, and real-world testing continue to shape each adjustment.

03 LOW STANCE
Subtitle: PROPORTION, RIDE HEIGHT, AND WHEEL FITMENT
Intro: Ride height, wheel fitment, and body clearance create a low, cohesive side profile.
Story: A low stance still has to work. Every change to ride height or fitment is checked for steering clearance, road usability, and visual balance.

04 TURBO TUNING
Subtitle: POWER DELIVERY AND ROAD TESTING
Intro: Staged calibration developed through vehicle health checks, data logging, and road testing.
Story: A calibration is not finished after one flash. Data logging, review, and road feedback determine each revision.

05 AUTOMOTIVE MEDIA FEATURE
Subtitle: TURNING VEHICLE CHARACTER INTO VISUAL CONTENT
Intro: Still photography, rolling shots, and short films capture the finished car's stance and details.
Story: Automotive media is not an afterthought. Camera angle, location, and motion reveal the car's proportions and character.

06 BLUE PERFORMANCE BUILD
Subtitle: ONE DIRECTION FOR PERFORMANCE AND DESIGN
Intro: Exterior, chassis, and power delivery are developed around one driving objective.
Story: A complete build is more than a parts list. The goal comes first, followed by repeated testing that keeps only the changes that improve the car.
```

Give each record a one-sentence English `meta` description containing `LONMA DYNAMIC`, the case number, the approved title, and its primary technical focus.

- [ ] **Step 4: Replace the six service records with approved English copy**

Use:

```text
CUSTOM VEHICLE BUILDS
Intro: Exterior, wheels, suspension, and braking upgrades developed around one complete vehicle.
Scope: We begin with the goal and visual references, then select components, test-fit, adjust, and review them on the actual vehicle.

PERFORMANCE PARTS
Intro: Curated performance, exterior, wheel, suspension, and OEM-grade components selected for the vehicle.
Scope: We match each part to the platform, intended use, current setup, and complete build direction before installation.

AUTOMOTIVE PHOTOGRAPHY
Intro: Still photography, rolling shots, short films, and social media content created around the car.
Scope: Location, timing, light, and vehicle presentation are planned as one visual direction across stills and motion.

ECU CALIBRATION
Intro: Custom ECU calibration, data logging, road testing, and staged upgrade planning.
Scope: We confirm the vehicle's condition and performance goals first, then refine throttle response and power delivery through data and road testing.

CHASSIS SETUP
Intro: Ride height, wheel fitment, alignment, and chassis settings for street or track use.
Scope: Ride height, clearance, and alignment are adjusted from real vehicle feedback so the stance supports both appearance and driving goals.

INTAKE & EXHAUST
Intro: Intake, downpipe, mid-pipe, and axle-back upgrades for sound, flow, and response.
Scope: We select and review each combination around the desired sound, intended road use, and current powertrain setup.
```

Give each service record a one-sentence English `meta` description. Change the process line to `ASSESS · PLAN · EXECUTE · VERIFY`.

- [ ] **Step 5: Render English metadata and regenerate**

Add this to both generated `<head>` blocks:

```html
<meta name="description" content="${escapeAttribute(record.meta)}" />
```

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/render-detail-pages.mjs
```

- [ ] **Step 6: Verify generated parity**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test english-copy.test.mjs case-detail.test.mjs link-closure.test.mjs
```

Expected: PASS with all generated pages English-first and source-aligned.

- [ ] **Step 7: Commit the canonical details**

```bash
git add english-copy.test.mjs detail-pages-data.mjs scripts/render-detail-pages.mjs pages/cases pages/services
git commit -m "Refine generated detail copy"
```

---

### Task 5: Full Regression And Browser Acceptance

**Files:**
- Modify only if verification exposes a scoped copy overflow or stale cache key.

**Interfaces:**
- Consumes: completed English-first site.
- Produces: automated and live-browser acceptance evidence.

- [ ] **Step 1: Run the full automated suite**

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test *.test.mjs
git diff --check
```

Expected: every test passes, zero failures, and no whitespace errors.

- [ ] **Step 2: Start the local static preview**

```bash
python3 -m http.server 4199
```

Expected: site available at `http://127.0.0.1:4199/`.

- [ ] **Step 3: Verify initial English and responsive layout**

Check homepage, services, cases, one case detail, one service detail, and contact at:

```text
2200 × 1100
1440 × 900
1156 × 900
390 × 844
```

At each size verify:

- English appears immediately;
- no translated text clips or overlaps;
- header, case rail, service rows, forms, and footers retain their layout;
- case masks and service hover previews still work on desktop;
- mobile layouts do not depend on hover.

- [ ] **Step 4: Verify language lifecycle**

In one tab:

1. Open the homepage and verify English.
2. Switch to Chinese.
3. Navigate to Services and Contact and verify Chinese remains active.
4. Open a fresh tab to the homepage and verify English returns.
5. Switch the fresh tab between English and Chinese and verify `lang`, toggle state, visible copy, placeholders, ARIA labels, and meaningful image alternatives update together.

- [ ] **Step 5: Review the final diff and commit any verification-only fixes**

```bash
git status -sb
git diff --stat
git diff --check
```

If no fixes were needed, do not create an empty commit. If scoped fixes were needed:

```bash
git add english-copy.test.mjs content-pages.js script.js index.html pages detail-pages-data.mjs scripts/render-detail-pages.mjs
git commit -m "Fix English copy verification findings"
```

- [ ] **Step 6: Stop before publishing**

Report test totals, browser sizes checked, language-lifecycle results, and the branch commit list. Do not push, merge, or deploy until the user explicitly requests upload and backup.
