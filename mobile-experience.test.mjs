import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const mobileCssUrl = new URL("./mobile-experience.css", import.meta.url);
const mobileCss = existsSync(mobileCssUrl) ? read("./mobile-experience.css") : "";
const publicPages = [
  "./index.html",
  "./pages/about.html",
  "./pages/services.html",
  "./pages/services/build.html",
  "./pages/services/parts.html",
  "./pages/services/photo.html",
  "./pages/services/ecu.html",
  "./pages/services/chassis.html",
  "./pages/services/exhaust.html",
  "./pages/cases.html",
  "./pages/cases/case-01.html",
  "./pages/cases/case-02.html",
  "./pages/cases/case-03.html",
  "./pages/cases/case-04.html",
  "./pages/cases/case-05.html",
  "./pages/cases/case-06.html",
  "./pages/contact.html",
  "./pages/project.html",
  "./pages/shop.html",
  "./pages/shop/forged-wheel.html",
];

function mediaBlock(source, marker) {
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${marker} should exist`);

  const openBrace = source.indexOf("{", start + marker.length);
  assert.notEqual(openBrace, -1, `${marker} should open`);

  let depth = 0;
  for (let index = openBrace; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(openBrace + 1, index);
  }

  assert.fail(`${marker} should close`);
}

test("all public routes load the Option 3 mobile stylesheet last", () => {
  assert.ok(existsSync(mobileCssUrl), "mobile-experience.css should exist");

  for (const path of publicPages) {
    const html = read(path);
    const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)" \/>/g)]
      .map((match) => match[1]);
    const expectedPrefix = path === "./index.html"
      ? "./mobile-experience.css"
      : path.includes("/cases/") || path.includes("/services/") || path.includes("/shop/")
        ? "../../mobile-experience.css"
        : "../mobile-experience.css";

    assert.equal(
      links.at(-1),
      `${expectedPrefix}?v=mobile-option3-20260728`,
      `${path} should load the shared mobile stylesheet after page styles`,
    );
  }

  for (const generator of ["./scripts/render-detail-pages.mjs", "./scripts/render-shop-page.mjs"]) {
    assert.match(
      read(generator),
      /mobile-experience\.css\?v=mobile-option3-20260728/,
      `${generator} should preserve the mobile stylesheet when regenerating pages`,
    );
  }
});

test("shared mobile shell matches the selected five-action navigation", () => {
  const mobile = mediaBlock(mobileCss, "@media (max-width: 767px)");

  assert.match(
    mobile,
    /\.topbar\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto[^}]*min-height:\s*56px[^}]*padding:\s*0 20px/s,
    "mobile topbar should contain a compact brand/language row",
  );
  assert.match(
    mobile,
    /\.nav a\[href\$="about\.html"\]\s*\{[^}]*display:\s*none/s,
    "About should remain reachable through the brand but leave the five-action bottom navigation",
  );
  assert.match(
    mobile,
    /\.nav\s*\{[^}]*position:\s*fixed[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)[^}]*padding-bottom:\s*env\(safe-area-inset-bottom\)/s,
    "mobile navigation should stay fixed and safe-area aware",
  );
  assert.match(
    mobile,
    /\.nav a\s*\{[^}]*min-height:\s*76px[^}]*font-size:\s*10px/s,
    "each bottom navigation destination should have a stable touch target",
  );
  assert.match(
    mobile,
    /\.project-entry\s*\{[^}]*position:\s*fixed[^}]*bottom:\s*env\(safe-area-inset-bottom\)[^}]*left:\s*40%[^}]*width:\s*20%[^}]*min-height:\s*76px/s,
    "Build should occupy the center navigation position instead of the topbar",
  );
  assert.match(
    mobile,
    /\.nav a\[href\$="services\.html"\]\s*\{[^}]*grid-column:\s*1/s,
    "Services should be first",
  );
  assert.match(
    mobile,
    /\.nav a\[href\$="cases\.html"\]\s*\{[^}]*grid-column:\s*2/s,
    "Cases should be second",
  );
  assert.match(
    mobile,
    /\.nav a\[href\$="shop\.html"\]\s*\{[^}]*grid-column:\s*4/s,
    "Shop should be fourth",
  );
  assert.match(
    mobile,
    /\.nav a\[href\$="contact\.html"\]\s*\{[^}]*grid-column:\s*5/s,
    "Contact should be fifth",
  );
  assert.match(
    mobile,
    /\.site-shell\s*\{[^}]*padding-bottom:\s*calc\(76px \+ env\(safe-area-inset-bottom\)\)/s,
    "page content should clear the fixed navigation",
  );
  assert.match(
    mobile,
    /body\[data-section="project"\] \.project-entry\s*\{[^}]*color:\s*#fff[^}]*box-shadow:\s*inset 0 2px 0 var\(--accent-bright\)/s,
    "Build should expose an active project state",
  );
  assert.doesNotMatch(mobileCss, /width:\s*100vw|transform:\s*scale\(/);
  assert.doesNotMatch(mobileCss, /linear-gradient|radial-gradient/);
});

test("shared bottom navigation uses local official icon assets", () => {
  const icons = ["wrench", "folder", "hexagon", "shopping-cart", "user-round"];

  for (const icon of icons) {
    assert.ok(
      existsSync(new URL(`./assets/icons/mobile/${icon}.svg`, import.meta.url)),
      `${icon}.svg should exist`,
    );
    assert.match(
      mobileCss,
      new RegExp(`url\\("\\./assets/icons/mobile/${icon}\\.svg"\\)`),
      `${icon}.svg should be referenced by the mobile shell`,
    );
  }
});

test("home uses a compact image-led first screen and removes duplicate case controls", () => {
  const mobile = mediaBlock(mobileCss, "@media (max-width: 767px)");

  assert.match(
    mobile,
    /\.cover\s*\{[^}]*display:\s*block[^}]*min-height:\s*0[^}]*padding:\s*0/s,
    "home should leave the desktop split and use the full mobile width",
  );
  assert.match(
    mobile,
    /\.left-panel\s*\{[^}]*min-height:\s*calc\(100svh - 56px\)[^}]*padding:\s*clamp\(34px,\s*8vh,\s*70px\) 20px 28px/s,
    "home should keep one intentional first screen",
  );
  assert.match(
    mobile,
    /\.left-panel h1\s*\{[^}]*font-size:\s*clamp\(52px,\s*16vw,\s*72px\)/s,
    "home brand should be prominent without overflowing",
  );
  assert.match(
    mobile,
    /\.roll-table\s*\{[^}]*display:\s*none/s,
    "the duplicate compact case list should be removed from the first screen",
  );
  assert.match(
    mobile,
    /\.hero-actions\s*\{[^}]*grid-template-columns:\s*1fr[^}]*gap:\s*10px/s,
    "home actions should stack into full-width touch targets",
  );
});

test("services becomes a readable text and thumbnail rail", () => {
  const mobile = mediaBlock(mobileCss, "@media (max-width: 767px)");
  const servicesHtml = read("./pages/services.html");

  assert.match(
    servicesHtml,
    /<figure class="services-mobile-hero"[\s\S]*?<img src="\.\.\/assets\/images\/网页\/optimized\/case-01\.jpg"/,
    "services should provide the selected mobile photographic opening",
  );
  assert.match(
    mobile,
    /\.services-mobile-hero\s*\{[^}]*display:\s*block[^}]*aspect-ratio:\s*16 \/ 9/s,
    "the photographic opening should use a stable mobile mask",
  );
  assert.match(
    mobile,
    /\.services-intro\s*\{[^}]*padding:\s*36px 20px 28px/s,
    "services intro should use the shared mobile gutter",
  );
  assert.match(
    mobile,
    /\.services-intro h1\s*\{[^}]*font-size:\s*clamp\(42px,\s*13vw,\s*56px\)/s,
    "services title should remain expressive but controlled",
  );
  assert.match(
    mobile,
    /\.service-process-row\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*62%\)\s+minmax\(0,\s*38%\)[^}]*min-height:\s*156px[^}]*aspect-ratio:\s*auto/s,
    "service rows should use stable copy and image columns",
  );
  assert.match(
    mobile,
    /\.service-process-copy\s*\{[^}]*padding:\s*42px 34px 22px 64px[^}]*background:\s*#111315/s,
    "service copy should not sit on top of the image",
  );
  assert.match(
    mobile,
    /\.service-process-media\s*\{[^}]*position:\s*relative[^}]*grid-column:\s*2[^}]*inset:\s*auto/s,
    "service images should remain in their own column",
  );
  assert.match(
    mobile,
    /\.service-process-copy p\s*\{[^}]*font-size:\s*16px/s,
    "service descriptions should be readable on mobile",
  );
});

test("cases uses a horizontal featured rail, make filters, and a two-column archive", () => {
  const mobile = mediaBlock(mobileCss, "@media (max-width: 767px)");

  assert.match(
    mobile,
    /\.cases-hero\s*\{[^}]*display:\s*block[^}]*min-height:\s*0[^}]*padding:\s*34px 20px 24px/s,
    "cases should release the oversized desktop hero",
  );
  assert.match(
    mobile,
    /\.mwg_effect060 \.slides\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto[^}]*transform:\s*none !important/s,
    "featured cases should become a touch-scroll rail",
  );
  assert.match(
    mobile,
    /\.mwg_effect060 \.slide\.spacer\s*\{[^}]*display:\s*none/s,
    "desktop rail spacers should not consume mobile space",
  );
  assert.match(
    mobile,
    /\.filter-block\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto/s,
    "make filters should become a compact horizontal control",
  );
  assert.match(
    mobile,
    /\.archive-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)[^}]*gap:\s*24px 12px/s,
    "archive should use two readable columns",
  );
  assert.match(
    mobile,
    /\.archive-card img\s*\{[^}]*position:\s*relative[^}]*aspect-ratio:\s*4 \/ 3/s,
    "project labels should sit outside stable image masks",
  );
});

test("about uses compact process rows and a photo-led field note", () => {
  const mobile = mediaBlock(mobileCss, "@media (max-width: 767px)");

  assert.match(
    mobile,
    /\.about-hero\s*\{[^}]*min-height:\s*520px/s,
    "About should keep a controlled photographic opening",
  );
  assert.match(
    mobile,
    /\.process-step\s*\{[^}]*grid-template-columns:\s*52px 94px minmax\(0,\s*1fr\)[^}]*min-height:\s*112px[^}]*padding:\s*18px 20px/s,
    "About process stages should read as one continuous rail",
  );
  assert.match(
    mobile,
    /\.process-step p\s*\{[^}]*font-size:\s*16px/s,
    "About process descriptions should be readable",
  );
  assert.match(
    mobile,
    /\.content-photo-band\s*\{[^}]*min-height:\s*0[^}]*background:\s*#111315/s,
    "About field note should use natural content height",
  );
});
