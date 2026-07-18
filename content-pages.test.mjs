import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const aboutHtml = readFileSync(new URL("./pages/about.html", import.meta.url), "utf8");
const servicesHtml = readFileSync(new URL("./pages/services.html", import.meta.url), "utf8");
const contactHtml = readFileSync(new URL("./pages/contact.html", import.meta.url), "utf8");
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

for (const [name, html] of pages) {
  assert.match(html, /class="site-shell content-page/, `${name} should use the content-page shell`);
  assert.match(html, /href="\.\.\/content-pages\.css\?v=/, `${name} should load the isolated content page stylesheet`);
  assert.match(html, /src="\.\.\/content-pages\.js\?v=/, `${name} should load shared page interactions`);
  assert.match(html, /<header class="topbar">/, `${name} should keep the shared site header`);
  assert.match(html, /<button class="lang-toggle" type="button" aria-label="Switch language">/, `${name} should keep the language control`);
  assert.match(html, /<footer class="content-footer">/, `${name} should include the shared content footer`);
}

assert.match(aboutHtml, /class="content-hero about-hero"/, "about should use the selected cinematic hero");
assert.match(aboutHtml, /MADE BY ITERATION\./, "about should use the selected process-led headline");
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
assert.equal((servicesHtml.match(/class="service-index-row(?:\s|")/g) || []).length, 6, "services should contain six equal business rows");
for (const href of serviceLinks) {
  assert.match(servicesHtml, new RegExp(`href="${href.replaceAll(".", "\\.")}"`), `services should link to ${href}`);
}
assert.match(servicesHtml, /01[\s\S]*BUILD[\s\S]*02[\s\S]*PARTS[\s\S]*03[\s\S]*PHOTO[\s\S]*04[\s\S]*ECU[\s\S]*05[\s\S]*CHASSIS[\s\S]*06[\s\S]*EXHAUST/, "services should keep the established service order");
assert.match(
  servicesHtml,
  /<section class="service-showcase"[\s\S]*<div class="service-index-list">[\s\S]*<div class="service-preview"/,
  "services should pair its text index with one shared preview"
);
assert.equal(
  (servicesHtml.match(/data-service-index="\d"/g) || []).length,
  6,
  "services should expose six selectable rows"
);
assert.equal(
  (servicesHtml.match(/class="service-index-row-image"/g) || []).length,
  6,
  "mobile services should include one image per row"
);
assert.equal(
  (servicesHtml.match(/data-service-preview-index="\d"/g) || []).length,
  6,
  "desktop services should include six cross-fade preview images"
);

assert.match(contactHtml, /<form class="contact-form" data-contact-form>/, "contact should include a focused project inquiry form");
for (const name of ["name", "email", "vehicle", "service", "message"]) {
  assert.match(contactHtml, new RegExp(`name="${name}"`), `contact should collect ${name}`);
}
assert.match(contactHtml, /type="email"[^>]*required/, "contact email should be required");
assert.match(contactHtml, /data-contact-status/, "contact should expose a status message for form feedback");

assert.match(css, /\.content-page\.site-shell\s*\{[^}]*max-width:\s*1900px/s, "content pages should use the selected 1900px desktop canvas");
assert.match(css, /\.content-hero-media img\s*\{[^}]*object-fit:\s*cover/s, "content hero imagery should crop without distortion");
assert.match(css, /\.content-hero-copy\s*\{[^}]*justify-content:\s*center/s, "about hero copy should keep the selected vertically centered composition");
assert.match(css, /\.content-display\s*\{[^}]*font-family:\s*Impact/s, "display headings should use a tall condensed automotive face");
assert.match(css, /\.content-process::before\s*\{[^}]*width:\s*25%[^}]*background:\s*var\(--accent-bright\)/s, "about process should keep the selected blue progress line");
assert.match(
  css,
  /\.service-showcase-layout\s*\{[^}]*grid-template-columns:\s*minmax\(360px,\s*0\.72fr\)\s+minmax\(520px,\s*1fr\)/s,
  "desktop services should use the selected editorial split"
);
assert.match(css, /\.service-index-row\s*\{[^}]*border-bottom:\s*1px solid var\(--line\)/s, "service rows should use neutral borders by default");
assert.doesNotMatch(
  css,
  /\.service-index-row(?:\:hover|\.is-active)\s*\{[^}]*background:/s,
  "service rows should remain visually open instead of becoming blue cards"
);
assert.match(
  css,
  /\.service-preview-image\s*\{[^}]*object-fit:\s*cover[^}]*opacity:\s*0[^}]*transform:\s*translateY\(12px\)/s,
  "service preview images should begin transparent and slightly lowered"
);
const activeServicePreviewBlock =
  css.match(/\.service-preview-image\.is-active\s*\{[\s\S]*?\n\}/)?.[0] || "";
assert.match(activeServicePreviewBlock, /opacity:\s*1/, "the active service preview should be visible");
assert.doesNotMatch(activeServicePreviewBlock, /scale\(/, "service preview images must not scale");
assert.match(
  css,
  /@media \(max-width:\s*760px\)[\s\S]*\.service-index-row-image\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3[^}]*object-fit:\s*cover/s,
  "mobile services should use stable in-flow images"
);
assert.match(css, /@media \(max-width:\s*760px\)/, "content pages should include a mobile layout");
assert.match(css, /\.process-step\s*\{[^}]*min-height:/s, "process stages should reserve stable equal heights");
assert.doesNotMatch(css, /\.process-step\s*\{[^}]*border-radius:/s, "process stages should not become rounded cards");

assert.match(js, /localStorage\.setItem\("lonma-language"/, "language choice should persist across pages");
assert.match(js, /querySelectorAll\("\[data-zh\]\[data-en\]"\)/, "content copy should switch between Chinese and English");
assert.match(js, /querySelectorAll\("\[data-service-index\]"\)/, "services should discover selectable rows");
assert.match(js, /function setActiveService\(index\)/, "services should expose one active-state controller");
assert.match(js, /dataServicePreviewIndex/, "services should synchronize shared preview images");
assert.doesNotMatch(js, /window\.addEventListener\("scroll"|requestAnimationFrame/, "services should not be driven by page scroll");
assert.match(js, /new FormData\(contactForm\)/, "contact submit should use the visible form values");
assert.match(js, /mailto:hello@lonmadynamic\.com/, "contact submit should open a prefilled email to LONMA");
