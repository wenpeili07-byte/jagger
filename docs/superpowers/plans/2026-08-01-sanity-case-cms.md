# Sanity Case CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let editors manage the six published LONMA DYNAMIC case studies in Sanity while preserving every current static page as a complete fallback.

**Architecture:** The separately deployed Sanity Studio writes `casePage` documents to project `v54qppoy`, dataset `production`. Browser-side ES modules query only published documents, validate and normalize the response, then progressively update explicitly marked slots on the Cases overview and six detail pages. Existing HTML renders first and remains untouched whenever configuration, content, media, or network access is invalid.

**Tech Stack:** Static HTML/CSS, browser ES modules, Sanity Studio 3, GROQ, Sanity Image CDN, Node.js built-in test runner, Vercel static hosting.

## Global Constraints

- Do not redesign the homepage, Cases overview, Case detail pages, navigation, typography, spacing, animation, or responsive layout.
- Do not modify homepage, Services, Shop, About, Contact, or Project Planner content.
- English is the default and required CMS language; Chinese falls back to English and then existing static copy.
- Never expose a Sanity write/read token in browser code; only public published content may be queried.
- Keep every current repository image and responsive derivative; never overwrite or delete source photography.
- Insert CMS text with `textContent` and safe attributes only; never assign CMS content through `innerHTML`.
- Preserve Case 02's video-led layout, poster-only fallback, and reduced-motion behavior.
- Keep `audit/` and every unrelated local or untracked file outside all commits.
- Every task follows red-green-refactor testing and ends with a focused commit.

## File Map

- `sanity/schemaTypes/localizedString.js`: reusable one-line English/Chinese fields.
- `sanity/schemaTypes/localizedText.js`: reusable multiline English/Chinese fields.
- `sanity/schemaTypes/caseImage.js`: uploaded image or existing public image path plus bilingual alt text.
- `sanity/schemaTypes/mediaSection.js`: one ordered photo-story block and its layout choice.
- `sanity/schemaTypes/casePage.js`: the complete editable case document.
- `sanity/schemaTypes/index.js`: schema registry.
- `sanity/structure.js`: case-first Studio list ordered by case number.
- `sanity/sanity.config.js`: real project configuration and custom Studio structure.
- `sanity-content-config.js`: browser-safe public project ID, dataset, and API version.
- `sanity-case-data.js`: GROQ construction, request timeout, validation, localization, and media normalization.
- `sanity-case-overview.js`: Cases rail/archive updates only.
- `sanity-case-detail.js`: shared Case detail and photo-story updates, including optional video.
- `case-detail.css`: unframed photo-story layout using the existing visual system.
- `content-pages.js`: reapply the current language after asynchronous CMS updates.
- `scripts/render-detail-pages.mjs`: durable CMS markers in all generated Case pages.
- `scripts/build-sanity-seed.mjs`: deterministic six-document NDJSON generator.
- `sanity/seed/case-pages.ndjson`: importable first-release case records.
- `sanity-case-data.test.mjs`: pure data and safety tests.
- `sanity-case-overview.test.mjs`: Cases overview mapping and fallback tests.
- `sanity-case-detail.test.mjs`: detail rendering, bilingual refresh, gallery, and video tests.
- `sanity-seed.test.mjs`: deterministic seed coverage.
- Existing `sanity.test.mjs`, `cases-page.test.mjs`, `case-detail.test.mjs`, `case-02.test.mjs`, `content-pages.test.mjs`, and `image-performance.test.mjs`: regression guards.

---

### Task 1: Production Case Schema And Studio Structure

**Files:**
- Create: `sanity/schemaTypes/localizedString.js`
- Create: `sanity/schemaTypes/localizedText.js`
- Create: `sanity/schemaTypes/caseImage.js`
- Create: `sanity/schemaTypes/mediaSection.js`
- Create: `sanity/structure.js`
- Modify: `sanity/schemaTypes/casePage.js`
- Modify: `sanity/schemaTypes/index.js`
- Modify: `sanity/sanity.config.js`
- Modify: `sanity.test.mjs`
- Modify: `sanity/package-lock.json` after dependency installation

**Interfaces:**
- Produces: Sanity types `localizedString`, `localizedText`, `caseImage`, `mediaSection`, and `casePage`.
- Produces: `caseStructure(S)` passed to `structureTool({structure: caseStructure})`.
- Consumes: Sanity's `defineType`, `defineField`, `defineArrayMember`, and Structure Builder API.

- [ ] **Step 1: Write failing schema registration tests**

