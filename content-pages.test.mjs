import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

const aboutHtml = readFileSync(new URL("./pages/about.html", import.meta.url), "utf8");
const servicesHtml = readFileSync(new URL("./pages/services.html", import.meta.url), "utf8");
const contactHtml = readFileSync(new URL("./pages/contact.html", import.meta.url), "utf8");
const homepageHtml = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const casesHtml = readFileSync(new URL("./pages/cases.html", import.meta.url), "utf8");
const cssUrl = new URL("./content-pages.css", import.meta.url);
const jsUrl = new URL("./content-pages.js", import.meta.url);

assert.ok(existsSync(cssUrl), "content pages should have an isolated stylesheet");
assert.ok(existsSync(jsUrl), "content pages should have shared language and contact interactions");

const css = readFileSync(cssUrl, "utf8");
const js = readFileSync(jsUrl, "utf8");
const pages = [
  ["about", aboutHtml],
  ["services", servicesHtml],
  ["contact", contactHtml],
];

function findCssBlock(source, header) {
  const start = source.indexOf(header);
  assert.notEqual(start, -1, `${header} should exist`);

  const openBrace = source.indexOf("{", start + header.length);
  assert.notEqual(openBrace, -1, `${header} should open a CSS block`);

  let depth = 0;
  for (let index = openBrace; index < source.length; index += 1) {
    if (source[index] === "{") {
      depth += 1;
    } else if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        return {
          body: source.slice(openBrace + 1, index),
          end: index + 1,
          start,
        };
      }
    }
  }

  assert.fail(`${header} should close its CSS block`);
}

function relativeLuminance(hexColor) {
  const channels = hexColor
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));

  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}

