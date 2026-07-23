import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const css = read("./case-detail.css");
const serviceCss = read("./service-detail.css");

for (const id of ["01", "03", "04", "05", "06"]) {
  const html = read(`./pages/cases/case-${id}.html`);
  assert.match(html, /case-detail\.css\?v=mobile-spacing-20260722/);
  assert.match(html, /class="detail-hero"/);
  assert.match(html, /class="detail-story"/);
  assert.match(html, /class="detail-contact"/);
  assert.doesNotMatch(html, /<figcaption|case-spec-grid|case-section-kicker|case-detail-meta/);
}

const case02 = read("./pages/cases/case-02.html");
assert.match(case02, /case-detail\.css\?v=mobile-spacing-20260722/);
assert.match(case02, /class="case02-showcase"/);
assert.match(case02, /class="detail-story"/);
assert.match(case02, /class="detail-contact"/);
assert.match(case02, /class="detail-pagination"/);
assert.doesNotMatch(case02, /<figcaption|case-spec-grid|case-section-kicker|case-detail-meta/);

assert.match(css, /\.detail-hero\s*\{[^}]*grid-template-columns:/s);
assert.match(css, /\.detail-hero-media img\s*\{[^}]*object-fit:\s*cover/s);
assert.match(css, /@media \(max-width:\s*899px\)[\s\S]*?\.detail-hero\s*\{[^}]*grid-template-columns:\s*1fr/s);
assert.doesNotMatch(css, /\.detail-hero-media\s*\{[^}]*border:/s);
assert.doesNotMatch(css, /\.detail-story\s*\{[^}]*border:/s);
assert.doesNotMatch(css, /figcaption|case-spec-grid|case-detail-meta/);

assert.match(
  css,
  /@media \(max-width:\s*620px\)[\s\S]*?\.detail-copy\s*\{[^}]*justify-content:\s*flex-start[^}]*min-height:\s*420px[^}]*padding:\s*40px 20px 36px/s,
  "mobile Case detail should use the compact approved copy block"
);
assert.match(
  css,
  /@media \(max-width:\s*620px\)[\s\S]*?\.detail-index\s*\{[^}]*margin:\s*12px 0 0[^}]*\}[\s\S]*?\.detail-copy h1\s*\{[^}]*margin:\s*28px 0 14px/s,
  "mobile Case detail should tighten the index-to-title rhythm"
);
assert.match(
  serviceCss,
  /@media \(max-width:\s*620px\)[\s\S]*?\.detail-copy\s*\{[^}]*justify-content:\s*flex-start[^}]*min-height:\s*390px[^}]*padding:\s*48px 20px 32px/s,
  "mobile Service detail should reveal its image earlier"
);
assert.match(
  serviceCss,
  /@media \(max-width:\s*620px\)[\s\S]*?\.detail-index\s*\{[^}]*margin:\s*24px 0 0[^}]*\}[\s\S]*?\.detail-copy h1\s*\{[^}]*margin:\s*14px 0 16px/s,
  "mobile Service detail should use the compact approved title rhythm"
);

for (const slug of ["build", "parts", "photo", "ecu", "chassis", "exhaust"]) {
  const html = read(`./pages/services/${slug}.html`);
  assert.match(html, /service-detail\.css\?v=mobile-spacing-20260722/);
}
