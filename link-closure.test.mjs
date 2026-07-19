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
