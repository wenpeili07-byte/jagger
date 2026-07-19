import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const casesHtml = read("./pages/cases.html");
const caseIds = ["01", "02", "03", "04", "05", "06"];
const serviceIds = ["build", "parts", "photo", "ecu", "chassis", "exhaust"];
const { caseDetails, serviceDetails } = await import("./detail-pages-data.mjs");
const sharedCss = read("./styles.css");
const contentCss = read("./content-pages.css");
const rendererUrl = new URL("./scripts/render-detail-pages.mjs", import.meta.url);
const generatedPages = [
  ...caseIds.map((id) => new URL(`./pages/cases/case-${id}.html`, import.meta.url)),
  ...serviceIds.map((id) => new URL(`./pages/services/${id}.html`, import.meta.url)),
];
const generatedPageMtimes = generatedPages.map((page) => [page.href, statSync(page).mtimeMs]);
const { renderCasePage, renderServicePage } = await import(`${rendererUrl.href}?test=${Date.now()}`);

for (const [pageUrl, mtimeMs] of generatedPageMtimes) {
  assert.equal(
    statSync(new URL(pageUrl)).mtimeMs,
    mtimeMs,
    "importing the detail renderer should not write generated pages"
  );
}

for (const record of caseDetails) {
  assert.equal(read(`./pages/cases/case-${record.id}.html`), renderCasePage(record), `case-${record.id}.html should match renderCasePage output`);
}

for (const record of serviceDetails) {
  assert.equal(read(`./pages/services/${record.id}.html`), renderServicePage(record), `${record.id}.html should match renderServicePage output`);
}

function attributeValue(tag, attribute) {
  return tag.match(new RegExp(`\\b${attribute}="([^"]*)"`))?.[1];
}

function anchorsWithClass(html, className) {
  return [...html.matchAll(new RegExp(`<a\\b(?=[^>]*\\bclass="[^"]*\\b${className}\\b[^"]*")[^>]*>`, "g"))]
    .map((match) => match[0]);
}

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
  const index = caseIds.indexOf(record.id);
  assert.equal(record.previous, caseIds[(index + caseIds.length - 1) % caseIds.length], `${record.id} should link to the prior case`);
  assert.equal(record.next, caseIds[(index + 1) % caseIds.length], `${record.id} should link to the next case`);
}