function contrastRatio(firstColor, secondColor) {
  const firstLuminance = relativeLuminance(firstColor);
  const secondLuminance = relativeLuminance(secondColor);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

for (const [name, html] of pages) {
  assert.match(html, /class="site-shell content-page/, `${name} should use the content-page shell`);
  assert.match(html, /href="\.\.\/content-pages\.css\?v=contact-form-20260723"/, `${name} should load the current isolated content page stylesheet`);
  assert.match(html, /src="\.\.\/content-pages\.js\?v=/, `${name} should load shared page interactions`);
  assert.match(html, /<header class="topbar">/, `${name} should keep the shared site header`);
  assert.match(html, /<button class="lang-toggle" type="button" aria-label="切换到中文">/, `${name} should keep the language control`);
  assert.match(html, /<footer class="content-footer">/, `${name} should include the shared content footer`);
}

assert.match(aboutHtml, /class="content-hero about-hero"/, "about should use the selected cinematic hero");
assert.match(aboutHtml, /BUILT THROUGH ITERATION\./, "about should use the approved process-led headline");
assert.match(aboutHtml, /在修改与测试中成形/, "about should include the selected Chinese headline");
assert.equal((aboutHtml.match(/class="process-step"/g) || []).length, 4, "about should show four process stages");
assert.match(aboutHtml, /OBSERVE[\s\S]*MODIFY[\s\S]*TEST[\s\S]*REFINE/, "about process should follow the selected stage order");
assert.match(aboutHtml, /PEOPLE \/ MACHINES/, "about should reveal the next photographic section");

const serviceLinks = [
  "./services/build.html",
  "./services/parts.html",
  "./services/photo.html",
  "./services/ecu.html",
  "./services/chassis.html",
  "./services/exhaust.html",
];
assert.match(servicesHtml, /class="services-workspace"/, "services should use the selected workshop workspace");
assert.match(servicesHtml, /class="services-intro"/, "services should keep a dedicated editorial introduction");
assert.match(servicesHtml, /class="service-process-rail"/, "services should present one continuous process rail");
assert.doesNotMatch(servicesHtml, /class="content-hero services-hero"/, "services should remove the old standalone hero");
assert.doesNotMatch(servicesHtml, /class="service-index"/, "services should remove the old flat service index");
assert.equal((servicesHtml.match(/data-service-row/g) || []).length, 6, "services should contain six interactive process rows");
assert.equal((servicesHtml.match(/data-active/g) || []).length, 1, "services should keep exactly one default active row");
assert.match(servicesHtml, /href="\.\/services\/ecu\.html" data-service-row data-active/, "service row 04 should remain active by default");
assert.equal((servicesHtml.match(/class="service-process-media"/g) || []).length, 6, "each service row should keep its permanent right-side sample image");
assert.equal((servicesHtml.match(/class="service-process-preview"/g) || []).length, 6, "each service row should include a separate square hover preview");
for (const href of serviceLinks) {
  assert.match(servicesHtml, new RegExp(`href="${href.replaceAll(".", "\\.")}"`), `services should link to ${href}`);
}
assert.match(servicesHtml, /01[\s\S]*BUILD[\s\S]*02[\s\S]*PARTS[\s\S]*03[\s\S]*PHOTO[\s\S]*04[\s\S]*ECU[\s\S]*05[\s\S]*CHASSIS[\s\S]*06[\s\S]*EXHAUST/, "services should keep the established service order");

for (const caseNumber of ["01", "02", "03", "04", "05", "06"]) {
  const imagePath = `./assets/images/网页/optimized/case-${caseNumber}.jpg`;
  assert.ok(existsSync(new URL(imagePath, import.meta.url)), `${imagePath} should exist`);
  assert.equal((servicesHtml.match(new RegExp(`optimized/case-${caseNumber}\\.jpg`, "g")) || []).length, 2, `services should use case-${caseNumber}.jpg for both its sample and square preview`);
}

assert.match(contactHtml, /<form class="contact-form" action="\/api\/contact" method="post" data-contact-form>/, "contact should include a focused project inquiry form");
for (const name of ["name", "email", "vehicle", "service", "message"]) {
  assert.match(contactHtml, new RegExp(`name="${name}"`), `contact should collect ${name}`);
}
assert.match(contactHtml, /type="email"[^>]*required/, "contact email should be required");
assert.match(contactHtml, /data-contact-status/, "contact should expose a status message for form feedback");
assert.match(contactHtml, /name="name"[\s\S]*?minlength="2"[\s\S]*?maxlength="100"/, "contact name should match API validation limits");
assert.match(contactHtml, /name="email"[\s\S]*?minlength="3"[\s\S]*?maxlength="254"/, "contact email should match API validation limits");
assert.match(contactHtml, /name="vehicle"[\s\S]*?minlength="2"[\s\S]*?maxlength="120"/, "contact vehicle should match API validation limits");
assert.match(contactHtml, /name="message"[\s\S]*?minlength="10"[\s\S]*?maxlength="3000"/, "contact message should match API validation limits");

test("public contact links use the active Gmail inbox", () => {
  for (const html of [homepageHtml, casesHtml, contactHtml]) {
    assert.match(html, /href="mailto:lonmadynamic@gmail\.com"/);
    assert.doesNotMatch(html, /hello@lonmadynamic\.com/);
  }
});

const contentPageShellBlock = css.match(/\.content-page\.site-shell\s*\{[^}]*\}/s)?.[0] || "";
assert.match(contentPageShellBlock, /\.content-page\.site-shell\s*\{/, "content pages should keep a scoped visual block");
assert.doesNotMatch(
  contentPageShellBlock,
  /(?:^|\n)\s*(?:width|max-width|margin(?:-[a-z-]+)?):/m,
  "content pages should defer width and centering to layout-canvas.css"
);
assert.match(css, /\.content-hero-media img\s*\{[^}]*object-fit:\s*cover/s, "content hero imagery should crop without distortion");
assert.match(css, /\.content-hero-copy\s*\{[^}]*justify-content:\s*center/s, "about hero copy should keep the selected vertically centered composition");
assert.match(css, /\.content-display\s*\{[^}]*font-family:\s*Impact/s, "display headings should use a tall condensed automotive face");
assert.match(css, /\.content-process::before\s*\{[^}]*width:\s*25%[^}]*background:\s*var\(--accent-bright\)/s, "about process should keep the selected blue progress line");
assert.match(css, /@media \(max-width:\s*760px\)/, "content pages should include a mobile layout");
assert.match(css, /\.process-step\s*\{[^}]*min-height:/s, "process stages should reserve stable equal heights");
assert.doesNotMatch(css, /\.process-step\s*\{[^}]*border-radius:/s, "process stages should not become rounded cards");
assert.match(css, /\.services-workspace\s*\{[^}]*grid-template-columns:/s, "services should use the selected split workspace");
assert.match(css, /\.services-workspace\s*\{[^}]*\n\s*height:\s*calc\(min\(1050px,\s*100vh\)\s*-\s*var\(--site-header-height\)\)/s, "desktop services workspace should occupy one shared viewport-bound canvas");
assert.match(css, /\.services-workspace\s*\{[^}]*min-height:\s*[5-9]\d{2}px/s, "desktop services workspace should retain a practical minimum height");
assert.match(css, /\.service-process-rail\s*\{[^}]*grid-template-rows:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/s, "desktop rail should reserve six equal rows without intrinsic minimums");
assert.match(css, /\.service-process-rail\s*\{[^}]*min-height:\s*0/s, "service rail should contain intrinsic child height");
assert.match(css, /\.service-process-row\s*\{[^}]*grid-template-columns:\s*minmax\(330px,\s*42%\)\s*minmax\(0,\s*58%\)[^}]*min-height:\s*0[^}]*overflow:\s*visible/s, "desktop rows should retain their sample-image column while allowing previews to float");
assert.match(css, /\.service-process-media\s*\{[^}]*position:\s*relative[^}]*grid-column:\s*2[^}]*overflow:\s*hidden/s, "the permanent sample should remain in the right grid column");
assert.match(css, /\.service-process-media img\s*\{[^}]*width:\s*100%[^}]*height:\s*100%[^}]*object-fit:\s*cover/s, "permanent sample imagery should crop without distortion");
assert.match(css, /\.service-process-preview\s*\{[^}]*position:\s*absolute[^}]*right:\s*clamp\(18px,\s*1\.8vw,\s*34px\)[^}]*width:\s*58%[^}]*aspect-ratio:\s*1\s*\/\s*1[^}]*opacity:\s*0[^}]*pointer-events:\s*none/s, "desktop square previews should match the permanent sample column width and sit close to the right canvas edge");
assert.match(css, /\.service-process-preview img\s*\{[^}]*width:\s*100%[^}]*height:\s*100%[^}]*object-fit:\s*cover/s, "square preview imagery should crop without distortion");
assert.match(css, /\.service-process-row:first-child \.service-process-preview\s*\{[^}]*top:\s*34px/s, "the first preview should clear the sticky header");
assert.match(css, /\.service-process-row:nth-child\(2\) \.service-process-preview\s*\{[^}]*top:\s*-80px/s, "the second enlarged preview should remain inside the canvas");
assert.match(css, /\.service-process-row:nth-child\(3\) \.service-process-preview\s*\{[^}]*top:\s*-240px/s, "the third enlarged preview should remain inside the canvas");
assert.match(css, /\.service-process-row:nth-child\(4\) \.service-process-preview\s*\{[^}]*top:\s*auto[^}]*bottom:\s*-220px/s, "the fourth enlarged preview should remain inside the canvas");
assert.match(css, /\.service-process-row:nth-child\(5\) \.service-process-preview\s*\{[^}]*top:\s*auto[^}]*bottom:\s*-24px/s, "the fifth preview should lift into the visible canvas");
assert.match(css, /\.service-process-row:last-child \.service-process-preview\s*\{[^}]*top:\s*auto[^}]*bottom:\s*34px/s, "the final preview should remain inside the visible canvas");
assert.match(css, /\.service-process-arrow\s*\{[^}]*z-index:\s*9/s, "the arrow should remain visible above the square preview");
assert.doesNotMatch(css, /\.service-process-row\[data-active\] \.service-process-preview/, "the last active service must not keep its square preview permanently visible");
assert.match(css, /\.service-process-row::before\s*\{[^}]*background:\s*var\(--accent-bright\)/s, "service rows should reserve blue for the left edge");
assert.match(css, /\.service-process-row\[data-active\]\s+\.service-process-number,[\s\S]{0,700}color:\s*var\(--accent-bright\)/s, "service active states should keep blue numbers, labels, and arrows");
assert.match(css, /\.service-process-row:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent-bright\)/s, "service rows should keep visible keyboard focus");
assert.match(css, /\.service-process-row:focus-visible \.service-process-preview\s*\{[^}]*opacity:\s*1[^}]*transform:\s*translate3d\(0,\s*-12px,\s*0\)\s*rotate\(-5deg\)/s, "keyboard focus should reveal the matching square preview");

