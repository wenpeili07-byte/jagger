import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { shopProducts } from "./shop-data.mjs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("every catalogue item without configurable data has its own detail page", () => {
  const items = shopProducts.filter((product) => product.inquiry);
  assert.equal(items.length, 5);
  for (const product of items) {
    const html = read(`./pages/shop/${product.id}.html`);
    assert.match(html, /data-gallery\b/);
    assert.match(html, /data-item-inquiry/);
    assert.match(html, /data-item-build/);
    assert.match(html, /data-zh="按车型报价" data-en="ON REQUEST"/);
    assert.doesNotMatch(html, /US\$\d|\$\s?\d/, `${product.id} must not show an invented price`);
    assert.match(html, /shop-item\.js\?v=shop-item-20261125/);
    assert.match(html, new RegExp(`<link rel="canonical" href="[^"]+/pages/shop/${product.id}"`));
    for (const item of product.inquiry.confirm) {
      assert.match(html, new RegExp(`data-en="${item.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
    }
  }
});
