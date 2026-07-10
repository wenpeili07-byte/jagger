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
assert.match(html, /<section class="hero-image-rail"/, "PLAN A hero should use a static vertical image rail");
assert.equal((html.match(/class="hero-rail-frame/g) || []).length, 6, "hero image rail should show six case frames");
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
assert.doesNotMatch(html, /scene-fade-layer/, "cases page should not keep old fade-layer cleanup from the removed animation path");
assert.match(html, /\["mouseenter",\s*"focus",\s*"click"\]/, "case background should use one stable hover event plus focus and click");
assert.doesNotMatch(html, /pointerenter/, "case background should not bind both pointerenter and mouseenter");
assert.match(html, /activeScene === scene/, "case background should not restart the fade when the active scene is unchanged");

assert.match(css, /\.cases-hero\s*\{[^}]*min-height:\s*min\(calc\(100vh - 77px\),\s*973px\)/s, "PLAN A hero should preserve a 1728x1050 first-screen visual area without stretching on taller displays");
assert.match(css, /\.cases-gap\s*\{[^}]*height:\s*100px/s, "hero and archive should be separated by 100px");
assert.match(css, /\.archive-layout\s*\{[^}]*grid-template-columns:\s*260px\s+minmax\(0,\s*1fr\)/s, "archive should use a left filter sidebar");
assert.match(css, /\.archive-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s, "archive should use four cards per row on desktop");
assert.match(css, /\.hero-image-rail\s*\{[^}]*overflow:\s*hidden/s, "hero image rail should be a clipped static viewport");
assert.match(css, /\.hero-rail-track\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s, "hero image rail should use a two-column image track on desktop");
assert.match(css, /\.hero-rail-frame\s*\{[^}]*clip-path:\s*inset\(6%\s+0\s+6%\s+0\)/s, "each hero rail image should sit inside a mask frame");
assert.match(css, /\.hero-rail-frame\s+img\s*\{[^}]*object-fit:\s*cover[^}]*will-change:\s*transform/s, "hero rail images should use object-cover and transform-friendly hover states");
assert.match(css, /\.filter-option\.is-active/s, "active filter should have its own state styling");

assert.match(js, /data-filter/, "cases script should handle brand filter controls");
assert.match(js, /data-brand/, "cases script should filter archive cards by brand");
assert.doesNotMatch(js, /buildMaskedImageRail/, "cases script should not generate an archive rail");
assert.doesNotMatch(js, /initCaseScrollMotion/, "cases script should not run GSAP case-card motion after the cards are removed");
assert.doesNotMatch(js, /initMaskedImageRail/, "cases script should not run scroll-driven rail motion");
assert.doesNotMatch(js, /ScrollTrigger/, "cases script should not depend on ScrollTrigger for the static hero rail");
assert.doesNotMatch(js, /--cases-active-scene/, "cases filter script should not update the hero background");
assert.doesNotMatch(js, /scene-is-fading/, "cases filter script should not animate background scene changes");
assert.doesNotMatch(js, /scene-fade-layer/, "cases script should not create the old fade layer animation");