Add exact file reads and assertions to `sanity.test.mjs`:

```js
const localizedString = readFileSync(new URL("./sanity/schemaTypes/localizedString.js", import.meta.url), "utf8");
const localizedText = readFileSync(new URL("./sanity/schemaTypes/localizedText.js", import.meta.url), "utf8");
const caseImage = readFileSync(new URL("./sanity/schemaTypes/caseImage.js", import.meta.url), "utf8");
const mediaSection = readFileSync(new URL("./sanity/schemaTypes/mediaSection.js", import.meta.url), "utf8");
const structure = readFileSync(new URL("./sanity/structure.js", import.meta.url), "utf8");

assert.match(localizedString, /name:\s*'localizedString'/);
assert.match(localizedString, /name:\s*'en'[\s\S]*required\(\)/);
assert.match(localizedString, /name:\s*'zh'/);
assert.match(localizedText, /name:\s*'localizedText'/);
assert.match(caseImage, /name:\s*'caseImage'/);
assert.match(caseImage, /name:\s*'imagePath'/);
assert.match(mediaSection, /value:\s*'full'/);
assert.match(mediaSection, /value:\s*'textLeft'/);
assert.match(mediaSection, /value:\s*'textRight'/);
assert.match(caseSchema, /name:\s*'order'/);
assert.match(caseSchema, /name:\s*'brand'/);
assert.match(caseSchema, /name:\s*'vehicle'/);
assert.match(caseSchema, /name:\s*'seo'/);
assert.match(structure, /order\(\[\{field:\s*'order',\s*direction:\s*'asc'\}\]\)/);
assert.match(config, /projectId:\s*env\.SANITY_STUDIO_PROJECT_ID\s*\|\|\s*'v54qppoy'/);
```

- [ ] **Step 2: Run the schema test and verify it fails**

Run: `node --test sanity.test.mjs`

Expected: FAIL because the four reusable schema files and `structure.js` do not exist.

- [ ] **Step 3: Implement localized and image schema units**

Create the reusable localized type using this shape, and use the same fields with `text` and `rows: 4` in `localizedText.js`:

```js
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'localizedString',
  title: 'Localized String',
  type: 'object',
  options: {columns: 2},
  fields: [
    defineField({name: 'en', title: 'English', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'zh', title: 'Chinese', type: 'string'}),
  ],
})
```

Create `caseImage.js` with exactly these content fields:

```js
fields: [
  defineField({name: 'asset', title: 'Upload Image', type: 'image', options: {hotspot: true}}),
  defineField({
    name: 'imagePath',
    title: 'Existing Site Image Path',
    type: 'string',
    validation: (Rule) => Rule.custom((value) => !value || value.startsWith('/assets/images/') || 'Use an /assets/images/ path'),
  }),
  defineField({name: 'alt', title: 'Alt Text', type: 'localizedString'}),
]
```

- [ ] **Step 4: Implement media sections and the full Case document**

Define `mediaSection` as an object with `image: caseImage`, `heading: localizedString`, `body: localizedText`, and a required layout list:

```js
defineField({
  name: 'layout',
  title: 'Layout',
  type: 'string',
  initialValue: 'full',
  options: {
    layout: 'radio',
    list: [
      {title: 'Full Width', value: 'full'},
      {title: 'Text Left', value: 'textLeft'},
      {title: 'Text Right', value: 'textRight'},
    ],
  },
  validation: (Rule) => Rule.required(),
})
```

Replace `casePage.js` fields with the approved model: `caseNumber`, `slug`, `order`, `brand`, `featured`, `vehicle`, `title`, `subtitle`, `lede`, `story`, `cover`, `video`, `mediaSections`, and `seo`. Use `Rule.required().integer().min(1).max(6)` for `order`; use list values `bmw`, `audi`, and `mercedes-benz` for `brand`; accept only HTTPS in `video.externalUrl`; and define an uploaded file field with `options: {accept: 'video/mp4'}`.

- [ ] **Step 5: Register types and case-first Studio navigation**

Export all five types from `schemaTypes/index.js`. Create `caseStructure` as:

```js
export const caseStructure = (S) =>
  S.list()
    .title('LONMA DYNAMIC Content')
    .items([
      S.listItem()
        .title('Case Pages')
        .schemaType('casePage')
        .child(S.documentTypeList('casePage').title('Case Pages').order([{field: 'order', direction: 'asc'}])),
    ])
```

