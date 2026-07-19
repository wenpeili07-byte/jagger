import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const casesHtml = read("./pages/cases.html");
const caseIds = ["01", "02", "03", "04", "05", "06"];
const serviceIds = ["build", "parts", "photo", "ecu", "chassis", "exhaust"];
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

for (const id of caseIds) {
  const route = `./pages/cases/case-${id}.html`;
  assert.ok(existsSync(new URL(route, import.meta.url)), `${route} should exist`);
  const html = read(route);
  assert.match(html, /<main[^>]*data-detail-page/, `${route} should contain real detail content`);
  assert.match(html, /data-section="cases"/, `${route} should mark the Cases navigation section`);
  assert.match(html, /data-zh="[^"]+"[^>]*data-en="[^"]+"/, `${route} should contain bilingual content`);
  assert.match(html, /class="detail-contact"/, `${route} should contain a contact action`);
  assert.match(html, /class="detail-pagination"/, `${route} should contain previous and next links`);

  const pagination = html.match(/<nav class="detail-pagination"[\s\S]*?<\/nav>/);
  assert.ok(pagination, `${route} should contain a complete pagination region`);
  const paginationLinks = [...pagination[0].matchAll(/<a\b[^>]*>/g)];
  assert.equal(paginationLinks.length, 2, `${route} should have two pagination links`);

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
}

const archiveRoutes = [...casesHtml.matchAll(/class="archive-card" href="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(
  archiveRoutes,
  caseIds.map((id) => `./cases/case-${id}.html`),
  "all six archive cards should link to their matching detail pages"
);
assert.doesNotMatch(casesHtml, /class="archive-card" href="#"/, "case archive should not retain dead links");

const serviceCss = read("./service-detail.css");
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
assert.match(serviceCss, /\.detail-copy h1\s*\{[^}]*overflow-wrap:\s*anywhere/s, "two-column headings should safely wrap long English words");
assert.match(serviceCss, /@media \(max-width:\s*1099px\)[\s\S]*?\.detail-copy h1\s*\{[^}]*max-width:\s*none/s, "stacked headings should keep natural word wrapping");
assert.doesNotMatch(serviceCss, /width:\s*100vw|transform:\s*scale\(/);
assert.match(serviceCss, /\.detail-contact\s*\{[^}]*border-top:\s*1px solid var\(--line\)/s, "the contact separator should remain neutral");

for (const [, selector, declarations] of serviceCss.matchAll(/(\.detail-[^{]+)\s*\{([^}]*)\}/gs)) {
  if (!/:(?:hover|focus-visible|active)/.test(selector)) {
    assert.doesNotMatch(
      declarations,
      /\bborder(?:-(?:top|right|bottom|left))?\s*:\s*[^;}]*var\(--accent(?:-bright)?\)/,
      `${selector.trim()} should not use an accent-colored permanent border`
    );
  }
}
