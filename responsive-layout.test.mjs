import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const canvasCss = read("./layout-canvas.css");
const sharedCss = read("./styles.css");
const contentCss = read("./content-pages.css");
const shopCss = read("./shop.css");
const case02Css = read("./case-02.css");
const mediaBlock = (source, marker, message) => {
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, message);
  const nextMedia = source.indexOf("\n@media", start + marker.length);
  return source.slice(start, nextMedia === -1 ? source.length : nextMedia);
};
const ruleBlock = (source, selector, message) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));
  assert.ok(match, message);
  return match[1];
};
const publicPages = [
  "./index.html",
  "./pages/about.html",
  "./pages/services.html",
  "./pages/cases.html",
  "./pages/contact.html",
  "./pages/shop.html",
  "./pages/cases/case-01.html",
  "./pages/services/build.html",
  "./pages/services/parts.html",
  "./pages/services/photo.html",
  "./pages/services/ecu.html",
  "./pages/services/chassis.html",
  "./pages/services/exhaust.html",
];

for (const id of ["02", "03", "04", "05", "06"]) {
  publicPages.push(`./pages/cases/case-${id}.html`);
}

// Task 2: shared canvas and cache coverage.
assert.match(canvasCss, /--site-max-width:\s*2200px/, "canvas should define the 2200px site maximum");
assert.match(canvasCss, /--site-header-height:\s*77px/, "canvas should define the 77px desktop header");
assert.match(canvasCss, /--site-first-screen-max:\s*973px/, "canvas should cap first screens at 973px below the header");
assert.match(canvasCss, /\.site-shell\s*\{[^}]*max-width:\s*var\(--site-max-width\)/s, "all shells should consume the shared maximum");
assert.match(canvasCss, /\.site-shell::before,\s*\.site-shell::after\s*\{[^}]*width:\s*min\(100%,\s*var\(--site-max-width\)\)/s, "fixed backgrounds should use the shared maximum");
assert.doesNotMatch(canvasCss, /1728px/, "the shared canvas should not retain the obsolete width");
assert.doesNotMatch(canvasCss, /transform:\s*scale\(/, "the shared canvas must not scale the page");
const globalSelectors = new Set(["html", "body", ".site-shell", ".content-page.site-shell"]);
for (const css of [canvasCss, sharedCss, contentCss].join("\n").matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const [, selectorText, declarations] = css;
  const selectors = selectorText.split(",").map((selector) => selector.trim());
  if (selectors.some((selector) => globalSelectors.has(selector))) {
    assert.doesNotMatch(declarations, /transform:\s*scale\(/, "global page selectors must not scale the page");
  }
}
assert.match(canvasCss, /\.cover,\s*\.cases-hero\s*\{[^}]*min-height:\s*min\(calc\(100vh - var\(--site-header-height\)\),\s*var\(--site-first-screen-max\)\)/s, "cover and cases hero should consume the shared header and first-screen height variables");
assert.doesNotMatch(contentCss, /\.content-page\.site-shell\s*\{[^}]*max-width:/s, "content pages should not own a second canvas width");

for (const path of publicPages) {
  const html = read(path);
  assert.match(html, /layout-canvas\.css\?v=canvas-20260721-2200/, `${path} should load the current 2200px canvas version`);
}

// Task 3: compact header and services rules.
assert.match(sharedCss, /\.topbar\s*\{[^}]*min-height:\s*var\(--site-header-height\)/s, "topbar should consume the shared header height");
assert.match(contentCss, /@media \(min-width:\s*768px\) and \(max-width:\s*980px\)[\s\S]*?\.service-process-row\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*56%\)\s+minmax\(0,\s*44%\)/s, "790px services should keep the uploaded process-rail design with shrinkable columns");
const tabletHeaderBlock = mediaBlock(
  sharedCss,
  "@media (min-width: 768px) and (max-width: 980px)",
  "shared styles should define the tablet header range"
);
assert.match(
  tabletHeaderBlock,
  /\.topbar\s*\{[^}]*grid-template-columns:\s*minmax\(150px,\s*1fr\)\s+auto\s+minmax\(120px,\s*1fr\)[^}]*min-height:\s*var\(--site-header-height\)/s,
  "tablet and narrow split screens should retain a 77px three-column header"
);
const mobileHeaderBlock = mediaBlock(
  sharedCss,
  "@media (max-width: 767px)",
  "shared styles should define the mobile header range"
);
assert.match(
  mobileHeaderBlock,
  /\.topbar\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto[^}]*grid-template-rows:\s*44px 44px[^}]*min-height:\s*var\(--site-header-height\)/s,
  "mobile should use a stable two-row header"
);
assert.match(
  mobileHeaderBlock,
  /\.topbar\s*\{[^}]*padding:\s*7\.5px 18px/s,
  "mobile topbar should total 104px: 44px + 44px rows, 7.5px vertical padding on each side, and 1px border"
);
assert.match(
  mobileHeaderBlock,
  /\.nav\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)[^}]*width:\s*100%/s,
  "mobile should keep five navigation links on one row"
);
assert.match(
  mobileHeaderBlock,
  /\.nav a\[aria-current="page"\]::after\s*\{[^}]*position:\s*absolute[^}]*right:\s*12px[^}]*bottom:\s*4px[^}]*left:\s*12px[^}]*width:\s*auto[^}]*margin-top:\s*0/s,
  "mobile current-page underline should not change the navigation label height"
);
const smallPhoneBlock = mediaBlock(
  sharedCss,
  "@media (max-width: 620px)",
  "shared styles should define the small-phone range"
);
assert.doesNotMatch(
  smallPhoneBlock,
  /\.nav\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s,
  "small phones must not collapse navigation into two columns"
);
const canvasMobileBlock = mediaBlock(
  canvasCss,
  "@media (max-width: 767px)",
  "canvas should define the mobile header range"
);
assert.match(
  canvasMobileBlock,
  /:root\s*\{[^}]*--site-header-height:\s*104px/s,
  "mobile canvas should expose the approved 104px header height"
);
const compactDesktopMarker = "@media (min-width: 900px) and (max-width: 1180px)";
const compactDesktopStart = sharedCss.indexOf(compactDesktopMarker);
assert.notEqual(compactDesktopStart, -1, "shared styles should define the 900-1180px compact-desktop range");
const compactDesktopEnd = sharedCss.indexOf("@media", compactDesktopStart + compactDesktopMarker.length);
const compactDesktopBlock = sharedCss.slice(compactDesktopStart, compactDesktopEnd);
assert.match(compactDesktopBlock, /\.cover,\s*\.cases-hero\s*\{[^}]*grid-template-columns:\s*minmax\(240px,\s*0\.76fr\)\s+minmax\(0,\s*1\.24fr\)/s, "compact desktops should retain shrinkable two-column homepage and cases heroes");
assert.doesNotMatch(compactDesktopBlock, /grid-template-columns:\s*1fr/, "compact desktops must not collapse major heroes to one column");
const compactCanvasStart = canvasCss.indexOf(compactDesktopMarker);
assert.notEqual(compactCanvasStart, -1, "the final canvas stylesheet should own compact-desktop spacing");
const compactCanvasEnd = canvasCss.indexOf("@media", compactCanvasStart + compactDesktopMarker.length);
const compactCanvasBlock = canvasCss.slice(compactCanvasStart, compactCanvasEnd);
assert.match(compactCanvasBlock, /\.cover,\s*\.cases-hero\s*\{[^}]*padding-inline:\s*clamp\(20px,\s*3vw,\s*36px\)/s, "compact desktop gutters should survive the final canvas cascade");
assert.match(compactCanvasBlock, /\.cover\s*\{[^}]*padding-block:\s*26px/s, "compact desktop homepage content should fit the 973px first screen");
assert.match(sharedCss, /@media \(max-width:\s*899px\)[\s\S]*?\.cover\s*\{[^}]*grid-template-columns:\s*1fr/s, "split-screen layouts may collapse the homepage below the compact-desktop range");
assert.match(sharedCss, /@media \(max-width:\s*899px\)[\s\S]*?\.cases-hero,\s*\.archive-layout\s*\{[^}]*grid-template-columns:\s*1fr/s, "split-screen layouts may collapse cases below the compact-desktop range");

