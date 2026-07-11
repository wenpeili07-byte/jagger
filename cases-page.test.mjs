import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./pages/cases.html", import.meta.url), "utf8");
const css = [
  readFileSync(new URL("./styles.css", import.meta.url), "utf8"),
  readFileSync(new URL("./layout-canvas.css", import.meta.url), "utf8"),
  readFileSync(new URL("./case-rail.css", import.meta.url), "utf8")
].join("\n");
const js = readFileSync(new URL("./pages/cases.js", import.meta.url), "utf8");

assert.match(html, /<section class="cases-hero"/, "cases page should include the PLAN A hero section");
assert.match(html, /<section class="case-archive"/, "cases page should include the archive section below the hero");
assert.match(html, /<div class="cases-gap" aria-hidden="true"><\/div>/, "cases page should separate hero and archive with a dedicated gap");
assert.match(html, /data-filter="benz"[\s\S]*BENZ/, "filter sidebar should include BENZ");
assert.match(html, /data-filter="bmw"[\s\S]*BMW/, "filter sidebar should include BMW");
assert.match(html, /data-filter="audi"[\s\S]*AUDI/, "filter sidebar should include AUDI");
assert.doesNotMatch(html, /class="case-feature-card/, "PLAN A hero should no longer use the six large case modules");
assert.match(html, /<section class="mwg_effect060"/, "PLAN A hero should use the effect 060 masked vertical image rail");
assert.match(html, /<div class="pin-height">[\s\S]*<div class="container">[\s\S]*<div class="slides">/, "effect 060 rail should use a pin-height, fixed container, and vertical slides list");
assert.doesNotMatch(html, /<div class="content">|Featured Projects|2022 → 2026/, "effect 060 rail should not show the white title block or its text");
assert.equal((html.match(/data-scene="\.\.\/assets\/images\/网页\/optimized\/case-/g) || []).length, 6, "effect 060 rail should show six optimized case image slides");
assert.equal((html.match(/<img[^>]+src="\.\.\/assets\/images\/网页\/optimized\/case-/g) || []).length, 12, "case rail and archive should use optimized case images");
assert.doesNotMatch(html, /assets\/images\/网页\/案例[1-6]\//, "cases page should avoid loading oversized original case images");
assert.equal((html.match(/class="slide spacer"/g) || []).length, 4, "effect 060 rail should include spacer slides so five positions stay visible");
assert.equal((html.match(/class="archive-card/g) || []).length, 6, "archive should use the current six cases as reference content");
assert.doesNotMatch(html, /<section class="masked-image-rail"/, "archive should not include the old scrolling masked image rail");
assert.match(html, /36 MODIFIED-CAR CASE FILES/, "archive should be framed as a 36-case library");
assert.match(html, /layout-canvas\.css\?v=canvas-20260706-1728/, "cases page should load the 1728 design canvas layout override");
assert.match(html, /case-rail\.css\?v=hero-rail-20260709/, "cases page should load the hero rail stylesheet separately from the large main stylesheet");
assert.doesNotMatch(html, /assets\/vendor\/motion-core\.js/, "static hero rail should not load GSAP vendor files");
assert.doesNotMatch(html, /assets\/vendor\/scroll-motion\.js/, "static hero rail should not load ScrollTrigger vendor files");
assert.match(html, /<script src="\.\/cases\.js\?v=hero-rail-20260709"><\/script>/, "cases page should keep its archive filter script");
assert.match(html, /function fadeToScene\(scene\)/, "cases page should keep a single inline scene fade controller");
assert.doesNotMatch(html, /@keyframes sceneFadeIn/, "cases page should use the shared stylesheet fade animation instead of duplicating it inline");
assert.equal((css.match(/@keyframes sceneFadeIn/g) || []).length, 1, "shared stylesheet should define the background fade-in animation once");
assert.match(css, /@keyframes sceneFadeIn\s*\{\s*0%\s*\{\s*opacity:\s*0\.16;\s*\}\s*100%\s*\{\s*opacity:\s*1;\s*\}\s*\}/s, "case background fade should only fade from transparent to solid");
const sceneFadeBlock = css.match(/@keyframes sceneFadeIn\s*\{[\s\S]*?\n\}/)?.[0] || "";
assert.doesNotMatch(sceneFadeBlock, /(transform|scale|background-size|filter):/, "case background fade should not scale, resize, or filter the image");
assert.doesNotMatch(css, /data:image\//, "stylesheets should reference image files instead of embedding base64 images");
assert.doesNotMatch(html, /scene-fade-layer/, "cases page should not keep old fade-layer cleanup from the removed animation path");
assert.match(html, /\["mouseenter",\s*"focus",\s*"click"\]/, "case background should use one stable hover event plus focus and click");
assert.doesNotMatch(html, /pointerenter/, "case background should not bind both pointerenter and mouseenter");
assert.match(html, /activeScene === scene/, "case background should not restart the fade when the active scene is unchanged");

assert.match(css, /\.cases-hero\s*\{[^}]*min-height:\s*min\(calc\(100vh - 77px\),\s*973px\)/s, "PLAN A hero should preserve a 1728x1050 first-screen visual area without stretching on taller displays");
assert.match(css, /\.cases-gap\s*\{[^}]*height:\s*100px/s, "hero and archive should be separated by 100px");
assert.match(css, /\.archive-layout\s*\{[^}]*grid-template-columns:\s*260px\s+minmax\(0,\s*1fr\)/s, "archive should use a left filter sidebar");
assert.match(css, /\.archive-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s, "archive should use four cards per row on desktop");
assert.match(css, /\.mwg_effect060\s*\{[^}]*--slot-h:\s*clamp\(104px,\s*12\.2vh,\s*128px\)/s, "effect 060 rail should use compact five-slot image positions");
assert.match(css, /\.mwg_effect060\s+\.pin-height\s*\{[^}]*height:\s*auto/s, "effect 060 rail should not add extra scroll-driven height");
assert.match(css, /\.mwg_effect060\s+\.container\s*\{[^}]*position:\s*relative[^}]*overflow:\s*hidden/s, "effect 060 rail should stay static instead of sticky during page scroll");
assert.match(css, /\.mwg_effect060\s+\.container\s*\{[^}]*grid-template-columns:\s*minmax\(240px,\s*1fr\)/s, "effect 060 rail should use a single image column after removing the title block");
assert.match(css, /\.mwg_effect060\s+\.container\s*\{[^}]*border:\s*0/s, "effect 060 rail should not draw a white frame around the right module");
assert.doesNotMatch(css, /\.mwg_effect060\s+\.content/, "effect 060 rail should not keep styles for the removed title block");
assert.match(css, /\.mwg_effect060\s+\.container\s*\{[^}]*background:\s*transparent/s, "right case module should not have its own background color");
assert.match(css, /\.mwg_effect060\s+\.slides\s*\{[^}]*overflow-y:\s*auto[^}]*overscroll-behavior:\s*contain/s, "effect 060 slides should scroll independently inside the right module");
assert.match(css, /\.mwg_effect060\s+\.slides\s*\{[^}]*scrollbar-width:\s*none/s, "effect 060 independent rail should keep the scrollbar hidden");
assert.match(css, /\.mwg_effect060\s+\.slide\s*\{[^}]*height:\s*var\(--slot-h\)[^}]*clip-path:\s*inset\(12%\s+0\s+12%\s+0\)/s, "each effect 060 slide should sit inside a mask frame");
assert.match(css, /\.mwg_effect060\s+\.media\s*\{[^}]*object-fit:\s*cover[^}]*transform:\s*translateY\(-12%\)\s+scale\(1\.14\)/s, "effect 060 images should stay masked without scroll-driven transform changes");
assert.match(css, /\.filter-option\.is-active/s, "active filter should have its own state styling");

assert.match(js, /data-filter/, "cases script should handle brand filter controls");
assert.match(js, /data-brand/, "cases script should filter archive cards by brand");
assert.match(js, /function initIndependentRailScroll\(\)/, "cases script should initialize independent rail wheel scrolling");
assert.match(js, /rail\.addEventListener\("wheel"/, "right case module should own its wheel interaction");
assert.match(js, /event\.preventDefault\(\)/, "right case module wheel interaction should not leak into page scroll");
assert.doesNotMatch(js, /function initEffect060Rail/, "cases script should not initialize scroll-driven rail motion");
assert.doesNotMatch(js, /requestAnimationFrame/, "right case module should not be driven by page scroll");
assert.doesNotMatch(js, /window\.addEventListener\("scroll"/, "right case module should not listen to page scroll");
assert.doesNotMatch(js, /slides\.style\.transform/, "effect 060 rail should not move the slides list during scroll");
assert.doesNotMatch(js, /media\.style\.transform/, "effect 060 rail should not resize images during scroll");
assert.doesNotMatch(js, /slide\.style\.clipPath/, "effect 060 rail should not animate slide masks during scroll");
assert.doesNotMatch(js, /buildMaskedImageRail/, "cases script should not generate an archive rail");
assert.doesNotMatch(js, /initCaseScrollMotion/, "cases script should not run GSAP case-card motion after the cards are removed");
assert.doesNotMatch(js, /initMaskedImageRail/, "cases script should not run scroll-driven rail motion");
assert.doesNotMatch(js, /ScrollTrigger/, "cases script should not depend on ScrollTrigger for the static hero rail");
assert.doesNotMatch(js, /--cases-active-scene/, "cases filter script should not update the hero background");
assert.doesNotMatch(js, /scene-is-fading/, "cases filter script should not animate background scene changes");
assert.doesNotMatch(js, /scene-fade-layer/, "cases script should not create the old fade layer animation");