test("services uses a page-scoped accent that meets AA on both neutral surfaces", () => {
  const scopedAccent = css.match(/\.services-page\s*\{[^}]*--accent-bright:\s*(#[\da-f]{6})\s*;/i);
  assert.ok(scopedAccent, "services should override --accent-bright only within .services-page");

  for (const surface of ["#111315", "#171a1d"]) {
    const ratio = contrastRatio(scopedAccent[1], surface);
    assert.ok(ratio >= 4.5, `${scopedAccent[1]} should reach 4.5:1 on ${surface}; received ${ratio.toFixed(2)}:1`);
  }
});

test("services stacks through 767px and starts its tablet layout at 768px", () => {
  const compactDesktop = findCssBlock(css, "@media (max-width: 1180px)");
  const tabletServices = findCssBlock(css, "@media (min-width: 768px) and (max-width: 980px)");
  const mobileServices = findCssBlock(css, "@media (max-width: 767px)");
  const sharedMobile = findCssBlock(css, "@media (max-width: 760px)");

  assert.match(compactDesktop.body, /\.service-process-preview\s*\{[^}]*width:\s*52%/s, "compact desktop previews should match the 52 percent sample column");
  assert.match(tabletServices.body, /\.services-workspace\s*\{[^}]*height:\s*auto[^}]*min-height:\s*0/s, "tablet services workspace should use natural document height");
  assert.match(tabletServices.body, /\.service-process-rail\s*\{[^}]*grid-template-rows:\s*repeat\(6,\s*auto\)/s, "tablet service rows should grow with their copy");
  assert.match(tabletServices.body, /\.service-process-preview\s*\{[^}]*width:\s*44%/s, "tablet previews should match the 44 percent sample column");
  assert.match(mobileServices.body, /\.services-workspace\s*\{[^}]*grid-template-columns:\s*1fr[^}]*height:\s*auto[^}]*min-height:\s*0/s, "services should stack through 767px");
  assert.match(mobileServices.body, /\.service-process-row\s*\{[^}]*grid-template-rows:\s*auto[^}]*width:\s*100%[^}]*min-height:\s*0[^}]*aspect-ratio:\s*1\s*\/\s*1[^}]*overflow:\s*hidden/s, "mobile service rows should become stable square image modules");
  assert.match(mobileServices.body, /\.service-process-media\s*\{[^}]*position:\s*absolute[^}]*z-index:\s*1[^}]*grid-column:\s*1[^}]*inset:\s*0[^}]*width:\s*100%[^}]*height:\s*100%/s, "mobile should keep each permanent sample below its readable copy");
  assert.match(mobileServices.body, /\.service-process-preview\s*\{[^}]*display:\s*none/s, "mobile should hide the redundant desktop-only square preview");
  assert.match(mobileServices.body, /\.service-process-row:hover \.service-process-media,\s*\.service-process-row:focus-visible \.service-process-media\s*\{[^}]*opacity:\s*1/s, "mobile should never hide the only visible service image");
  assert.match(sharedMobile.body, /\.content-page \.topbar\s*\{[^}]*position:\s*relative/s, "the shared About and Contact mobile breakpoint should remain at 760px");
  assert.doesNotMatch(sharedMobile.body, /\.(?:services-|service-process-)/, "Services responsive rules should not remain in the shared 760px block");
});

