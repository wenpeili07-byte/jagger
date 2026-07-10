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
assert.equal((html.match(/class="case-feature-card/g) || []).length, 6, "PLAN A hero should show six feature cards");
assert.equal((html.match(/class="archive-card/g) || []).length, 6, "archive should use the current six cases as reference content");
assert.doesNotMatch(html, /<section class="masked-image-rail"/, "masked vertical image rail should be generated from the archive cards instead of duplicated in HTML");
assert.match(html, /36 MODIFIED-CAR CASE FILES/, "archive should be framed as a 36-case library");
assert.match(html, /layout-canvas\.css\?v=canvas-20260706-1728/, "cases page should load the 1728 design canvas layout override");
assert.match(html, /case-rail\.css\?v=masked-rail-20260709/, "cases page should load the masked rail stylesheet separately from the large main stylesheet");
assert.match(html, /\.\.\/assets\/vendor\/motion-core\.js/, "cases page should load the local GSAP motion file without an extension-blocked asset name");
assert.match(html, /\.\.\/assets\/vendor\/scroll-motion\.js/, "cases page should load the local ScrollTrigger motion file without an extension-blocked asset name");
assert.match(html, /<script src="\.\/cases\.js\?v=gsap-scroll-20260706"><\/script>/, "cases page should load its own GSAP-enhanced case script");
assert.match(html, /\.case-feature-card\s*\{[^}]*--scroll-lift:\s*0px[^}]*--scroll-scale:\s*1/s, "case page should expose GSAP-safe transform variables close to the case markup");
assert.match(html, /\.case-feature-card:hover,[\s\S]*?\.case-feature-card\.is-active,[\s\S]*?\.case-feature-card:focus-visible\s*\{[^}]*translateY\(calc\(var\(--scroll-lift\) - 2px\)\)/s, "case card hover should preserve GSAP scroll offset");
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
assert.match(css, /\.archive-showcase\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+clamp\(220px,\s*22vw,\s*340px\)/s, "archive should place the masked image rail on the right side on desktop");
assert.match(css, /\.masked-image-rail\s*\{[^}]*position:\s*sticky[^}]*overflow:\s*hidden/s, "masked image rail should be a clipped sticky viewport on desktop");
assert.match(css, /\.masked-rail-frame\s*\{[^}]*overflow:\s*hidden/s, "each rail image should sit inside a mask frame");
assert.match(css, /\.masked-rail-frame\s+img\s*\{[^}]*object-fit:\s*cover[^}]*will-change:\s*transform/s, "rail images should use object-cover and transform-friendly animation");
assert.match(css, /\.filter-option\.is-active/s, "active filter should have its own state styling");

assert.match(js, /data-filter/, "cases script should handle brand filter controls");
assert.match(js, /data-brand/, "cases script should filter archive cards by brand");
assert.match(js, /function buildMaskedImageRail\(\)/, "cases script should build the masked rail from archive cards");
assert.match(js, /archiveMain\.insertBefore\(showcase,\s*archiveGrid\)/, "generated showcase should keep the archive grid in the main archive column");
assert.match(js, /showcase\.append\(archiveGrid,\s*rail\)/, "archive grid and masked rail should share the generated archive showcase layout");
assert.match(js, /masked-rail-frame/, "generated rail should create masked frames for the case images");
assert.match(js, /function initCaseScrollMotion\(\)/, "cases script should initialize GSAP ScrollTrigger case motion");
assert.match(js, /gsap\.registerPlugin\(ScrollTrigger\)/, "cases script should register ScrollTrigger");
assert.match(js, /--scroll-lift/, "GSAP motion should animate CSS variables instead of replacing hover transforms");
assert.match(js, /function initMaskedImageRail\(\)/, "cases script should initialize the masked vertical image rail");
assert.match(js, /function initNativeMaskedImageRail/, "cases script should keep a native rail fallback when external motion files are blocked");
assert.match(js, /requestAnimationFrame\(updateRail\)/, "native rail fallback should animate with requestAnimationFrame");
assert.match(js, /ScrollTrigger\.matchMedia/, "masked image rail should only run the full effect on desktop breakpoints");
assert.match(js, /yPercent/, "rail images should animate inside their masks using yPercent");
assert.match(js, /clipPath/, "rail mask frames should animate clipping with scroll progress");
assert.match(js, /scrub:\s*0\.85/, "rail scroll motion should scrub smoothly instead of jumping");
assert.doesNotMatch(js, /--cases-active-scene/, "cases filter script should not update the hero background");
assert.doesNotMatch(js, /scene-is-fading/, "cases filter script should not animate background scene changes");
assert.doesNotMatch(js, /scene-fade-layer/, "cases script should not create the old fade layer animation");
