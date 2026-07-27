import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const canvasCss = read("./layout-canvas.css");
const sharedCss = read("./styles.css");
const contentCss = read("./content-pages.css");
const shopCss = read("./shop.css");
const case02Css = read("./case-02.css");
const projectCss = existsSync(new URL("./project.css", import.meta.url))
  ? read("./project.css")
  : "";
const shopProductCss = existsSync(new URL("./shop-product.css", import.meta.url))
  ? read("./shop-product.css")
  : "";
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
  "./pages/project.html",
  "./pages/shop.html",
  "./pages/shop/forged-wheel.html",
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
  assert.match(html, /layout-canvas\.css\?v=project-planner-redesign-20260726/, `${path} should load the current shared canvas cache key`);
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
  /\.topbar\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto[^}]*grid-template-rows:\s*56px[^}]*min-height:\s*var\(--site-header-height\)/s,
  "mobile should use the approved one-row 56px header"
);
assert.match(
  mobileHeaderBlock,
  /\.topbar\s*\{[^}]*padding:\s*0 18px/s,
  "mobile topbar should keep the compact horizontal padding from the selected mock"
);
assert.match(
  mobileHeaderBlock,
  /\.topbar\s*\{[^}]*backdrop-filter:\s*none[^}]*-webkit-backdrop-filter:\s*none/s,
  "mobile topbar must not create a containing block that traps the fixed bottom navigation"
);
assert.match(
  mobileHeaderBlock,
  /\.nav\s*\{[^}]*position:\s*fixed[^}]*right:\s*0[^}]*bottom:\s*0[^}]*left:\s*0[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)[^}]*padding-bottom:\s*env\(safe-area-inset-bottom\)/s,
  "mobile should keep all five navigation links in a safe-area-aware fixed bottom module"
);
assert.match(
  mobileHeaderBlock,
  /\.nav a\s*\{[^}]*min-height:\s*64px[^}]*font-size:\s*11px/s,
  "mobile navigation links should keep readable labels and generous touch targets"
);
assert.match(
  mobileHeaderBlock,
  /\.nav a\[aria-current="page"\]::after\s*\{[^}]*position:\s*absolute[^}]*top:\s*0[^}]*right:\s*12px[^}]*bottom:\s*auto[^}]*left:\s*12px[^}]*width:\s*auto[^}]*margin-top:\s*0/s,
  "mobile current-page line should sit on the top edge of the fixed module"
);
assert.match(
  mobileHeaderBlock,
  /\.site-shell\s*\{[^}]*padding-bottom:\s*calc\(64px \+ env\(safe-area-inset-bottom\)\)/s,
  "mobile pages should reserve space for the fixed navigation"
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
  /:root\s*\{[^}]*--site-header-height:\s*56px/s,
  "mobile canvas should expose the approved 56px header height"
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
  /@media \(max-width:\s*767px\)[\s\S]*\.shop-product-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
  "Shop should use two product columns on mobile"
);
test("Case 02 stays full-width and 16:9 on 1900px and 2200px canvases", () => {
  const videoStageRule = ruleBlock(
    case02Css,
    ".case02-video-stage",
    "Case 02 should define its poster stage"
  );
  assert.match(videoStageRule, /width:\s*100%/);
  assert.match(videoStageRule, /aspect-ratio:\s*16\s*\/\s*9/);
  assert.doesNotMatch(
    videoStageRule,
    /max-height:|width:\s*min\(/,
    "wide canvases should keep scrolling instead of shrinking or distorting the poster stage"
  );
  assert.match(videoStageRule, /overflow:\s*hidden/);

  for (const canvasWidth of [1900, 2200]) {
    const stageHeight = canvasWidth * 9 / 16;
    assert.equal(
      Number((canvasWidth / stageHeight).toFixed(3)),
      1.778,
      `${canvasWidth}px canvas should retain a 16:9 stage`
    );
  }

  assert.match(
    case02Css,
    /\.case02-video-stage\s*>\s*video\s*\{[^}]*width:\s*100%[^}]*height:\s*100%[^}]*object-fit:\s*cover/s
  );
});

test("Case 02 story stacks in reading order below 1000px", () => {
  const case02StackBlock = mediaBlock(
    case02Css,
    "@media (max-width: 1000px)",
    "Case 02 should define its stacked story range"
  );
  assert.match(
    case02StackBlock,
    /\.case02-story-beat\s*\{[^}]*grid-template-columns:\s*1fr/s,
    "Case 02 story beats should use one column"
  );
  assert.doesNotMatch(
    case02StackBlock,
    /\border\s*:/,
    "stacked story beats should preserve their document reading order"
  );
});