test("contact uses the approved compact mobile first screen", () => {
  const mobileContent = findCssBlock(css, "@media (max-width: 760px)");

  assert.match(
    mobileContent.body,
    /\.contact-hero\s*\{[^}]*min-height:\s*470px/s,
    "mobile Contact should use the shorter approved hero"
  );
  assert.match(
    mobileContent.body,
    /\.contact-hero \.content-hero-media img\s*\{[^}]*position:\s*absolute[^}]*top:\s*-22%[^}]*height:\s*136%/s,
    "mobile Contact should crop the source image letterboxing outside the hero"
  );
  assert.match(
    mobileContent.body,
    /\.contact-inquiry\s*\{[^}]*display:\s*block[^}]*padding:\s*38px 22px 96px/s,
    "mobile Contact should reveal the inquiry content earlier"
  );
  assert.match(
    mobileContent.body,
    /\.contact-intro\s*\{[^}]*position:\s*absolute[^}]*width:\s*1px[^}]*height:\s*1px[^}]*overflow:\s*hidden[^}]*clip:\s*rect\(0,\s*0,\s*0,\s*0\)/s,
    "mobile Contact should keep the inquiry heading accessible without delaying the form"
  );
});

test("about and services use the approved compact mobile spacing", () => {
  const mobileServices = findCssBlock(css, "@media (max-width: 767px)");
  const mobileContent = findCssBlock(css, "@media (max-width: 760px)");

  assert.match(
    mobileContent.body,
    /\.about-hero\s*\{[^}]*min-height:\s*540px/s,
    "mobile About should bring the process section into view sooner"
  );
  assert.match(
    mobileServices.body,
    /\.services-intro\s*\{[^}]*min-height:\s*0[^}]*padding:\s*40px 24px 24px/s,
    "mobile Services should remove the oversized editorial intro gap"
  );
  assert.match(
    mobileServices.body,
    /\.services-intro-signature\s*\{[^}]*margin-top:\s*24px[^}]*padding-top:\s*20px/s,
    "mobile Services should keep a compact signature transition"
  );
});

