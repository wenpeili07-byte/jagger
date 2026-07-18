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
assert.equal((servicesHtml.match(/class="service-index-row"/g) || []).length, 6, "services should contain six equal business rows");
for (const href of serviceLinks) {
  assert.match(servicesHtml, new RegExp(`href="${href.replaceAll(".", "\\.")}"`), `services should link to ${href}`);
}
assert.match(servicesHtml, /01[\s\S]*BUILD[\s\S]*02[\s\S]*PARTS[\s\S]*03[\s\S]*PHOTO[\s\S]*04[\s\S]*ECU[\s\S]*05[\s\S]*CHASSIS[\s\S]*06[\s\S]*EXHAUST/, "services should keep the established service order");

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
assert.match(css, /\.service-index-row\s*\{[^}]*border-top:\s*1px solid var\(--line\)/s, "service rows should use neutral borders by default");
assert.match(css, /\.service-index-row:hover\s*\{[^}]*background:\s*rgba\(28,\s*93,\s*153,\s*0\.14\)/s, "service hover should use restrained dark automotive blue");
assert.match(css, /@media \(max-width:\s*760px\)/, "content pages should include a mobile layout");
assert.match(css, /\.process-step\s*\{[^}]*min-height:/s, "process stages should reserve stable equal heights");
assert.doesNotMatch(css, /\.process-step\s*\{[^}]*border-radius:/s, "process stages should not become rounded cards");

assert.match(js, /localStorage\.setItem\("lonma-language"/, "language choice should persist across pages");
assert.match(js, /querySelectorAll\("\[data-zh\]\[data-en\]"\)/, "content copy should switch between Chinese and English");
assert.match(js, /new FormData\(contactForm\)/, "contact submit should use the visible form values");
assert.match(js, /mailto:hello@lonmadynamic\.com/, "contact submit should open a prefilled email to LONMA");