Update `sanity.config.js` to use project `v54qppoy`, dataset `production`, API date `2026-08-01`, and `structureTool({structure: caseStructure})`.

- [ ] **Step 6: Install dependencies, run tests, and build Studio**

Run:

```bash
node --test sanity.test.mjs
cd sanity
npm install
npm run build
```

Expected: the schema test passes and the Studio build exits 0 without schema errors.

- [ ] **Step 7: Commit the schema deliverable**

```bash
git add sanity sanity.test.mjs
git commit -m "Build production Sanity case schema"
```

---

### Task 2: Public Case Query And Normalization Boundary

**Files:**
- Create: `sanity-content-config.js`
- Create: `sanity-case-data.js`
- Create: `sanity-case-data.test.mjs`

**Interfaces:**
- Produces: `sanityPublicConfig: Readonly<{projectId: string, dataset: string, apiVersion: string}>`.
- Produces: `buildCaseQueryUrl(slug?: string): URL`.
- Produces: `fetchPublishedCases({slug, fetchImpl, timeoutMs}): Promise<NormalizedCase[]>`.
- Produces: `normalizeCaseRecord(record): NormalizedCase | null`.
- Produces: `normalizeLocalized(value, fallback): {en: string, zh: string}`.
- Produces: `isSafeMediaUrl(value): boolean` and `buildResponsiveSanityImage(image): NormalizedImage | null`.

- [ ] **Step 1: Write failing normalization and URL tests**

Create `sanity-case-data.test.mjs` with these core cases:

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildCaseQueryUrl,
  fetchPublishedCases,
  isSafeMediaUrl,
  normalizeCaseRecord,
  normalizeLocalized,
} from './sanity-case-data.js'

test('Chinese copy falls back to English', () => {
  assert.deepEqual(normalizeLocalized({en: 'STREET WIDEBODY', zh: ''}), {
    en: 'STREET WIDEBODY',
    zh: 'STREET WIDEBODY',
  })
})

test('unsafe media schemes are rejected', () => {
  assert.equal(isSafeMediaUrl('javascript:alert(1)'), false)
  assert.equal(isSafeMediaUrl('http://example.com/car.jpg'), false)
  assert.equal(isSafeMediaUrl('https://cdn.sanity.io/car.jpg'), true)
  assert.equal(isSafeMediaUrl('/assets/images/网页/optimized/case-01.jpg'), true)
})

test('detail query is restricted to a published slug', () => {
  const url = buildCaseQueryUrl('case-01')
  assert.equal(url.hostname, 'v54qppoy.api.sanity.io')
  assert.equal(url.searchParams.get('$slug'), '"case-01"')
  assert.match(url.searchParams.get('query'), /!\(_id in path\("drafts\.\*"\)\)/)
})

test('invalid records never replace static content', () => {
  assert.equal(normalizeCaseRecord({slug: 'case-01'}), null)
})
```

- [ ] **Step 2: Run the data test and verify it fails**

Run: `node --test sanity-case-data.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `sanity-case-data.js`.

- [ ] **Step 3: Add the browser-safe public configuration**

Create `sanity-content-config.js`:

```js
export const sanityPublicConfig = Object.freeze({
  projectId: 'v54qppoy',
  dataset: 'production',
  apiVersion: '2026-08-01',
})
```

- [ ] **Step 4: Implement query construction and strict normalization**

Use one field projection for overview and detail requests. Dereference image and file assets inside GROQ so the browser receives public URLs and dimensions:

```js
const caseProjection = `{
  _id, caseNumber, "slug": slug.current, order, brand, featured,
  vehicle, title, subtitle, lede, story,
  cover{imagePath, alt, "asset": asset.asset->{url, metadata{dimensions}}},
  video{externalUrl, "fileUrl": file.asset->url,
    poster{imagePath, alt, "asset": asset.asset->{url, metadata{dimensions}}}},
  mediaSections[]{_key, layout, heading, body,
    image{imagePath, alt, "asset": asset.asset->{url, metadata{dimensions}}}},
  seo
}`

export function buildCaseQueryUrl(slug) {
  const query = slug
    ? `*[_type == "casePage" && !(_id in path("drafts.*")) && slug.current == $slug][0]${caseProjection}`
    : `*[_type == "casePage" && !(_id in path("drafts.*"))] | order(order asc) ${caseProjection}`
  const url = new URL(`https://${sanityPublicConfig.projectId}.api.sanity.io/v${sanityPublicConfig.apiVersion}/data/query/${sanityPublicConfig.dataset}`)
  url.searchParams.set('query', query)
  if (slug) url.searchParams.set('$slug', JSON.stringify(slug))
  return url
}
```

Normalize only records with a `case-01` through `case-06` slug, integer order 1 through 6, approved brand, non-empty English title, and valid cover source. Accept image CDN URLs only over HTTPS and local paths only below `/assets/images/` or `/assets/videos/`.

- [ ] **Step 5: Implement abortable reads without swallowing errors**

```js
export async function fetchPublishedCases({slug, fetchImpl = fetch, timeoutMs = 4000} = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(buildCaseQueryUrl(slug), {
      headers: {Accept: 'application/json'},
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Sanity request failed with ${response.status}`)
    const payload = await response.json()
    const records = Array.isArray(payload.result) ? payload.result : [payload.result]
    return records.map(normalizeCaseRecord).filter(Boolean)
  } finally {
    clearTimeout(timeout)
  }
}
```

Controllers in later tasks catch this error and preserve static HTML.

- [ ] **Step 6: Run the focused test**

Run: `node --test sanity-case-data.test.mjs`

Expected: all data, URL, timeout, and malformed-record tests pass.

- [ ] **Step 7: Commit the data boundary**

```bash
git add sanity-content-config.js sanity-case-data.js sanity-case-data.test.mjs
git commit -m "Add safe Sanity case data client"
```

---

### Task 3: Cases Overview Progressive Updates

**Files:**
- Create: `sanity-case-overview.js`
- Create: `sanity-case-overview.test.mjs`
- Modify: `pages/cases.html`
- Modify: `cases-page.test.mjs`

**Interfaces:**
- Consumes: `fetchPublishedCases()`, normalized `slug`, `order`, `brand`, `title`, `caseNumber`, `cover`, and `vehicle` from Task 2.
- Produces: `applyCasesOverview(records, root): number`, returning the count of updated slugs.
- Emits: `window` event `lonma:content-updated` after a successful non-zero update.

- [ ] **Step 1: Write failing static-marker and mapping tests**

Add assertions that all six rail slides and archive cards have matching stable keys and the CMS module is loaded after the existing language script:

```js
assert.equal((html.match(/class="slide[^\"]*"[^>]*data-case-slug="case-0[1-6]"/g) || []).length, 6)
assert.equal((html.match(/class="archive-card"[^>]*data-case-slug="case-0[1-6]"/g) || []).length, 6)
assert.match(html, /content-pages\.js[^<]*<\/script>\s*<script type="module" src="\.\.\/sanity-case-overview\.js/)
```

In `sanity-case-overview.test.mjs`, use six normalized fixtures and fake nodes to assert that `applyCasesOverview` updates only matching slugs, sets `data-brand`, assigns bilingual text attributes, and never creates a seventh card.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `node --test cases-page.test.mjs sanity-case-overview.test.mjs`

Expected: FAIL because CMS markers and the overview module do not exist.

- [ ] **Step 3: Mark the existing six overview entries**

For each slide and archive card, add the route slug without changing class names or child order:

```html
<button class="slide is-active" type="button" data-case-slug="case-01" data-scene="...">
  <span class="slide-mask" aria-hidden="true"><img class="media" data-cms-cover ... /></span>
  <span class="slide-label" data-cms-rail-title data-zh="01 · 街道宽体" data-en="01 · STREET WIDEBODY">01 · STREET WIDEBODY</span>
</button>
```

Add equivalent `data-case-slug`, `data-cms-cover`, `data-cms-title`, `data-cms-brand`, and `data-cms-vehicle` markers to each existing archive card. `data-cms-title` contains the title only; `data-cms-rail-title` always retains the two-digit case number prefix.

- [ ] **Step 4: Implement overview patching and stable reordering**

`applyCasesOverview` must:

```js
const bySlug = new Map(records.map((record) => [record.slug, record]))
const matched = [...root.querySelectorAll('[data-case-slug]')]
  .filter((node) => bySlug.has(node.dataset.caseSlug))

for (const node of matched) {
  const record = bySlug.get(node.dataset.caseSlug)
  node.dataset.brand = record.brand
  applyLocalizedNode(node.querySelector('[data-cms-title]'), record.title)
  applyLocalizedNode(node.querySelector('[data-cms-rail-title]'), {
    en: `${record.caseNumber.replace('CASE ', '')} · ${record.title.en}`,
    zh: `${record.caseNumber.replace('CASE ', '')} · ${record.title.zh}`,
  })
  applyResponsiveImage(node.querySelector('[data-cms-cover]'), record.cover)
}
```

Reorder only the existing six nodes. On the rail, insert sorted case slides before the first of the two trailing spacer slides; on the archive, append sorted existing cards to `.archive-grid`. Moving nodes preserves their existing hover and filter listeners.

The module entrypoint catches request errors, calls `console.warn('Sanity case overview unavailable; using static content.')` once, and performs no DOM writes on zero valid records.

- [ ] **Step 5: Run overview and regression tests**

Run:

```bash
node --test sanity-case-overview.test.mjs cases-page.test.mjs content-pages.test.mjs image-performance.test.mjs
```

Expected: all tests pass; card count remains six and current scene animation assertions remain unchanged.

- [ ] **Step 6: Commit the overview integration**

```bash
git add pages/cases.html cases-page.test.mjs sanity-case-overview.js sanity-case-overview.test.mjs
git commit -m "Connect Cases overview to Sanity"
```

---

### Task 4: Shared Case Detail And Photo-Story Renderer

**Files:**
- Create: `sanity-case-detail.js`
- Create: `sanity-case-detail.test.mjs`
- Modify: `scripts/render-detail-pages.mjs`
- Modify: `case-detail.css`
- Modify: `content-pages.js`
- Modify: `content-pages.test.mjs`
- Modify: `case-detail.test.mjs`
- Regenerate: `pages/cases/case-01.html`
- Regenerate: `pages/cases/case-03.html`
- Regenerate: `pages/cases/case-04.html`
- Regenerate: `pages/cases/case-05.html`
- Regenerate: `pages/cases/case-06.html`

**Interfaces:**
- Consumes: `fetchPublishedCases({slug})` and normalized detail/media fields from Task 2.
- Produces: `applyDetailCase(record, root): boolean`.
- Produces: `renderMediaSections(items, document): DocumentFragment` built only with DOM methods.
- Emits: `lonma:content-updated` after successful patching.

- [ ] **Step 1: Write failing detail markers, fallback, and renderer tests**

Require every generic generated case page to contain:

```js
assert.match(html, new RegExp(`data-case-slug="case-${id}"`))
assert.match(html, /data-cms="title"/)
assert.match(html, /data-cms="subtitle"/)
assert.match(html, /data-cms="lede"/)
assert.match(html, /data-cms="story"/)
assert.match(html, /data-cms="cover"/)
assert.match(html, /data-cms-media-sections/)
assert.match(html, /<script type="module" src="\.\.\/\.\.\/sanity-case-detail\.js/)
```

In `sanity-case-detail.test.mjs`, assert that no request or invalid data leaves fixture text and image attributes byte-for-byte unchanged. Assert that valid content sets bilingual data attributes, text, alt text, and media URLs without using `innerHTML`.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `node --test sanity-case-detail.test.mjs case-detail.test.mjs content-pages.test.mjs`

Expected: FAIL because the CMS markers and renderer do not exist.

- [ ] **Step 3: Add durable CMS slots to the page generator**

Update `renderGenericCasePage` so its main element has `data-case-slug="case-${record.id}"`, and mark existing elements:

```html
<p class="detail-index" data-cms="caseNumber">CASE ${record.id}</p>
${i18n("h1", record.title, ' data-cms="title"')}
${i18n("h2", record.subtitle, ' data-cms="subtitle"')}
${i18n("p", record.intro, ' class="detail-intro" data-cms="lede"')}
<img data-cms="cover" ... />
<section class="detail-story"><p data-cms="story" ...></p></section>
<div class="detail-media-sections" data-cms-media-sections></div>
```

Load `sanity-case-detail.js` as a module after `content-pages.js`. Run `node scripts/render-detail-pages.mjs` and verify Service detail output is unchanged except for any shared cache key intentionally updated by the generator.

- [ ] **Step 4: Implement safe field and photo-story rendering**

Use `textContent`, `dataset.en`, `dataset.zh`, `setAttribute`, `replaceChildren`, and `document.createElement` only. A media item renders as:

```js
const section = document.createElement('section')
section.className = `detail-media-section detail-media-section-${item.layout}`
const figure = document.createElement('figure')
const image = document.createElement('img')
image.loading = 'lazy'
image.decoding = 'async'
applyResponsiveImage(image, item.image)
figure.append(image)
section.append(figure)
```

Add a copy wrapper only when heading or body exists. Apply `data-en` and `data-zh`, then append heading/body as text nodes. Replace the media container only when at least one normalized media item exists; an empty array keeps the static page exactly as rendered.

- [ ] **Step 5: Make the language controller refresh dynamic nodes**

Change `setLanguage()` to query translatable nodes at call time instead of capturing arrays only at startup, then add:

```js
window.addEventListener('lonma:content-updated', () => {
  setLanguage(currentLanguage)
})
```

Keep `sessionStorage`, English-first startup, navigation labels, placeholders, aria labels, and alt handling unchanged.

- [ ] **Step 6: Add unframed responsive photo-story CSS**

Use the existing neutral palette and no card borders:

```css
.detail-media-sections { display: grid; gap: clamp(48px, 7vw, 120px); }
.detail-media-section { display: grid; grid-template-columns: minmax(0, 1fr); align-items: center; }
.detail-media-section-textLeft,
.detail-media-section-textRight { grid-template-columns: minmax(0, 0.42fr) minmax(0, 0.58fr); }
.detail-media-section-textRight .detail-media-copy { order: 2; }
.detail-media-section img { width: 100%; height: auto; display: block; object-fit: cover; }
@media (max-width: 768px) {
  .detail-media-section-textLeft,
  .detail-media-section-textRight { grid-template-columns: 1fr; }
  .detail-media-section-textRight .detail-media-copy { order: initial; }
}
```

- [ ] **Step 7: Regenerate and run detail regressions**

Run:

```bash
node scripts/render-detail-pages.mjs
node --test sanity-case-detail.test.mjs case-detail.test.mjs content-pages.test.mjs link-closure.test.mjs image-performance.test.mjs
```

Expected: all generic detail pages retain current static content, links, responsive images, and mobile layout while exposing CMS slots.

- [ ] **Step 8: Commit the generic detail integration**

```bash
git add sanity-case-detail.js sanity-case-detail.test.mjs scripts/render-detail-pages.mjs case-detail.css content-pages.js content-pages.test.mjs case-detail.test.mjs pages/cases
git commit -m "Connect Case detail stories to Sanity"
```

---

### Task 5: Case 02 Video And Story Preservation

**Files:**
- Modify: `scripts/render-detail-pages.mjs`
- Modify: `sanity-case-detail.js`
- Modify: `sanity-case-detail.test.mjs`
- Modify: `case-02.js`
- Modify: `case-02.test.mjs`
- Regenerate: `pages/cases/case-02.html`

**Interfaces:**
- Consumes: normalized `video.poster`, `video.fileUrl`, `video.externalUrl`, `vehicle`, and `mediaSections` from Task 2.
- Produces: `applyCaseVideo(record, root): boolean`; uploaded `fileUrl` has priority over `externalUrl`.
- Preserves: existing `data-video-state="poster-only"` when no safe video source exists.

- [ ] **Step 1: Write failing video-ready and poster-only tests**

Add two renderer cases:

```js
test('Case 02 keeps poster-only state without a CMS source', () => {
  const changed = applyCaseVideo({video: {poster: null, fileUrl: '', externalUrl: ''}}, root)
  assert.equal(changed, false)
  assert.equal(stage.dataset.videoState, 'poster-only')
  assert.equal(video.getAttribute('src'), null)
})

test('uploaded MP4 wins over an external URL', () => {
  const changed = applyCaseVideo({video: {
    fileUrl: 'https://cdn.sanity.io/files/v54qppoy/production/film.mp4',
    externalUrl: 'https://video.example.com/other.mp4',
  }}, root)
  assert.equal(changed, true)
  assert.equal(video.getAttribute('src'), 'https://cdn.sanity.io/files/v54qppoy/production/film.mp4')
  assert.equal(stage.dataset.videoState, 'ready')
})
```

Keep the existing test that proves no autoplay call occurs.

- [ ] **Step 2: Run Case 02 tests and verify failure**

Run: `node --test sanity-case-detail.test.mjs case-02.test.mjs`

Expected: FAIL because `applyCaseVideo` and Case 02 CMS markers do not exist.

- [ ] **Step 3: Add Case 02-specific slots in the generator**

Set `data-case-slug="case-02"` on the main element. Mark Case number, title, vehicle model, year, poster/video, and `.case02-story` media container. Load the shared detail module after `case-02.js`, preserving the existing controller order:

```html
<script src="../../content-pages.js?v=project-planner-redesign-20260726"></script>
<script src="../../case-02.js?v=project-planner-redesign-20260726"></script>
<script type="module" src="../../sanity-case-detail.js?v=sanity-case-cms-20260801"></script>
```

- [ ] **Step 4: Implement optional video activation**

`applyCaseVideo` selects `fileUrl || externalUrl`. If safe, set `video.src`, set `stage.dataset.videoState = 'ready'`, remove `aria-disabled`, restore controls, and call `video.load()` but never `play()`. If no safe source exists, do not alter the static poster-only DOM. Update `case-02.js` to expose `window.lonmaRefreshCaseVideoState = refreshCaseVideoState`; `sanity-case-detail.js` calls that function immediately after assigning the source.

- [ ] **Step 5: Regenerate and run Case 02 regressions**

Run:

```bash
node scripts/render-detail-pages.mjs
node --test case-02.test.mjs sanity-case-detail.test.mjs case-detail.test.mjs image-performance.test.mjs
```

Expected: poster-only and ready states both pass; no autoplay, GSAP, or new scroll listener is introduced.

- [ ] **Step 6: Commit the Case 02 integration**

```bash
git add scripts/render-detail-pages.mjs sanity-case-detail.js sanity-case-detail.test.mjs case-02.js case-02.test.mjs pages/cases/case-02.html
git commit -m "Connect Case 02 video to Sanity"
```

---

### Task 6: Deterministic Six-Case Seed And Editor Instructions

**Files:**
- Create: `scripts/build-sanity-seed.mjs`
- Create: `sanity/seed/case-pages.ndjson`
- Create: `sanity-seed.test.mjs`
- Modify: `sanity/README.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: `caseDetails` from `detail-pages-data.mjs` and explicit brand/vehicle metadata keyed by case ID.
- Produces: `buildSanitySeed(): CasePageDocument[]` with deterministic IDs `casePage-case-01` through `casePage-case-06`.
- Produces: one NDJSON line per published `casePage` document.

- [ ] **Step 1: Write failing seed coverage tests**

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import {readFileSync} from 'node:fs'
import {buildSanitySeed} from './scripts/build-sanity-seed.mjs'

test('seed contains six deterministic bilingual Case documents', () => {
  const records = buildSanitySeed()
  assert.equal(records.length, 6)
  assert.deepEqual(records.map((record) => record._id), [
    'casePage-case-01', 'casePage-case-02', 'casePage-case-03',
    'casePage-case-04', 'casePage-case-05', 'casePage-case-06',
  ])
  for (const [index, record] of records.entries()) {
    assert.equal(record._type, 'casePage')
    assert.equal(record.slug.current, `case-0${index + 1}`)
    assert.equal(record.order, index + 1)
    assert.ok(record.title.en && record.title.zh)
    assert.match(record.cover.imagePath, /^\/assets\/images\/网页\/optimized\/case-0[1-6]\.jpg$/)
  }
})

test('checked-in NDJSON matches the generator', () => {
  const source = readFileSync(new URL('./sanity/seed/case-pages.ndjson', import.meta.url), 'utf8').trim()
  assert.deepEqual(source.split('\n').map(JSON.parse), buildSanitySeed())
})
```

- [ ] **Step 2: Run the seed test and verify failure**

Run: `node --test sanity-seed.test.mjs`

Expected: FAIL because the generator and NDJSON do not exist.

- [ ] **Step 3: Implement the deterministic seed generator**

Map the existing Case data without altering its copy. Use these brand assignments in order: `bmw`, `bmw`, `mercedes-benz`, `bmw`, `audi`, `bmw`. Use route slugs `case-01` through `case-06`, current optimized image paths prefixed by `/`, and current known vehicle data for Case 02 (`BMW`, `G80 M3`, `2024`, `G8X`). Leave unknown vehicle fields as empty strings, not invented specifications.

For Case 01 and Cases 03 through 06, seed `mediaSections` as an empty array so no duplicate hero image is added. For Case 02, preserve the existing story as three sections: brake image plus localized `THE DIRECTION` copy, coilover image plus localized `TEST, ADJUST, REPEAT` copy, and a full-width forged-wheel image without a heading or body.

The command entrypoint writes NDJSON only when executed directly:

```js
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const lines = buildSanitySeed().map((record) => JSON.stringify(record)).join('\n') + '\n'
  await writeFile(resolve(root, 'sanity/seed/case-pages.ndjson'), lines)
}
```

- [ ] **Step 4: Generate and validate the seed file**

Run:

```bash
node scripts/build-sanity-seed.mjs
node --test sanity-seed.test.mjs
```

Expected: six valid NDJSON lines and both seed tests pass.

- [ ] **Step 5: Replace comparison-only documentation with the real workflow**

Document these exact editor commands in `sanity/README.md`:

```bash
npm install
npm run dev
npx sanity login
npx sanity dataset import seed/case-pages.ndjson production --replace
```

State that the website reads published documents only, local/static HTML is the fallback, reimporting updates the same deterministic IDs, and secrets must never be committed. Add the public Studio URL and the current temporary website URL.

- [ ] **Step 6: Run documentation and seed tests**

Run: `node --test sanity.test.mjs sanity-seed.test.mjs contact-readme.test.mjs`

Expected: all tests pass and the README no longer says Sanity is only a comparison.

- [ ] **Step 7: Commit the seed deliverable**

```bash
git add scripts/build-sanity-seed.mjs sanity/seed/case-pages.ndjson sanity-seed.test.mjs sanity/README.md README.md sanity.test.mjs
git commit -m "Seed six editable Sanity cases"
```

---

### Task 7: Real Project Activation, Full Verification, And Preview Deployment

**Files:**
- Modify only if validation exposes a defect: files owned by Tasks 1 through 6.
- Do not stage: `audit/` or unrelated material.

**Interfaces:**
- Consumes: project `v54qppoy`, dataset `production`, generated seed, Studio build, public CMS clients, and current Vercel Git integration.
- Produces: a verified feature branch and Vercel previews for `jagger` and `lonma-sanity-studio`.

- [ ] **Step 1: Run generators and the complete automated suite**

```bash
node scripts/render-detail-pages.mjs
node scripts/render-shop-page.mjs
node scripts/render-seo-files.mjs
node --test
```

Expected: every test passes; generated pages produce no unreviewed non-case content changes.

- [ ] **Step 2: Build the production Studio**

```bash
cd sanity
npm run build
```

Expected: exit 0 and no schema, project ID, dataset, or duplicate-type errors.

- [ ] **Step 3: Authenticate and configure Sanity origins**

From `sanity/`, run:

```bash
npx sanity login
npx sanity cors add http://127.0.0.1:4211 --credentials
npx sanity cors add https://jagger-sage.vercel.app
npx sanity cors add https://lonma-sanity-studio.vercel.app --credentials
```

If an origin already exists, keep the existing equivalent entry instead of creating a duplicate. Confirm project `v54qppoy` and dataset `production` before continuing.

- [ ] **Step 4: Import and publish the six records**

```bash
npx sanity dataset import seed/case-pages.ndjson production --replace
```

Open the Studio, confirm exactly six Case Page documents, inspect their bilingual copy and cover paths, then publish any imported drafts so the public query returns six records.

- [ ] **Step 5: Verify CMS success and forced-fallback behavior locally**

Run the local site on port 4211 and inspect these viewports:

```bash
python3 -m http.server 4211 --bind 127.0.0.1
```

Verify:

- `/pages/cases.html` at 390x844, 768x1024, 1440x900, and 1900x1050;
- `/pages/cases/case-01.html` at 390x844 and 1440x900;
- `/pages/cases/case-02.html` at 390x844 and 1440x900;
- English first load, Chinese toggle after CMS load, six-card count, independent Case rail scrolling, no horizontal overflow, and no console errors;
- a blocked request to `v54qppoy.api.sanity.io` leaves all static titles, images, links, and Case 02 poster state visible.

- [ ] **Step 6: Review the final diff and protected files**

Run:

```bash
git diff --check origin/main...HEAD
git status --short
git diff --stat origin/main...HEAD
git diff --name-only origin/main...HEAD
```

Expected: no whitespace errors; no `audit/`, secrets, local Studio build output, or unrelated files appear in the branch.

- [ ] **Step 7: Commit any verification-only correction**

Only when Step 5 revealed and fixed a concrete defect:

```bash
git add sanity-case-data.js sanity-case-data.test.mjs sanity-case-overview.js sanity-case-overview.test.mjs sanity-case-detail.js sanity-case-detail.test.mjs case-02.js case-02.test.mjs pages/cases.html pages/cases/case-*.html case-detail.css content-pages.js content-pages.test.mjs
git commit -m "Fix Sanity case CMS verification gaps"
```

When no correction was needed, do not create an empty commit.

- [ ] **Step 8: Push and verify Vercel previews**

```bash
git push -u origin agent/sanity-case-cms-20260801
```

Create a pull request titled `Connect Case pages to Sanity CMS`. Confirm both Vercel checks are Ready, then verify the `jagger` preview and `lonma-sanity-studio` preview directly before requesting production merge approval.
