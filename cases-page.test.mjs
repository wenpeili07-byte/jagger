import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./pages/cases.html", import.meta.url), "utf8");
const css = [
  readFileSync(new URL("./styles.css", import.meta.url), "utf8"),
  readFileSync(new URL("./layout-canvas.css", import.meta.url), "utf8")
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
assert.match(html, /36 MODIFIED-CAR CASE FILES/, "archive should be framed as a 36-case library");
assert.match(html, /layout-canvas\.css\?v=canvas-20260706/, "cases page should load the 1440 design canvas layout override");
assert.match(html, /\.\.\/assets\/vendor\/gsap\.min\.js/, "cases page should load the local GSAP file for the case card scroll motion");
assert.match(html, /\.\.\/assets\/vendor\/ScrollTrigger\.min\.js/, "cases page should load the local ScrollTrigger file for scroll-driven case motion");
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

assert.match(css, /\.cases-hero\s*\{[^}]*min-height:\s*min\(calc\(100vh - 77px\),\s*823px\)/s, "PLAN A hero should preserve a 1440x900 first-screen visual area without stretching on taller displays");
assert.match(css, /\.cases-gap\s*\{[^}]*height:\s*100px/s, "hero and archive should be separated by 100px");
assert.match(css, /\.archive-layout\s*\{[^}]*grid-template-columns:\s*260px\s+minmax\(0,\s*1fr\)/s, "archive should use a left filter sidebar");
assert.match(css, /\.archive-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s, "archive should use four cards per row on desktop");
assert.match(css, /\.filter-option\.is-active/s, "active filter should have its own state styling");

assert.match(js, /data-filter/, "cases script should handle brand filter controls");
assert.match(js, /data-brand/, "cases script should filter archive cards by brand");
assert.match(js, /function initCaseScrollMotion\(\)/, "cases script should initialize GSAP ScrollTrigger case motion");
assert.match(js, /gsap\.registerPlugin\(ScrollTrigger\)/, "cases script should register ScrollTrigger");
assert.match(js, /--scroll-lift/, "GSAP motion should animate CSS variables instead of replacing hover transforms");
assert.doesNotMatch(js, /--cases-active-scene/, "cases filter script should not update the hero background");
assert.doesNotMatch(js, /scene-is-fading/, "cases filter script should not animate background scene changes");
assert.doesNotMatch(js, /scene-fade-layer/, "cases script should not create the old fade layer animation");
