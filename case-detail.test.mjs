import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const css = read("./case-detail.css");

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
