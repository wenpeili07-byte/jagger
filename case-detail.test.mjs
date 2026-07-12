import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const detailHtml = readFileSync(new URL("./pages/cases/case-01.html", import.meta.url), "utf8");
const casesHtml = readFileSync(new URL("./pages/cases.html", import.meta.url), "utf8");
const detailCss = readFileSync(new URL("./case-detail.css", import.meta.url), "utf8");

assert.match(casesHtml, /<a class="archive-card" href="\.\/cases\/case-01\.html" data-brand="bmw" data-index="0">/, "CASE 01 archive card should link to the detail page");
assert.match(detailHtml, /<title>Case 01 \| LONMA DYNAMIC<\/title>/, "case detail page should have a specific title");
assert.match(detailHtml, /<header class="topbar">/, "case detail page should include the shared header");
assert.match(detailHtml, /<a class="brand" href="\.\.\/\.\.\/index\.html"/, "case detail brand should link home from nested route");
assert.match(detailHtml, /<a href="\.\.\/cases\.html">CASES<\/a>/, "case detail header should link back to cases");
assert.match(detailHtml, /<a class="case-back" href="\.\.\/cases\.html">/, "case detail should include a back link to the case archive");
assert.match(detailHtml, /STREET[\s\S]*WIDEBODY/, "case detail should use the selected magazine case title");
assert.match(detailHtml, /街道宽体/, "case detail should include the Chinese case title");
assert.match(detailHtml, /Project Overview|Build Direction|Visual Record|Request Details/, "case detail should include magazine-style content sections");
assert.equal((detailHtml.match(/assets\/images\/网页\/optimized\/case-01\.jpg/g) || []).length, 3, "case detail should use the optimized CASE 01 image throughout the current blueprint");
assert.doesNotMatch(detailHtml, /assets\/images\/网页\/案例1\//, "case detail should avoid the oversized original image");

assert.match(detailCss, /\.case-detail-page\s*\{[^}]*linear-gradient\(180deg,\s*#101113/s, "case detail page should use a black-gray background instead of a photo background");
assert.doesNotMatch(detailCss, /--case-scene|background-image:\s*var\(--case-scene\)/, "case detail page should not use the case image as the full-page background");
assert.match(detailCss, /\.case-detail-hero\s*\{[^}]*grid-template-columns:/s, "case detail hero should use a desktop editorial split layout");
assert.match(detailCss, /@media \(max-width:\s*760px\)/, "case detail should include mobile responsive rules");