test("services gates hover visuals to fine pointers while active and focus states remain global", () => {
  const finePointerHover = findCssBlock(css, "@media (hover: hover) and (pointer: fine)");
  const reducedMotion = findCssBlock(css, "@media (prefers-reduced-motion: reduce)");
  const globalCss = `${css.slice(0, finePointerHover.start)}${css.slice(finePointerHover.end, reducedMotion.start)}${css.slice(reducedMotion.end)}`;

  assert.doesNotMatch(css.slice(0, finePointerHover.start), /\.service-process-row:hover/, "Services visual hover selectors should begin inside the fine-pointer media block");
  assert.match(finePointerHover.body, /\.service-process-row:hover\s*\{[^}]*background:\s*#171a1d/s, "real hover should keep the neutral active surface");
  assert.match(finePointerHover.body, /\.service-process-row:hover::before\s*\{[^}]*transform:\s*scaleY\(1\)/s, "real hover should reveal the blue edge");
  assert.match(finePointerHover.body, /\.service-process-row:hover \.service-process-number,[\s\S]{0,300}\.service-process-row:hover \.service-process-label,[\s\S]{0,300}\.service-process-row:hover \.service-process-arrow\s*\{[^}]*color:\s*var\(--accent-bright\)/s, "real hover should color the number, label, and arrow blue");
  assert.match(finePointerHover.body, /\.service-process-row:hover \.service-process-media\s*\{[^}]*opacity:\s*0/s, "hover should fade out the permanent sample when the large preview appears");
  assert.match(finePointerHover.body, /\.service-process-row:hover \.service-process-preview\s*\{[^}]*opacity:\s*1[^}]*transform:\s*translate3d\(0,\s*-12px,\s*0\)\s*rotate\(-5deg\)/s, "hover should reveal and lift only the current row's square preview");
  assert.match(finePointerHover.body, /\.service-process-row:hover \.service-process-arrow\s*\{[^}]*transform:\s*translate\(-100%,\s*-50%\)\s*rotate\(45deg\)/s, "hover should rotate the service arrow with the preview");

  assert.match(globalCss, /\.service-process-row\[data-active\]\s*\{[^}]*background:\s*#171a1d/s, "the active row should keep its neutral surface globally");
  assert.match(globalCss, /\.service-process-row\[data-active\]::before,\s*\.service-process-row:focus-visible::before\s*\{[^}]*transform:\s*scaleY\(1\)/s, "active and focus-visible rows should reveal the blue edge globally");
  assert.match(globalCss, /\.service-process-row\[data-active\] \.service-process-number,[\s\S]{0,300}\.service-process-row\[data-active\] \.service-process-label,[\s\S]{0,300}\.service-process-row\[data-active\] \.service-process-arrow\s*\{[^}]*color:\s*var\(--accent-bright\)/s, "the active number, label, and arrow should remain blue globally");
  assert.match(globalCss, /\.service-process-row\[data-active\] \.service-process-media img\s*\{[^}]*brightness\(0\.8\)[^}]*opacity:\s*1/s, "the active row should keep its permanent sample visible and bright");
  assert.match(globalCss, /\.service-process-row:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent-bright\)/s, "keyboard focus should remain visible globally");
  assert.match(globalCss, /\.service-process-row:focus-visible \.service-process-media\s*\{[^}]*opacity:\s*0/s, "keyboard focus should fade the permanent sample while the large preview is visible");
  assert.match(globalCss, /\.service-process-row:focus-visible \.service-process-preview\s*\{[^}]*opacity:\s*1[^}]*transform:\s*translate3d\(0,\s*-12px,\s*0\)\s*rotate\(-5deg\)/s, "keyboard focus should reveal the matching square preview");
});