// Task 5: Shop and Case 02 responsive integration guards.
assert.doesNotMatch(
  `${shopCss}\n${case02Css}`,
  /width:\s*100vw|transform:\s*scale\(/,
  "Shop and Case 02 must not use viewport-width sizing or whole-element scaling"
);
assert.match(
  shopCss,
  /@media \(min-width:\s*768px\) and \(max-width:\s*1279px\)/,
  "Shop should define the approved tablet and split-screen range"
);
assert.match(
  shopCss,
  /@media \(max-width:\s*767px\)[\s\S]*\.shop-product-grid\s*\{[^}]*grid-template-columns:\s*1fr/s,
  "Shop should use a single product column on mobile"
);
assert.match(
  case02Css,
  /@media \(max-width:\s*767px\)[\s\S]*\[data-case-marker\]\s*\{[^}]*display:\s*none/s,
  "Case 02 should hide image markers on mobile"
);
test("Case 02 desktop showcase expands with intrinsic rail content", () => {
  const case02ShowcaseRule = ruleBlock(
    case02Css,
    ".case02-showcase",
    "Case 02 should define its desktop showcase"
  );
  assert.doesNotMatch(
    case02ShowcaseRule,
    /(?:^|\n)\s*height\s*:/,
    "Case 02 desktop showcase should expand with intrinsic rail content on short viewports"
  );
});

test("Case 02 tablet image preserves the approved 4:3 geometry", () => {
  const case02TabletBlock = mediaBlock(
    case02Css,
    "@media (min-width: 768px) and (max-width: 1279px)",
    "Case 02 should define the approved tablet range"
  );
  assert.match(
    case02TabletBlock,
    /\.case02-media\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3/s,
    "Case 02 should preserve a 4:3 tablet image"
  );
});
const lateCompactCasesBlock = mediaBlock(
  sharedCss,
  "@media (max-width: 1180px)",
  "shared styles should define the late compact cases override"
);
assert.match(
  lateCompactCasesBlock,
  /\.cases-hero\s*\{[^}]*grid-template-columns:\s*minmax\(240px,\s*0\.76fr\)\s+minmax\(0,\s*1\.24fr\)[^}]*gap:\s*clamp\(16px,\s*2\.2vw,\s*28px\)/s,
  "late cases styles should preserve shrinkable columns through the final cascade"
);

// Task 4: every large desktop should fit the complete homepage inside the shared 973px first screen.
const largeDesktopMarker = "@media (min-width: 1700px)";
const largeDesktopStart = canvasCss.indexOf(largeDesktopMarker);
assert.notEqual(largeDesktopStart, -1, "canvas should define a 1700px large-desktop compaction override");
const largeDesktopBlock = canvasCss.slice(largeDesktopStart);
assert.match(largeDesktopBlock, /\.cover\s*\{[^}]*padding-block:\s*27\.5px/s, "large desktops should use the verified cover padding");
assert.match(largeDesktopBlock, /\.film-card\s*\{[^}]*min-height:\s*106px[^}]*padding-block:\s*16px/s, "large desktops should use the verified compact film-card dimensions");
assert.match(largeDesktopBlock, /\.film-card\.is-active\s*\{[^}]*min-height:\s*139px/s, "large desktops should use the verified active-card height");
assert.match(largeDesktopBlock, /\.detail-panel\s*\{[^}]*margin-top:\s*12px[^}]*padding-top:\s*12px/s, "large desktops should use the verified compact detail spacing");
assert.doesNotMatch(largeDesktopBlock, /max-height:/, "large-desktop compaction should also hold on tall wide displays");
