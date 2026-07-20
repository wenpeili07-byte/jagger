import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("./script.js", import.meta.url), "utf8");

const headerMatch = html.match(/<header class="topbar">([\s\S]*?)<\/header>/);
const leftPanelMatch = html.match(/<div class="left-panel">([\s\S]*?)<h1>/);
const navLinks = [...html.matchAll(/<a href="([^"]+)" data-i18n="nav\.[^"]+">/g)].map((match) => match[1]);
const directPages = [
  "./pages/about.html",
  "./pages/services.html",
  "./pages/cases.html",
  "./pages/contact.html"
];
const servicePages = [
  "./pages/services/build.html",
  "./pages/services/parts.html",
  "./pages/services/photo.html",
  "./pages/services/ecu.html",
  "./pages/services/chassis.html",
  "./pages/services/exhaust.html"
];
const casePages = [
  "./pages/cases/case-01.html",
  "./pages/cases/case-02.html",
  "./pages/cases/case-03.html",
  "./pages/cases/case-04.html",
  "./pages/cases/case-05.html",
  "./pages/cases/case-06.html"
];

assert.ok(headerMatch, "topbar should exist");
assert.ok(leftPanelMatch, "left panel should exist");
assert.deepEqual(navLinks, directPages, "header middle navigation should link to blank pages");
for (const pagePath of directPages) {
  const pageHtml = readFileSync(new URL(pagePath, import.meta.url), "utf8");
  const expectedStyleVersion = pagePath === "./pages/cases.html" ? "cases-bg-visible-20260711" : "page-header-20260705";
  assert.match(pageHtml, new RegExp(`<link rel="stylesheet" href="\\.\\.\\/styles\\.css\\?v=${expectedStyleVersion}" \\/>`), `${pagePath} should load the shared stylesheet`);
  assert.match(pageHtml, /<header class="topbar">/, `${pagePath} should include the shared header`);
  assert.match(pageHtml, /<a class="brand" href="\.\.\/index\.html"/, `${pagePath} brand should link back to the homepage`);
  assert.match(pageHtml, /<a href="\.\/about\.html"(?: aria-current="page")?>ABOUT<\/a>[\s\S]*<a href="\.\/services\.html"(?: aria-current="page")?>SERVICES<\/a>[\s\S]*<a href="\.\/cases\.html"(?: aria-current="page")?>CASES<\/a>[\s\S]*<a href="\.\/contact\.html"(?: aria-current="page")?>CONTACT<\/a>/, `${pagePath} should keep same-level header links`);
}
for (const pagePath of [...casePages, ...servicePages]) {
  const pageHtml = readFileSync(new URL(pagePath, import.meta.url), "utf8");
  assert.match(pageHtml, /<link rel="stylesheet" href="\.\.\/\.\.\/styles\.css\?v=page-header-20260705" \/>/, `${pagePath} should load the shared stylesheet`);
  assert.match(pageHtml, /<header class="topbar">/, `${pagePath} should include the shared header`);
  assert.match(pageHtml, /<a class="brand" href="\.\.\/\.\.\/index\.html"/, `${pagePath} brand should link back to the homepage`);
  assert.match(pageHtml, /<a href="\.\.\/about\.html">关于<\/a>[\s\S]*<a href="\.\.\/services\.html"(?: aria-current="page")?>业务<\/a>[\s\S]*<a href="\.\.\/cases\.html"(?: aria-current="page")?>案例<\/a>[\s\S]*<a href="\.\.\/contact\.html">联系<\/a>/, `${pagePath} should keep Chinese default labels on parent-level header links`);
}
assert.doesNotMatch(html, /class="spine"|CASE FILES|06\/36 EXP/, "vertical case-file spine should be removed");
assert.doesNotMatch(headerMatch[1], /PERFORMANCE GARAGE · 06 CASES|性能车库|class="header-meta"|class="kicker"/, "header middle meta copy should be removed");
assert.doesNotMatch(headerMatch[1], /AUTO TUNING|PARTS|PHOTOGRAPHY|ECU CALIBRATION|class="deck"/, "header service keyword line should stay removed");
assert.doesNotMatch(headerMatch[1], /ROLL 01/, "header meta should not include ROLL 01");
assert.doesNotMatch(leftPanelMatch[1], /class="kicker"|class="deck"/, "left panel should not keep the two meta lines");
assert.doesNotMatch(js, /"hero\.kicker"|PERFORMANCE GARAGE · 06 CASES|性能车库 · 06 个案例/, "removed header meta translations should stay removed");
assert.doesNotMatch(js, /"hero\.deck"|AUTO TUNING · PARTS · PHOTOGRAPHY · ECU CALIBRATION|汽车改装 · 汽车配件 · 汽车摄影 · ECU 特调/, "removed header service keyword translations should stay removed");
assert.match(css, /grid-template-columns:\s*minmax\(210px,\s*1fr\)\s+auto\s+minmax\(210px,\s*1fr\)/, "topbar should use a centered three-column layout");
assert.match(css, /\.topbar\s*\{[^}]*background:\s*rgba\(17,\s*19,\s*21,\s*0\.3\)/s, "topbar should use a 30% transparent background");
assert.match(css, /\.brand\s*\{[^}]*font-size:\s*15\.6px/s, "header brand should match the navigation text size");
assert.match(css, /\.nav\s*\{[^}]*justify-self:\s*center/s, "header navigation should sit centered in the middle column");
assert.match(css, /\.nav a\s*\{[^}]*color:\s*var\(--ink\)[^}]*font-size:\s*15\.6px/s, "header navigation text should be white and about 30% larger");
assert.match(css, /\.nav a:hover\s*\{[^}]*color:\s*var\(--ink\)[^}]*text-shadow:/s, "header navigation hover should stay white and glow without changing color");
assert.match(css, /grid-template-columns:\s*minmax\(310px,\s*0\.88fr\)\s+minmax\(440px,\s*1\.15fr\)/, "cover should remove the middle spine column");
assert.match(css, /h1\s*\{[^}]*margin:\s*clamp\(6px,\s*2vw,\s*24px\)\s+0\s+0/s, "hero title should move upward");
