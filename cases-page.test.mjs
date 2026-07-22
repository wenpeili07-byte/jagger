import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

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
assert.match(html, /data-filter="benz"[\s\S]*MERCEDES-BENZ/, "filter sidebar should include Mercedes-Benz");
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
assert.match(html, /36 PERFORMANCE PROJECTS/, "archive should be framed as 36 performance projects");
assert.match(html, /styles\.css\?v=global-shell-20260721/, "cases page should load the current shared stylesheet cache key");
assert.match(html, /layout-canvas\.css\?v=canvas-20260721-2200/, "cases page should load the current shared 2200px design canvas");
assert.match(html, /case-rail\.css\?v=hero-rail-20260721-labels-up-2/, "cases page should load the latest raised-label rail stylesheet separately from the large main stylesheet");
assert.doesNotMatch(html, /assets\/vendor\/motion-core\.js/, "static hero rail should not load GSAP vendor files");
assert.doesNotMatch(html, /assets\/vendor\/scroll-motion\.js/, "static hero rail should not load ScrollTrigger vendor files");
assert.match(html, /<script src="\.\/cases\.js\?v=hero-rail-20260709"><\/script>/, "cases page should keep its archive filter script");
assert.match(html, /<body data-section="cases">/, "cases page should expose its navigation section to the shared language controller");
assert.match(html, /<script src="\.\.\/content-pages\.js\?v=cases-language-20260719"><\/script>/, "cases page should load the shared language controller");
assert.match(html, /data-lang-option="zh"/, "cases page should identify the Chinese language option");
assert.match(html, /data-lang-option="en"/, "cases page should identify the English language option");
assert.match(
  html,
  /data-zh="改装案例总览 · 龙马态度"\s+data-en="PROJECT ARCHIVE · LONMA ATTITUDE"/,
  "cases hero should provide both localized headings"
);
assert.equal(
  (html.match(/class="slide[^"]*"[^>]*data-scene=[^>]*>[\s\S]*?<span class="slide-label" data-zh=/g) || []).length,
  6,
  "all six rail labels should be bilingual"
);
assert.equal(
  (html.match(/<h3 data-zh="[^"]+" data-en="[^"]+">/g) || []).length,
  7,
  "the vehicle filter and all six archive titles should be bilingual"
);
assert.equal(
  (html.match(/<b data-zh="查看案例 →" data-en="VIEW CASE →">/g) || []).length,
  6,
  "all six archive actions should be bilingual"
);
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

assert.match(css, /\.cover,\s*\.cases-hero\s*\{[^}]*min-height:\s*min\(calc\(100vh - var\(--site-header-height\)\),\s*var\(--site-first-screen-max\)\)/s, "PLAN A hero should use the shared 1900x1050 first-screen variables without stretching on taller displays");
assert.match(css, /\.cases-page\s*\{[^}]*background:\s*transparent/s, "case page shell should stay transparent so the fixed background scene is visible");
assert.match(css, /\.cases-page::before\s*\{[^}]*background-image:\s*var\(--cases-active-scene\)[^}]*background-position:\s*center center[^}]*background-size:\s*cover/s, "case page background should use one centered full-bleed scene image");
assert.doesNotMatch(css, /\.cases-page::before\s*\{[^}]*background-image:\s*var\(--cases-active-scene\),/s, "case page background should not duplicate the same image in multiple layers");
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
assert.equal((html.match(/class="slide-mask"/g) || []).length, 6, "each case image should have its own mask layer");
assert.equal((html.match(/class="slide-label"[^>]*data-zh=/g) || []).length, 6, "each case label should sit outside the image mask");
assert.doesNotMatch(css, /\.mwg_effect060\s+\.slide\s*\{[^}]*clip-path:/s, "the slide button should not clip its text label");
assert.match(css, /\.mwg_effect060\s+\.slide-mask\s*\{[^}]*clip-path:\s*inset\(12%\s+0\s+12%\s+0\)/s, "only the case image layer should use the effect 060 mask");
assert.match(css, /\.mwg_effect060\s+\.slide-label\s*\{[^}]*z-index:\s*2/s, "case labels should remain above the masked image at compact sizes");
assert.match(css, /\.mwg_effect060\s+\.slide-label\s*\{[^}]*bottom:\s*22px/s, "case labels should sit clearly above the lower module edge");
assert.match(css, /\.mwg_effect060\s+\.slide:hover\s+\.slide-mask,[\s\S]*?clip-path:\s*inset\(0\s+0\s+0\s+0\)/s, "hover should still open the image mask without clipping the label");
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

test("selected make survives a shared language switch", () => {
  class FakeElement {
    constructor({ dataset = {} } = {}) {
      this.dataset = dataset;
      this.hidden = false;
      this.listeners = new Map();
      this.textContent = "";
      this.attributes = new Map();
      this.classList = { toggle: () => {} };
    }

    addEventListener(name, listener) {
      this.listeners.set(name, listener);
    }

    dispatch(name) {
      this.listeners.get(name)?.();
    }

    setAttribute(name, value) {
      this.attributes.set(name, value);
    }

    getAttribute(name) {
      return this.attributes.get(name) ?? null;
    }

    removeAttribute(name) {
      this.attributes.delete(name);
    }
  }

  const filters = ["all", "bmw", "audi", "benz"].map((filter) => new FakeElement({ dataset: { filter } }));
  const activeFilterLabel = new FakeElement({ dataset: { zh: "全部品牌", en: "ALL MAKES" } });
  const langToggle = new FakeElement();
  const nodesBySelector = new Map([
    ["[data-filter]", filters],
    ["[data-brand]", filters.slice(1).map((button) => new FakeElement({ dataset: { brand: button.dataset.filter } }))],
    ["[data-active-filter]", [activeFilterLabel]],
    [".mwg_effect060 .slides", []],
    [".lang-toggle", [langToggle]],
    ["[data-lang-option]", []],
    ["[data-zh][data-en]", [activeFilterLabel]],
    ["[data-zh-placeholder][data-en-placeholder]", []],
    ["[data-zh-aria-label][data-en-aria-label]", []],
    ["[data-zh-alt][data-en-alt]", []],
    [".nav a", []],
    ["[data-contact-form]", []],
    ["[data-contact-status]", []],
    ["[data-service-row]", []],
  ]);
  const document = {
    body: { dataset: { section: "cases" } },
    documentElement: { lang: "en" },
    querySelector: (selector) => nodesBySelector.get(selector)?.[0] ?? null,
    querySelectorAll: (selector) => nodesBySelector.get(selector) ?? [],
  };
  const sessionStorage = new Map();
  const context = {
    document,
    sessionStorage: {
      getItem: (key) => sessionStorage.get(key) ?? null,
      setItem: (key, value) => sessionStorage.set(key, value),
    },
    window: {
      location: { pathname: "/pages/cases.html" },
      matchMedia: () => ({ matches: false }),
    },
  };

  vm.runInNewContext(js, context);
  vm.runInNewContext(readFileSync(new URL("./content-pages.js", import.meta.url), "utf8"), context);

  for (const [filter, label] of [["bmw", "BMW"], ["audi", "AUDI"], ["benz", "MERCEDES-BENZ"]]) {
    filters.find((button) => button.dataset.filter === filter).dispatch("click");

    assert.equal(activeFilterLabel.textContent, label);
    assert.equal(activeFilterLabel.dataset.en, label);
    assert.equal(activeFilterLabel.dataset.zh, label);

    langToggle.dispatch("click");
    assert.equal(activeFilterLabel.textContent, label);
    langToggle.dispatch("click");
  }
});