test("Case 02 mobile moves copy below the poster and keeps useful case links", () => {
  const case02MobileBlock = mediaBlock(
    case02Css,
    "@media (max-width: 767px)",
    "Case 02 should define its mobile range"
  );
  assert.match(
    case02MobileBlock,
    /\.case02-video-stage\s*\{[^}]*aspect-ratio:\s*auto/s,
    "the mobile stage should grow to include copy beneath the poster"
  );
  assert.match(
    case02MobileBlock,
    /\.case02-video-stage\s*>\s*video\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9/s,
    "the mobile poster should retain its 16:9 frame"
  );
  assert.match(
    case02MobileBlock,
    /\.case02-video-copy\s*\{[^}]*position:\s*static/s,
    "mobile copy should leave the poster overlay"
  );
  assert.match(
    case02MobileBlock,
    /\.case02-page\s+\.detail-pagination a\s*\{[^}]*min-height:\s*48px/s,
    "adjacent case links should retain useful mobile touch targets"
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

test("contact inquiry keeps prefill and form in its single tablet column", () => {
  const contactTabletBlock = mediaBlock(
    contentCss,
    "@media (max-width: 1180px)",
    "content styles should define the contact tablet range"
  );

  assert.match(
    contactTabletBlock,
    /\.contact-form-stack\s*\{[^}]*grid-column:\s*1/s,
    "contact prefill and form should remain in the sole contact inquiry column at tablet widths"
  );
});

test("project planner preserves its desktop split and mobile action clearance", () => {
  assert.match(
    projectCss,
    /\.project-planner\s*\{[^}]*min-height:\s*min\(calc\(100vh - var\(--site-header-height\)\),\s*var\(--site-first-screen-max\)\)/s,
    "project planner should use the shared first-screen canvas tokens"
  );
  assert.match(
    projectCss,
    /\.project-workspace\s*\{[^}]*grid-template-columns:\s*minmax\(420px,\s*39fr\)\s+minmax\(0,\s*61fr\)/s,
    "project planner should use the approved desktop split"
  );
  assert.match(
    projectCss,
    /\.project-visual\s*\{[^}]*min-height:\s*100%[^}]*overflow:\s*hidden/s
  );
  assert.match(
    projectCss,
    /\.project-visual img\s*\{[^}]*object-fit:\s*cover[^}]*object-position:\s*center 62%/s
  );
  assert.match(
    projectCss,
    /\.project-visual img\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0/s,
    "project planner media should not expand the first-screen workspace from its intrinsic ratio"
  );
  assert.doesNotMatch(projectCss, /transform:\s*scale\(/);
  assert.doesNotMatch(
    projectCss,
    /\.project-visual img\s*\{[^}]*transition:[^}]*transform/s
  );
  assert.match(
    projectCss,
    /@media \(max-width:\s*1100px\)[\s\S]*?\.project-workspace\s*\{[^}]*grid-template-columns:\s*1fr/s,
    "project planner should stack below 1100px"
  );
  const projectMobileBlock = mediaBlock(
    projectCss,
    "@media (max-width: 767px)",
    "project planner should define its mobile range"
  );
  assert.match(
    projectMobileBlock,
    /\.project-progress\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s,
    "project planner should retain all four compact progress steps on mobile"
  );
  assert.match(
    projectMobileBlock,
    /\.project-controls\s*\{[^}]*padding-bottom:\s*calc\(92px \+ env\(safe-area-inset-bottom\)\)/s,
    "project controls should reserve mobile action space"
  );
  assert.match(
    projectMobileBlock,
    /\.project-actions\s*\{[^}]*position:\s*sticky[^}]*bottom:\s*calc\(64px \+ env\(safe-area-inset-bottom\)\)/s,
    "project actions should remain above the fixed mobile navigation"
  );
});

test("forged wheel detail stacks cleanly and clears the mobile navigation", () => {
  assert.match(
    shopProductCss,
    /\.product-detail\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.08fr\)\s+minmax\(420px,\s*0\.92fr\)/s,
    "product detail should use the approved desktop split"
  );
  assert.match(
    shopProductCss,
    /\.product-stage-main\s*\{[^}]*aspect-ratio:\s*1[^}]*background:\s*#0d0f11/s,
    "product media should retain square neutral staging"
  );
  assert.match(
    shopProductCss,
    /\.product-stage-main\s*>\s*img\s*\{[^}]*object-fit:\s*contain/s,
    "the wheel must remain fully visible"
  );
  assert.match(
    shopProductCss,
    /@media \(max-width:\s*1100px\)[\s\S]*?\.product-detail\s*\{[^}]*grid-template-columns:\s*1fr/s,
    "product detail should stack below 1100px"
  );
  const productMobileBlock = mediaBlock(
    shopProductCss,
    "@media (max-width: 767px)",
    "product detail should define its mobile range"
  );
  assert.match(
    productMobileBlock,
    /\.forged-wheel-page\s*\{[^}]*padding-bottom:\s*calc\(148px \+ env\(safe-area-inset-bottom\)\)/s,
    "mobile product content should reserve action-bar space"
  );
  assert.match(
    productMobileBlock,
    /\.product-actions\s*\{[^}]*position:\s*fixed[^}]*bottom:\s*calc\(64px \+ env\(safe-area-inset-bottom\)\)/s,
    "mobile product actions should sit above the shared bottom navigation"
  );
});

test("new pages preserve the shared canvas and mobile stacking", () => {
  const productCss = read("./shop-product.css");

  assert.doesNotMatch(`${projectCss}${productCss}${case02Css}`, /width:\s*100vw|transform:\s*scale\(/);
  assert.match(projectCss, /@media \(max-width:\s*1100px\)[\s\S]*\.project-workspace\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(productCss, /@media \(max-width:\s*1100px\)[\s\S]*\.product-detail\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(case02Css, /@media \(max-width:\s*1000px\)[\s\S]*\.case02-story-beat\s*\{[^}]*grid-template-columns:\s*1fr/s);
  assert.match(productCss, /padding-bottom:\s*calc\(148px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(projectCss, /bottom:\s*calc\(64px \+ env\(safe-area-inset-bottom\)\)/);
});

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
