import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { shopProducts, shopVehicles } from "./shop-data.mjs";
import { renderShopPage } from "./scripts/render-shop-page.mjs";

const html = readFileSync(new URL("./pages/shop.html", import.meta.url), "utf8");
const js = readFileSync(new URL("./shop.js", import.meta.url), "utf8");
const css = readFileSync(new URL("./shop.css", import.meta.url), "utf8");

test("shop renders six truthful bilingual sample products", () => {
  assert.deepEqual(shopVehicles.makes, ["BMW", "AUDI", "MERCEDES-BENZ"]);
  assert.equal(shopProducts.length, 6);
  assert.equal((html.match(/data-product-card/g) || []).length, 6);
  assert.match(html, /SAMPLE VEHICLE/);
  assert.match(html, /data-zh="示例车型" data-en="SAMPLE VEHICLE"/);
  assert.doesNotMatch(html, /\$\s?\d|IN STOCK|data-price|sku|part number/i);
  assert.equal((html.match(/data-en="INQUIRE"/g) || []).length, 6);
});

test("shop initial status and dialog description switch to Chinese", () => {
  assert.match(
    html,
    /<p data-results-status aria-live="polite" data-zh="06 项示例结果" data-en="06 SAMPLE RESULTS">06 SAMPLE RESULTS<\/p>/
  );
  assert.match(
    html,
    /<p data-dialog-description data-zh="用于设计预览的轮毂分类示例。" data-en="A sample wheel category shown for design review\.">A sample wheel category shown for design review\.<\/p>/
  );
});

test("shop products own unique accessible media", () => {
  for (const product of shopProducts) {
    assert.ok(existsSync(new URL(`./${product.image}`, import.meta.url)), `${product.image} should exist`);
    assert.match(html, new RegExp(product.image.replaceAll(".", "\\.")));
    assert.ok(product.alt.en && product.alt.zh);
  }
});

test("renderShopPage escapes product copy", () => {
  const output = renderShopPage([{ ...shopProducts[0], title: { en: "<unsafe>", zh: "<危险>" } }]);
  assert.doesNotMatch(output, /<unsafe>|<危险>/);
  assert.match(output, /&lt;unsafe&gt;/);
});

test("shop controller supports filters, query links, and dialog focus", () => {
  assert.match(html, /shop\.js\?v=shop-case02-query-fix-20260722/);
  assert.match(js, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(js, /querySelectorAll\("\[data-product-card\]"\)/);
  assert.match(js, /querySelectorAll\("\[data-category-filter\]"\)/);
  assert.match(js, /resultsStatus\.textContent/);
  assert.match(js, /productDialog\.showModal\(\)/);
  assert.match(js, /event\.key === "Escape"/);
  assert.match(js, /lastDialogTrigger\.focus\(\)/);
});

test("shop provides reduced-motion and visible focus states", () => {
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent-bright\)/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
