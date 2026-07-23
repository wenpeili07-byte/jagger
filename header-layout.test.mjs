import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
const js = readFileSync(new URL("./script.js", import.meta.url), "utf8");
const renderer = readFileSync(new URL("./scripts/render-detail-pages.mjs", import.meta.url), "utf8");
const sharedAssetVersion = "contact-form-20260723";
const contentStylesVersion = "contact-form-20260723";
const canvasVersion = "contact-form-20260723";
const mediaBlock = (source, marker, message) => {
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, message);
  const nextMedia = source.indexOf("\n@media", start + marker.length);
  return source.slice(start, nextMedia === -1 ? source.length : nextMedia);
};

const headerMatch = html.match(/<header class="topbar">([\s\S]*?)<\/header>/);
const leftPanelMatch = html.match(/<div class="left-panel">([\s\S]*?)<h1>/);
const navLinks = [...html.matchAll(/<a href="([^"]+)" data-i18n="nav\.[^"]+">/g)].map((match) => match[1]);
const directPages = [
  "./pages/about.html",
  "./pages/services.html",
  "./pages/cases.html",
  "./pages/contact.html",
  "./pages/shop.html"
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
assert.match(html, new RegExp(`<link rel="stylesheet" href="\\.\\/styles\\.css\\?v=${sharedAssetVersion}" \\/>`), "homepage should advance the shared stylesheet cache key");
assert.match(html, new RegExp(`<link rel="stylesheet" href="\\.\\/layout-canvas\\.css\\?v=${canvasVersion}" \\/>`), "homepage should advance the canvas cache key");
assert.match(html, new RegExp(`<script src="\\.\\/script\\.js\\?v=${sharedAssetVersion}"></script>`), "homepage should advance the controller cache key");
for (const pagePath of directPages) {
  const pageHtml = readFileSync(new URL(pagePath, import.meta.url), "utf8");
  assert.match(pageHtml, new RegExp(`<link rel="stylesheet" href="\\.\\.\\/styles\\.css\\?v=${sharedAssetVersion}" \\/>`), `${pagePath} should use the expected shared stylesheet cache key`);
  assert.match(pageHtml, new RegExp(`<link rel="stylesheet" href="\\.\\.\\/layout-canvas\\.css\\?v=${canvasVersion}" \\/>`), `${pagePath} should advance the canvas cache key`);
  if (pagePath !== "./pages/cases.html" && pagePath !== "./pages/shop.html") {
    assert.match(pageHtml, new RegExp(`<link rel="stylesheet" href="\\.\\.\\/content-pages\\.css\\?v=${contentStylesVersion}" \\/>`), `${pagePath} should preserve the content stylesheet cache key`);
  }
  assert.match(pageHtml, /<header class="topbar">/, `${pagePath} should include the shared header`);
  assert.match(pageHtml, /<a class="brand" href="\.\.\/index\.html"/, `${pagePath} brand should link back to the homepage`);
  assert.match(pageHtml, /<a href="\.\/about\.html"(?: aria-current="page")?>ABOUT<\/a>[\s\S]*<a href="\.\/services\.html"(?: aria-current="page")?>SERVICES<\/a>[\s\S]*<a href="\.\/cases\.html"(?: aria-current="page")?>CASES<\/a>[\s\S]*<a href="\.\/contact\.html"(?: aria-current="page")?>CONTACT<\/a>[\s\S]*<a href="\.\/shop\.html"(?: aria-current="page")?>SHOP<\/a>/, `${pagePath} should keep same-level header links`);
}
for (const pagePath of [...casePages, ...servicePages]) {
  const pageHtml = readFileSync(new URL(pagePath, import.meta.url), "utf8");
  assert.match(pageHtml, new RegExp(`<link rel="stylesheet" href="\\.\\.\\/\\.\\.\\/styles\\.css\\?v=${sharedAssetVersion}" \\/>`), `${pagePath} should advance the shared stylesheet cache key`);
  assert.match(pageHtml, new RegExp(`<link rel="stylesheet" href="\\.\\.\\/\\.\\.\\/layout-canvas\\.css\\?v=${canvasVersion}" \\/>`), `${pagePath} should advance the canvas cache key`);
  assert.match(pageHtml, /<header class="topbar">/, `${pagePath} should include the shared header`);
  assert.match(pageHtml, /<a class="brand" href="\.\.\/\.\.\/index\.html"/, `${pagePath} brand should link back to the homepage`);
  assert.match(pageHtml, /<a href="\.\.\/about\.html">ABOUT<\/a>[\s\S]*<a href="\.\.\/services\.html"(?: aria-current="page")?>SERVICES<\/a>[\s\S]*<a href="\.\.\/cases\.html"(?: aria-current="page")?>CASES<\/a>[\s\S]*<a href="\.\.\/contact\.html">CONTACT<\/a>[\s\S]*<a href="\.\.\/shop\.html">SHOP<\/a>/, `${pagePath} should keep English default labels on parent-level header links`);
}
assert.match(renderer, new RegExp(`styles\\.css\\?v=${sharedAssetVersion}`), "detail renderer should advance the shared stylesheet cache key");
assert.match(renderer, new RegExp(`layout-canvas\\.css\\?v=${canvasVersion}`), "detail renderer should preserve the canvas cache key");
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
assert.match(
  css,
  /\.nav a:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent-bright\)[^}]*outline-offset:\s*5px/s,
  "navigation should keep a visible keyboard focus indicator"
);
const reducedMotionBlock = mediaBlock(
  css,
  "@media (prefers-reduced-motion: reduce)",
  "shared styles should define a reduced-motion range"
);
assert.match(
  reducedMotionBlock,
  /\.nav a,[\s\S]*?\.lang-toggle,[\s\S]*?\.lang-option,[\s\S]*?\.content-footer a\s*\{[^}]*transition:\s*none/s,
  "shell glow transitions, including language options, should stop when reduced motion is requested"
);
assert.ok(
  css.indexOf("@media (prefers-reduced-motion: reduce)") > css.indexOf(".lang-option {"),
  "reduced-motion overrides should follow the language-control transitions they disable"
);
assert.match(headerMatch[1], /<nav class="nav"[^>]*data-i18n-aria="nav\.label"/, "homepage nav should expose a translated accessible name key");
assert.match(js, /"nav\.label":\s*"主导航"/, "Chinese translations should include the main navigation label");
assert.match(js, /"nav\.label":\s*"Main navigation"/, "English translations should include the main navigation label");
assert.match(css, /grid-template-columns:\s*minmax\(310px,\s*0\.88fr\)\s+minmax\(440px,\s*1\.15fr\)/, "cover should remove the middle spine column");
assert.match(css, /h1\s*\{[^}]*margin:\s*clamp\(6px,\s*2vw,\s*24px\)\s+0\s+0/s, "hero title should move upward");
const mobileHeader = mediaBlock(css, "@media (max-width: 767px)", "mobile header range should exist");
assert.match(
  mobileHeader,
  /\.nav\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/s,
);
