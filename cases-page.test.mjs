import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./pages/cases.html", import.meta.url), "utf8");
const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("./pages/cases.js", import.meta.url), "utf8");

assert.match(html, /<section class="cases-hero"/, "cases page should include the PLAN A hero section");
assert.match(html, /<section class="case-archive"/, "cases page should include the archive section below the hero");
assert.match(html, /<div class="cases-gap" aria-hidden="true"><\/div>/, "cases page should separate hero and archive with a dedicated gap");
assert.match(html, /data-filter="benz"[\s\S]*BENZ/, "filter sidebar should include BENZ");
assert.match(html, /data-filter="bmw"[\s\S]*BMW/, "filter sidebar should include BMW");
assert.match(html, /data-filter="audi"[\s\S]*AUDI/, "filter sidebar should include AUDI");
assert.equal((html.match(/class="case-feature-card/g) || []).length, 6, "PLAN A hero should show six feature cards");
assert.equal((html.match(/class="archive-card/g) || []).length, 6, "archive should use the current six cases as reference content");
assert.match(html, /36 MODIFIED-CAR CASE FILES/, "archive should be framed as a 36-case library");
assert.match(html, /<script src="\.\/cases\.js\?v=cases-archive-20260705"><\/script>/, "cases page should load its own interaction script");

assert.match(css, /\.cases-hero\s*\{[^}]*min-height:\s*calc\(100vh - 86px\)/s, "PLAN A hero should preserve a near-first-screen visual area");
assert.match(css, /\.cases-gap\s*\{[^}]*height:\s*100px/s, "hero and archive should be separated by 100px");
assert.match(css, /\.archive-layout\s*\{[^}]*grid-template-columns:\s*260px\s+minmax\(0,\s*1fr\)/s, "archive should use a left filter sidebar");
assert.match(css, /\.archive-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s, "archive should use four cards per row on desktop");
assert.match(css, /\.filter-option\.is-active/s, "active filter should have its own state styling");

assert.match(js, /data-filter/, "cases script should handle brand filter controls");
assert.match(js, /data-brand/, "cases script should filter archive cards by brand");
assert.match(js, /--cases-active-scene/, "cases script should update the hero background from case cards");
