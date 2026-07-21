import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

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
];

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const decode = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

test("all public pages ship English-first markup", () => {
  for (const path of publicPages) {
    const html = read(path);
    assert.match(html, /<html lang="en">/, `${path} should declare English`);
    assert.match(
      html,
      /<span class="lang-option is-current" data-lang-option="en">EN<\/span>/,
      `${path} should mark English current`,
    );
    assert.doesNotMatch(
      html,
      /<span class="lang-option is-current" data-lang-option="zh">中<\/span>/,
      `${path} should not mark Chinese current`,
    );

    const directBilingualNodes = [
      ...html.matchAll(/<([a-z][\w-]*)\b([^>]*\bdata-en="([^"]*)"[^>]*)>([^<]*)<\/\1>/gi),
    ];
    assert.ok(directBilingualNodes.length > 0, `${path} should expose bilingual direct text`);
    for (const match of directBilingualNodes) {
      assert.equal(match[4].trim(), decode(match[3]).trim(), `${path} should render data-en first`);
    }
  }
});

test("language controllers keep preference within one tab only", () => {
  for (const path of ["./script.js", "./content-pages.js"]) {
    const source = read(path);
    assert.match(source, /sessionStorage\.getItem\("lonma-language"\)/);
    assert.match(source, /sessionStorage\.setItem\("lonma-language", language\)/);
    assert.doesNotMatch(source, /localStorage\.(?:getItem|setItem)\("lonma-language"/);
    assert.match(source, /supportedLanguages\.includes\(language\) \? language : "en"/);
  }
});
