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
assert.match(servicesHtml, /class="services-workspace"/, "services should use the selected workshop workspace");
assert.match(servicesHtml, /class="services-intro"/, "services should keep a dedicated editorial introduction");
assert.match(servicesHtml, /class="service-process-rail"/, "services should present one continuous process rail");
assert.doesNotMatch(servicesHtml, /class="content-hero services-hero"/, "services should remove the old standalone hero");
assert.doesNotMatch(servicesHtml, /class="service-index"/, "services should remove the old flat service index");
assert.equal((servicesHtml.match(/data-service-row/g) || []).length, 6, "services should contain six interactive process rows");
assert.equal((servicesHtml.match(/class="service-process-media"/g) || []).length, 6, "each service row should include LONMA photography");
for (const href of serviceLinks) {
  assert.match(servicesHtml, new RegExp(`href="${href.replaceAll(".", "\\.")}"`), `services should link to ${href}`);
}
assert.match(servicesHtml, /01[\s\S]*BUILD[\s\S]*02[\s\S]*PARTS[\s\S]*03[\s\S]*PHOTO[\s\S]*04[\s\S]*ECU[\s\S]*05[\s\S]*CHASSIS[\s\S]*06[\s\S]*EXHAUST/, "services should keep the established service order");

for (const caseNumber of ["01", "02", "03", "04", "05", "06"]) {
  const imagePath = `./assets/images/网页/optimized/case-${caseNumber}.jpg`;
  assert.ok(existsSync(new URL(imagePath, import.meta.url)), `${imagePath} should exist`);
  assert.match(servicesHtml, new RegExp(`optimized/case-${caseNumber}\\.jpg`), `services should use case-${caseNumber}.jpg`);
}

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
assert.match(css, /@media \(max-width:\s*760px\)/, "content pages should include a mobile layout");
assert.match(css, /\.process-step\s*\{[^}]*min-height:/s, "process stages should reserve stable equal heights");
assert.doesNotMatch(css, /\.process-step\s*\{[^}]*border-radius:/s, "process stages should not become rounded cards");
assert.match(css, /\.services-workspace\s*\{[^}]*grid-template-columns:/s, "services should use the selected split workspace");
assert.match(css, /\.services-workspace\s*\{[^}]*\n\s*height:\s*calc\(min\(1050px,\s*100vh\)\s*-\s*76px\)/s, "desktop services workspace should occupy one viewport-bound canvas");
assert.match(css, /\.services-workspace\s*\{[^}]*min-height:\s*[5-9]\d{2}px/s, "desktop services workspace should retain a practical minimum height");
assert.match(css, /\.service-process-rail\s*\{[^}]*grid-template-rows:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/s, "desktop rail should reserve six equal rows without intrinsic minimums");
assert.match(css, /\.service-process-rail\s*\{[^}]*min-height:\s*0/s, "service rail should contain intrinsic child height");
assert.match(css, /\.service-process-row\s*\{[^}]*min-height:\s*0/s, "service rows should not expand from intrinsic content");
assert.match(css, /\.service-process-media\s*\{[^}]*min-height:\s*0/s, "service media should remain contained within each row");
assert.match(css, /\.service-process-media img\s*\{[^}]*object-fit:\s*cover/s, "service imagery should crop without distortion");
assert.doesNotMatch(css, /\.service-process-row:hover[\s\S]{0,800}\.service-process-media img\s*\{[^}]*transform:/s, "service hover should not zoom or move images");
assert.match(css, /\.service-process-row\[data-active\],\s*\.service-process-row:hover\s*\{[^}]*background:\s*#171a1d/s, "service active and hover states should keep a neutral black-gray background");
assert.match(css, /\.service-process-row::before\s*\{[^}]*background:\s*var\(--accent-bright\)/s, "service rows should reserve blue for the left edge");
assert.match(css, /\.service-process-row\[data-active\]\s+\.service-process-number,[\s\S]{0,700}color:\s*var\(--accent-bright\)/s, "service active states should keep blue numbers, labels, and arrows");
assert.match(css, /\.service-process-row:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent-bright\)/s, "service rows should keep visible keyboard focus");
assert.match(css, /@media \(max-width:\s*760px\)[\s\S]*\.services-workspace\s*\{[^}]*grid-template-columns:\s*1fr/s, "services should stack cleanly on mobile");
assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.services-workspace\s*\{[^}]*height:\s*auto[^}]*min-height:\s*0/s, "mobile services workspace should restore natural stacked scrolling");
assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.service-process-row\s*\{[^}]*grid-template-rows:\s*minmax\(0,\s*1fr\)[^}]*height:\s*360px[^}]*min-height:\s*0/s, "mobile service rows should use one stable contained overlay track");
assert.match(css, /@media \(max-width:\s*760px\)\s*\{[\s\S]*?\.service-process-media\s*\{[^}]*height:\s*100%[^}]*min-height:\s*0/s, "mobile service media should fill, not expand, its row");

assert.match(js, /localStorage\.setItem\("lonma-language"/, "language choice should persist across pages");
assert.match(js, /querySelectorAll\("\[data-zh\]\[data-en\]"\)/, "content copy should switch between Chinese and English");
assert.match(js, /new FormData\(contactForm\)/, "contact submit should use the visible form values");
assert.match(js, /mailto:hello@lonmadynamic\.com/, "contact submit should open a prefilled email to LONMA");
assert.match(js, /querySelectorAll\("\[data-service-row\]"\)/, "services should initialize the active process row");
assert.match(js, /toggleAttribute\("data-active"/, "only one process row should remain active");