for (const id of caseIds) {
  const route = `./pages/cases/case-${id}.html`;
  assert.ok(existsSync(new URL(route, import.meta.url)), `${route} should exist`);
  const html = read(route);
  assert.match(html, /<main[^>]*data-detail-page/, `${route} should contain real detail content`);
  assert.match(html, /data-section="cases"/, `${route} should mark the Cases navigation section`);
  assert.match(html, /data-zh="[^"]+"[^>]*data-en="[^"]+"/, `${route} should contain bilingual content`);
  assert.match(html, /class="detail-contact"/, `${route} should contain a contact action`);
  assert.match(html, /class="detail-pagination"/, `${route} should contain previous and next links`);
  assert.match(html, /<a class="brand"[^>]*data-zh-aria-label="回到首页"[^>]*data-en-aria-label="Back to home"/, `${route} should give the brand bilingual accessible names`);
  assert.match(html, /<nav class="nav"[^>]*data-zh-aria-label="主导航"[^>]*data-en-aria-label="Main navigation"/, `${route} should give navigation a bilingual accessible name`);
  assert.match(html, /<img[^>]*data-zh-alt="LONMA DYNAMIC [^"]+"[^>]*data-en-alt="LONMA DYNAMIC [^"]+"/, `${route} should give its title-based image alternative in both languages`);
  assert.match(html, /<nav class="detail-pagination"[^>]*data-zh-aria-label="案例分页"[^>]*data-en-aria-label="Case pagination"/, `${route} should give pagination a bilingual accessible name`);
  const backLink = anchorsWithClass(html, "detail-back")[0];
  assert.equal(attributeValue(backLink, "href"), "../cases.html", `${route} should return to the cases archive`);
  const contactSection = html.match(/<section class="detail-contact">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(contactSection, `${route} should contain a complete contact section`);
  assert.equal(attributeValue([...contactSection.matchAll(/<a\b[^>]*>/g)][0][0], "href"), "../contact.html", `${route} should send inquiries to contact`);

  const pagination = html.match(/<nav class="detail-pagination"[\s\S]*?<\/nav>/);
  assert.ok(pagination, `${route} should contain a complete pagination region`);
  const paginationLinks = [...pagination[0].matchAll(/<a\b[^>]*>/g)];
  assert.equal(paginationLinks.length, 2, `${route} should have two pagination links`);
  const record = caseDetails.find((candidate) => candidate.id === id);
  assert.equal(attributeValue(paginationLinks[0][0], "href"), `./case-${record.previous}.html`, `${route} previous target should be exact`);
  assert.equal(attributeValue(paginationLinks[1][0], "href"), `./case-${record.next}.html`, `${route} next target should be exact`);

  for (const [index, link] of paginationLinks.entries()) {
    assert.match(
      link[0],
      /data-zh="[^"]+"[^>]*data-en="[^"]+"/,
      `${route} pagination link ${index + 1} should be bilingual`
    );
  }
}

for (const id of serviceIds) {
  const route = `./pages/services/${id}.html`;
  assert.ok(existsSync(new URL(route, import.meta.url)), `${route} should exist`);
  const html = read(route);
  assert.match(html, /<main[^>]*data-detail-page/, `${route} should contain real detail content`);
  assert.match(html, /data-section="services"/, `${route} should mark the Services navigation section`);
  assert.match(html, /data-zh="[^"]+"[^>]*data-en="[^"]+"/, `${route} should contain bilingual content`);
  assert.match(html, /class="detail-contact"/, `${route} should contain a contact action`);
  assert.match(html, /<a class="brand"[^>]*data-zh-aria-label="回到首页"[^>]*data-en-aria-label="Back to home"/, `${route} should give the brand bilingual accessible names`);
  assert.match(html, /<nav class="nav"[^>]*data-zh-aria-label="主导航"[^>]*data-en-aria-label="Main navigation"/, `${route} should give navigation a bilingual accessible name`);
  assert.match(html, /<img[^>]*data-zh-alt="LONMA DYNAMIC [^"]+"[^>]*data-en-alt="LONMA DYNAMIC [^"]+"/, `${route} should give its title-based image alternative in both languages`);
  const backLink = anchorsWithClass(html, "detail-back")[0];
  assert.equal(attributeValue(backLink, "href"), "../services.html", `${route} should return to the services index`);
  const contactSection = html.match(/<section class="detail-contact">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(contactSection, `${route} should contain a complete contact section`);
  assert.equal(attributeValue([...contactSection.matchAll(/<a\b[^>]*>/g)][0][0], "href"), "../contact.html", `${route} should send inquiries to contact`);
}

const archiveRoutes = anchorsWithClass(casesHtml, "archive-card").map((anchor) => attributeValue(anchor, "href"));
assert.deepEqual(
  archiveRoutes,
  caseIds.map((id) => `./cases/case-${id}.html`),
  "all six archive cards should link to their matching detail pages"
);
assert.doesNotMatch(casesHtml, /class="archive-card" href="#"/, "case archive should not retain dead links");
assert.match(sharedCss, /\.nav a\[aria-current="page"\]\s*\{[^}]*color:\s*var\(--ink\)[^}]*text-shadow:/s, "the shared stylesheet should make active navigation white with a blue glow");
assert.match(sharedCss, /\.nav a\[aria-current="page"\]::after\s*\{[^}]*background:\s*var\(--accent-bright\)/s, "the shared stylesheet should give active navigation a blue line");
assert.doesNotMatch(contentCss, /\.content-page \.nav a\[aria-current="page"\]/, "active navigation styling should not be limited to content pages");

const serviceCss = read("./service-detail.css");
const caseCss = read("./case-detail.css");
assert.match(serviceCss, /\.service-detail-page\s*\{/);
assert.match(serviceCss, /\.detail-hero\s*\{[^}]*grid-template-columns:/s);
assert.match(serviceCss, /\.detail-process\s*\{/);
const detailIndexDeclarations = [...serviceCss.matchAll(/\.detail-index\s*\{([^}]*)\}/gs)]
  .map(([, declarations]) => declarations)
  .join("\n");
assert.ok(detailIndexDeclarations, "service detail pages should define an index label");
assert.match(detailIndexDeclarations, /color:\s*var\(--muted\)/, "the index label should use a neutral default color");
assert.doesNotMatch(detailIndexDeclarations, /var\(--accent(?:-bright)?\)/, "the index label should not be blue by default");
assert.match(serviceCss, /@media \(max-width:\s*1099px\)[\s\S]*?\.detail-hero\s*\{[^}]*grid-template-columns:\s*1fr/s);
assert.match(serviceCss, /@media \(max-width:\s*1099px\)[\s\S]*?\.detail-copy h1\s*\{[^}]*max-width:\s*none/s, "stacked headings should keep natural word wrapping");
assert.doesNotMatch(serviceCss, /width:\s*100vw|transform:\s*scale\(/);
assert.match(serviceCss, /\.detail-contact\s*\{[^}]*border-top:\s*1px solid var\(--line\)/s, "the contact separator should remain neutral");

for (const [name, detailCss, stackedBreakpoint] of [
  ["service", serviceCss, "1099px"],
  ["case", caseCss, "899px"],
]) {
  assert.match(detailCss, /\.detail-hero\s*\{[^}]*\n\s*height:\s*min\(calc\(100vh - var\(--site-header-height\)\),\s*var\(--site-first-screen-max\)\)/s, `${name} desktop hero should have a bounded first-screen height`);
  assert.match(detailCss, /\.detail-hero-media\s*\{[^}]*\n\s*height:\s*100%[^}]*\n\s*min-height:\s*0/s, `${name} desktop hero media should fill the bounded grid row`);
  assert.match(detailCss, /\.detail-hero-media img\s*\{[^}]*object-fit:\s*cover/s, `${name} hero image should continue to crop within the stable row`);
  assert.match(detailCss, new RegExp(`@media \\(max-width:\\s*${stackedBreakpoint.replace(".", "\\.")}\\)[\\s\\S]*?\\.detail-hero\\s*\\{[^}]*grid-template-columns:\\s*1fr[^}]*height:\\s*auto`, "s"), `${name} stacked hero should release the desktop height`);
  assert.match(detailCss, new RegExp(`@media \\(max-width:\\s*${stackedBreakpoint.replace(".", "\\.")}\\)[\\s\\S]*?\\.detail-hero-media\\s*\\{[^}]*height:\\s*auto[^}]*min-height:\\s*0[^}]*aspect-ratio:\\s*4\\s*\\/\\s*3`, "s"), `${name} stacked hero media should preserve the 4:3 flow`);
  assert.match(detailCss, /\.detail-copy\s*\{[^}]*container-type:\s*inline-size/s, `${name} detail copy should establish an inline-size container`);
  assert.match(detailCss, /\.detail-copy h1\s*\{[^}]*font-size:\s*clamp\(48px,\s*8rem,\s*128px\)/s, `${name} detail heading should retain a non-viewport fallback`);
  assert.match(detailCss, /@media \(max-width:\s*1180px\)[\s\S]*?\.detail-copy h1\s*\{[^}]*font-size:\s*clamp\(48px,\s*16cqw,\s*72px\)/s, `${name} 1100px heading should shrink to its narrow copy column`);
  assert.match(detailCss, new RegExp(`@media \\(max-width:\\s*${stackedBreakpoint.replace(".", "\\.")}\\)[\\s\\S]*?\\.detail-copy h1\\s*\\{[^}]*font-size:\\s*clamp\\(48px,\\s*16cqw,\\s*72px\\)`, "s"), `${name} stacked heading should keep container-relative sizing`);
  assert.match(detailCss, /@media \(max-width:\s*620px\)[\s\S]*?\.detail-copy h1\s*\{[^}]*font-size:\s*clamp\(48px,\s*16cqw,\s*72px\)/s, `${name} mobile heading should not restore a fixed oversized size`);
  assert.doesNotMatch(detailCss, /\.detail-copy h1\s*\{[^}]*font-size:\s*[^;]*vw|\.detail-copy h1\s*\{[^}]*overflow-wrap:\s*anywhere/s, `${name} detail headings should preserve normal word boundaries without viewport scaling`);
}

function assertNoPermanentAccentBorders(css) {
  for (const [, selectorGroup, declarations] of css.matchAll(/(\.detail-[^{]+)\s*\{([^}]*)\}/gs)) {
    for (const selector of selectorGroup.split(",").map((part) => part.trim())) {
      if (!/:(?:hover|focus-visible|active)/.test(selector)) {
        assert.doesNotMatch(
          declarations,
          /\bborder(?:-(?:top|right|bottom|left))?\s*:\s*[^;}]*var\(--accent(?:-bright)?\)/,
          `${selector} should not use an accent-colored permanent border`
        );
      }
    }
  }
}

assert.throws(
  () => assertNoPermanentAccentBorders(".detail-copy, .detail-copy:hover { border: 1px solid var(--accent); }"),
  /\.detail-copy should not use an accent-colored permanent border/,
  "interactive selector groups should still validate their permanent selectors"
);

assertNoPermanentAccentBorders(serviceCss);

for (const detailCss of [caseCss, serviceCss]) {
  assert.doesNotMatch(
    detailCss,
    /\.detail-contact a:hover,[\s\S]{0,500}?\{[^}]*color:\s*var\(--accent-bright\)/,
    "detail interaction text should remain white instead of using low-contrast blue"
  );
  assert.match(
    detailCss,
    /\.detail-contact a:hover,[\s\S]{0,500}?\{[^}]*outline:\s*2px solid var\(--accent-bright\)/,
    "detail interaction states should retain a blue non-text focus indicator"
  );
}
