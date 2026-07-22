import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
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
  assert.match(html, /shop\.js\?v=shop-integration-20260722/);
  assert.match(js, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(js, /querySelectorAll\("\[data-product-card\]"\)/);
  assert.match(js, /querySelectorAll\("\[data-category-filter\]"\)/);
  assert.match(js, /resultsStatus\.textContent/);
  assert.match(js, /productDialog\.showModal\(\)/);
  assert.match(js, /event\.key === "Escape"/);
  assert.match(js, /lastDialogTrigger\.focus\(\)/);
});

test("shop controller resets unsupported vehicle fields and reports no samples", () => {
  class FakeNode {
    constructor({ dataset = {}, value = "" } = {}) {
      this.checked = false;
      this.dataset = { ...dataset };
      this.disabled = false;
      this.hidden = false;
      this.isConnected = true;
      this.listeners = new Map();
      this.open = false;
      this.textContent = "";
      this.value = value;
    }

    addEventListener(name, listener) {
      this.listeners.set(name, listener);
    }

    append() {}
    close() { this.open = false; }
    focus() {}
    matches(selector) { return selector === "button"; }
    setAttribute() {}
    showModal() { this.open = true; }
  }

  const cards = shopProducts.map((product) => {
    const card = new FakeNode({ dataset: { category: product.category } });
    card.querySelector = (selector) => selector === "[data-product-open]"
      ? new FakeNode()
      : new FakeNode({ dataset: { en: product.category.toUpperCase(), zh: product.category } });
    return card;
  });
  const filters = [...new Set(shopProducts.map((product) => product.category))].map(
    (value) => new FakeNode({ value })
  );
  const makeControl = new FakeNode({ value: "BMW" });
  const modelControl = new FakeNode({ value: "G80 M3" });
  const yearControl = new FakeNode({ value: "2024" });
  const chassisControl = new FakeNode({ value: "G8X" });
  const findButton = new FakeNode();
  const resultsStatus = new FakeNode();
  const emptyState = new FakeNode();
  const locationUrl = new URL("https://example.test/pages/shop.html");
  const location = {
    hash: locationUrl.hash,
    href: locationUrl.href,
    pathname: locationUrl.pathname,
    search: locationUrl.search,
  };
  const singleNodes = new Map([
    ["[data-results-status]", resultsStatus],
    ["[data-results-empty]", emptyState],
    [".shop-product-grid", new FakeNode()],
    ["[data-shop-sort]", new FakeNode({ value: "featured" })],
    ["[data-product-dialog]", new FakeNode()],
    ["[data-dialog-image]", new FakeNode()],
    ["[data-dialog-category]", new FakeNode()],
    ["[data-dialog-title]", new FakeNode()],
    ["[data-dialog-description]", new FakeNode()],
    ["[data-dialog-inquiry]", new FakeNode()],
    ["[data-dialog-close]", new FakeNode()],
    ["[data-shop-make]", makeControl],
    ["[data-shop-model]", modelControl],
    ["[data-shop-year]", yearControl],
    ["[data-shop-chassis]", chassisControl],
    ["[data-find-parts]", findButton],
  ]);
  const document = {
    documentElement: { lang: "en" },
    addEventListener() {},
    querySelector: (selector) => singleNodes.get(selector),
    querySelectorAll: (selector) => {
      if (selector === "[data-product-card]") return cards;
      if (selector === "[data-category-filter]") return filters;
      return [];
    },
  };
  const history = {
    replaceState(_state, _title, nextUrl) {
      const next = new URL(nextUrl, location.href);
      Object.assign(location, {
        hash: next.hash,
        href: next.href,
        pathname: next.pathname,
        search: next.search,
      });
    },
  };

  vm.runInNewContext(js, {
    URL,
    URLSearchParams,
    document,
    encodeURIComponent,
    window: { history, location },
  });

  assert.equal(typeof makeControl.listeners.get("change"), "function");
  assert.equal(typeof findButton.listeners.get("click"), "function");

  makeControl.value = "AUDI";
  makeControl.listeners.get("change")();
  assert.deepEqual(
    [modelControl, yearControl, chassisControl].map((control) => [control.value, control.disabled]),
    [["", true], ["", true], ["", true]]
  );
  findButton.listeners.get("click")();
  assert.equal(resultsStatus.textContent, "00 SAMPLE RESULTS");
  assert.equal(emptyState.hidden, false);

  makeControl.value = "BMW";
  makeControl.listeners.get("change")();
  findButton.listeners.get("click")();
  assert.deepEqual(
    [modelControl, yearControl, chassisControl].map((control) => [control.value, control.disabled]),
    [["G80 M3", false], ["2024", false], ["G8X", false]]
  );
  assert.equal(resultsStatus.textContent, "06 SAMPLE RESULTS");
  assert.equal(emptyState.hidden, true);
});

test("shop provides reduced-motion and visible focus states", () => {
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent-bright\)/s);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