test("services reduces the square preview to a simple fade", () => {
  const reducedMotion = findCssBlock(css, "@media (prefers-reduced-motion: reduce)");

  assert.match(reducedMotion.body, /\.service-process-preview\s*\{[^}]*transform:\s*none[^}]*transition:\s*opacity 120ms linear/s, "reduced motion should remove preview translation and rotation");
  assert.match(reducedMotion.body, /\.service-process-row:hover \.service-process-preview,\s*\.service-process-row:focus-visible \.service-process-preview\s*\{[^}]*transform:\s*none/s, "reduced motion hover and focus should stay still");
});

assert.match(js, /sessionStorage\.setItem\("lonma-language", language\)/, "language choice should persist within one tab");
assert.match(js, /querySelectorAll\("\[data-zh\]\[data-en\]"\)/, "content copy should switch between Chinese and English");
assert.doesNotMatch(js, /mailto:/, "shared interactions should not open a mail client");
assert.match(js, /querySelectorAll\("\[data-service-row\]"\)/, "services should initialize the active process row");
assert.match(js, /toggleAttribute\("data-active"/, "only one process row should remain active");
assert.match(
  js,
  /const currentSection = document\.body\.dataset\.section/,
  "detail pages should expose their parent navigation section"
);
assert.match(
  js,
  /currentSection === pageSection/,
  "nested detail routes should mark their parent navigation item active"
);

test("detail language controller updates accessible names and image alternatives", () => {
  class FakeElement {
    constructor({ attributes = {}, dataset = {} } = {}) {
      this.attributes = new Map(Object.entries(attributes));
      this.dataset = dataset;
      this.listeners = new Map();
      this.textContent = "";
      this.classList = { toggle: () => {} };
    }

    addEventListener(name, listener) {
      this.listeners.set(name, listener);
    }

    dispatch(name) {
      this.listeners.get(name)?.();
    }

    getAttribute(name) {
      return this.attributes.get(name) ?? null;
    }

    removeAttribute(name) {
      this.attributes.delete(name);
    }

    setAttribute(name, value) {
      this.attributes.set(name, value);
    }
  }

  const langToggle = new FakeElement({ attributes: { "aria-label": "切换到中文" } });
  const brand = new FakeElement({
    attributes: { "aria-label": "回到首页" },
    dataset: { zhAriaLabel: "回到首页", enAriaLabel: "Back to home" },
  });
  const navigation = new FakeElement({
    attributes: { "aria-label": "主导航" },
    dataset: { zhAriaLabel: "主导航", enAriaLabel: "Main navigation" },
  });
  const image = new FakeElement({
    attributes: { alt: "LONMA DYNAMIC 街道宽体" },
    dataset: { zhAlt: "LONMA DYNAMIC 街道宽体", enAlt: "LONMA DYNAMIC STREET WIDEBODY" },
  });
  const pagination = new FakeElement({
    attributes: { "aria-label": "案例分页" },
    dataset: { zhAriaLabel: "案例分页", enAriaLabel: "Case pagination" },
  });
  const navLinks = [
    new FakeElement({ attributes: { href: "../about.html" } }),
    new FakeElement({ attributes: { href: "../services.html" } }),
    new FakeElement({ attributes: { href: "../cases.html" } }),
    new FakeElement({ attributes: { href: "../contact.html" } }),
  ];
  const translatedNodes = [new FakeElement({ dataset: { zh: "案例", en: "CASES" } })];
  const nodesBySelector = new Map([
    [".lang-toggle", [langToggle]],
    ["[data-lang-option]", []],
    ["[data-zh][data-en]", translatedNodes],
    ["[data-zh-placeholder][data-en-placeholder]", []],
    [".nav a", navLinks],
    ["[data-contact-form]", []],
    ["[data-contact-status]", []],
    ["[data-service-row]", []],
    ["[data-zh-aria-label][data-en-aria-label]", [brand, navigation, pagination]],
    ["[data-zh-alt][data-en-alt]", [image]],
  ]);
  const document = {
    body: { dataset: { section: "cases" } },
    documentElement: { lang: "zh-CN" },
    querySelector: (selector) => nodesBySelector.get(selector)?.[0] ?? null,
    querySelectorAll: (selector) => nodesBySelector.get(selector) ?? [],
  };
  const sessionStorage = new Map([["lonma-language", "zh"]]);
  const window = { location: { pathname: "/pages/cases/case-01.html" } };

  vm.runInNewContext(js, {
    document,
    sessionStorage: {
      getItem: (key) => sessionStorage.get(key) ?? null,
      setItem: (key, value) => sessionStorage.set(key, value),
    },
    window,
  });

  langToggle.dispatch("click");

  assert.equal(document.documentElement.lang, "en");
  assert.equal(brand.getAttribute("aria-label"), "Back to home");
  assert.equal(navigation.getAttribute("aria-label"), "Main navigation");
  assert.equal(image.getAttribute("alt"), "LONMA DYNAMIC STREET WIDEBODY");
  assert.equal(pagination.getAttribute("aria-label"), "Case pagination");
  assert.equal(translatedNodes[0].textContent, "CASES");
});
