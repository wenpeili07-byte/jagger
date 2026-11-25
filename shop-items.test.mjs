import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { shopProducts, shopCategoryDefaults } from "./shop-data.mjs";
import { renderProductItemPage, renderShopPage, renderConfigurableProductPage } from "./scripts/render-shop-page.mjs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const root = fileURLToPath(new URL(".", import.meta.url));
const hasText = (value) => typeof value === "string" && value.trim().length > 0;

test("every product has complete core data, a page, a card, and a sitemap entry", () => {
  const shop = read("./pages/shop.html");
  const sitemap = read("./sitemap.xml");
  const ids = new Set();
  for (const product of shopProducts) {
    const name = product.id || "<missing id>";
    assert.match(product.id ?? "", /^[a-z]+(?:-[a-z]+)*$/, `${name}: id`);
    assert.ok(!ids.has(name), `${name}: duplicate id`);
    ids.add(name);
    assert.ok(shopCategoryDefaults[product.category], `${name}: category`);
    for (const field of ["title", "description", "alt"]) {
      for (const lang of ["en", "zh"]) {
        assert.ok(hasText(product[field]?.[lang]), `${name}: ${field}.${lang}`);
      }
    }
    assert.ok(hasText(product.image), `${name}: image`);
    assert.ok(existsSync(resolve(root, product.image)), `${name}: image file ${product.image}`);
    const pagePath = `pages/shop/${name}.html`;
    assert.ok(existsSync(resolve(root, pagePath)), `${name}: detail page`);
    const page = read(`./${pagePath}`);
    assert.equal(page, product.detail ? renderConfigurableProductPage(product) : renderProductItemPage(product), `${name}: generated page`);
    assert.match(shop, new RegExp(`href="\\./shop/${name}\\.html"`), `${name}: shop card`);
    assert.match(sitemap, new RegExp(`/pages/shop/${name}</loc>`), `${name}: sitemap`);
    for (const other of shopProducts.filter(({ id }) => id !== name)) {
      assert.match(page, new RegExp(`href="\\./${other.id}\\.html"`), `${name}: related ${other.id}`);
    }
  }
  assert.equal(shop, renderShopPage(), "shop page must match the current catalogue");
});

test("a minimum-data product renders an inquiry page and card without a price", () => {
  const product = {
    id: "sample-part",
    category: "brakes",
    title: { en: "SAMPLE PART", zh: "示例部件" },
    description: { en: "Sample for generator test.", zh: "生成测试示例。" },
    image: "assets/images/shop/brake-kit.webp",
    alt: { en: "Sample part", zh: "示例部件" },
  };
  const html = renderProductItemPage(product);
  assert.match(html, /data-product-id="sample-part"/);
  assert.match(html, /data-zh="按车型报价" data-en="ON REQUEST"/);
  assert.match(html, /data-zh="轮毂空间" data-en="WHEEL CLEARANCE"/);
  assert.match(html, /case-02\.html/);
  assert.doesNotMatch(html, /US\$\d|\$\s?\d/);
  const shop = renderShopPage([product, ...shopProducts]);
  assert.match(shop, /href="\.\/shop\/sample-part\.html"/);
  assert.match(shop, /data-feature-wheel hidden/);
  assert.match(shop, /data-feature-other>/);
});

test("every category provides an honest default enquiry and only matching case references", () => {
  for (const [category, defaults] of Object.entries(shopCategoryDefaults)) {
    const product = {
      id: `sample-${category}`,
      category,
      title: { en: "SAMPLE PART", zh: "示例部件" },
      description: { en: "Sample for generator test.", zh: "生成测试示例。" },
      image: "assets/images/shop/brake-kit.webp",
      alt: { en: "Sample part", zh: "示例部件" },
    };
    const html = renderProductItemPage(product);
    assert.match(html, new RegExp(`data-en="${defaults.label.en}"`), `${category}: kicker`);
    for (const item of defaults.confirm) assert.ok(html.includes(`data-en="${item.en}"`), `${category}: ${item.en}`);
    assert.match(html, /data-zh="按车型报价" data-en="ON REQUEST"/, `${category}: on request`);
    if (category === "exhaust") assert.doesNotMatch(html, /id="product-reference-panel"/, `${category}: no case reference`);
    else assert.match(html, /id="product-reference-panel"/, `${category}: case reference`);
  }
});

test("configurable product page uses its own identity, gallery, route and optional price", () => {
  const product = structuredClone(shopProducts.find(({ detail }) => detail));
  product.id = "sample-config";
  product.title = { en: "SAMPLE CONFIG", zh: "示例配置" };
  product.detail.title = { en: "CUSTOM CONFIG", zh: "定制配置" };
  product.detail.gallery = [{ label: { en: "SIDE VIEW", zh: "侧面" }, image: product.image, alt: product.alt }];
  delete product.detail.referencePrice;
  const html = renderConfigurableProductPage(product);
  assert.match(html, /<title>CUSTOM CONFIG \| LONMA DYNAMIC<\/title>/);
  assert.match(html, /pages\/shop\/sample-config/);
  assert.match(html, /CUSTOM CONFIG/);
  assert.match(html, /SIDE VIEW/);
  assert.match(html, /data-zh="按车型报价" data-en="ON REQUEST"/);
  assert.doesNotMatch(html, /Monoblock Forged Wheel|US\$3,200|CASE 03 REFERENCE/);
  product.detail.referencePrice = {};
  assert.match(renderConfigurableProductPage(product), /data-zh="按车型报价" data-en="ON REQUEST"/);
});

test("every catalogue item without configurable data has its own detail page", () => {
  const items = shopProducts.filter((product) => !product.detail);
  for (const product of items) {
    const html = read(`./pages/shop/${product.id}.html`);
    assert.match(html, /data-gallery\b/);
    assert.match(html, /data-item-inquiry/);
    assert.match(html, /data-item-build/);
    assert.match(html, /data-zh="按车型报价" data-en="ON REQUEST"/);
    assert.doesNotMatch(html, /US\$\d|\$\s?\d/, `${product.id} must not show an invented price`);
    assert.match(html, /shop-item\.js\?v=shop-item-20261125/);
    assert.match(html, new RegExp(`<link rel="canonical" href="[^"]+/pages/shop/${product.id}"`));
    for (const item of product.inquiry?.confirm ?? shopCategoryDefaults[product.category].confirm) {
      assert.match(html, new RegExp(`data-en="${item.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
    }
  }
});
