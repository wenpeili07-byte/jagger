import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const html = read("./pages/shop/forged-wheel.html");
const css = read("./shop-product.css");
const source = existsSync(new URL("./shop-product.js", import.meta.url))
  ? read("./shop-product.js")
  : "";

class ProductNode {
  constructor({ checked = false, maxLength = 0, value = "" } = {}) {
    this.attributes = new Map();
    this.checked = checked;
    this.dataset = {};
    this.href = "";
    this.listeners = new Map();
    this.maxLength = maxLength;
    this.textContent = "";
    this.value = value;
  }

  addEventListener(name, listener) {
    this.listeners.set(name, listener);
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === "href") this.href = "";
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === "href") this.href = String(value);
  }

  toggleAttribute(name, force) {
    if (force) this.setAttribute(name, "");
    else this.removeAttribute(name);
    return force;
  }
}

function createProductHarness(search = "") {
  const make = new ProductNode({ maxLength: 20, value: "BMW" });
  const model = new ProductNode({ maxLength: 40, value: "G80 M3" });
  const year = new ProductNode({ maxLength: 4, value: "2024" });
  const chassis = new ProductNode({ maxLength: 20, value: "G8X" });
  const quantity = new ProductNode({ value: "4" });
  const diameter = [
    new ProductNode({ checked: true, value: "19 inch" }),
    new ProductNode({ value: "20 inch" }),
  ];
  const width = [
    new ProductNode({ checked: true, value: "9.5J / 10.5J" }),
    new ProductNode({ value: "10J / 11J" }),
  ];
  const finish = [
    new ProductNode({ checked: true, value: "Satin Black" }),
    new ProductNode({ value: "Brushed Silver" }),
  ];
  const addToBuild = new ProductNode();
  const fitmentInquiry = new ProductNode();
  const fitmentMessage = new ProductNode();
  const langToggle = new ProductNode();
  const exported = {};
  const singleNodes = new Map([
    ["[data-fitment-make]", make],
    ["[data-fitment-model]", model],
    ["[data-fitment-year]", year],
    ["[data-fitment-chassis]", chassis],
    ["[data-product-quantity]", quantity],
    ["[data-fitment-message]", fitmentMessage],
    ["[data-add-to-build]", addToBuild],
    ["[data-fitment-inquiry]", fitmentInquiry],
    [".lang-toggle", langToggle],
  ]);
  const groupNodes = new Map([
    ['[data-option-group="diameter"] input', diameter],
    ['[data-option-group="width"] input', width],
    ['[data-option-group="finish"] input', finish],
  ]);
  const locationUrl = new URL(`https://example.test/pages/shop/forged-wheel.html${search}`);
  const document = {
    documentElement: { lang: "en" },
    querySelector: (selector) => singleNodes.get(selector),
    querySelectorAll: (selector) => groupNodes.get(selector) || [],
  };

  assert.notEqual(source, "", "shop-product.js should exist");
  vm.runInNewContext(source, {
    URL,
    URLSearchParams,
    document,
    window: {
      location: {
        href: locationUrl.href,
        search: locationUrl.search,
      },
      LonmaProductTest: exported,
    },
  });

  return {
    addToBuild,
    chassis,
    document,
    exported,
    finish,
    fitmentInquiry,
    fitmentMessage,
    make,
    model,
    quantity,
    width,
    year,
  };
}

test("forged wheel page exposes fitment, configuration, and two honest actions", () => {
  assert.match(html, /data-product-fitment/);
  assert.match(html, /data-option-group="diameter"/);
  assert.match(html, /data-option-group="width"/);
  assert.match(html, /data-option-group="finish"/);
  assert.match(html, /data-product-quantity/);
  assert.match(html, /data-en="ADD TO BUILD"/);
  assert.match(html, /data-en="REQUEST FITMENT CHECK"/);
  assert.match(html, /REFERENCE PACKAGE[\s\S]*US\$3,200[\s\S]*Final quote follows fitment verification\./);
  assert.doesNotMatch(html, /CHECKOUT|BUY NOW|IN STOCK/i);
});

test("supported fitment creates a complete planner handoff", () => {
  const harness = createProductHarness();
  const route = new URL(harness.addToBuild.href, "https://example.test/pages/shop/forged-wheel.html");

  assert.equal(harness.exported.getState().supported, true);
  assert.equal(harness.addToBuild.getAttribute("aria-disabled"), "false");
  assert.equal(route.pathname, "/pages/project.html");
  assert.deepEqual(Object.fromEntries(route.searchParams), {
    product: "forged-wheel",
    vehicle: "2024 BMW G80 M3 G8X",
    direction: "parts",
    diameter: "19 inch",
    width: "9.5J / 10.5J",
    finish: "Satin Black",
    quantity: "4",
  });
});

test("unsupported fitment disables add to build but keeps fitment inquiry", () => {
  const harness = createProductHarness();

  harness.exported.setVehicle("AUDI", "RS 5", "2024", "B9.5");

  assert.equal(harness.exported.getState().supported, false);
  assert.equal(harness.addToBuild.getAttribute("aria-disabled"), "true");
  assert.equal(harness.addToBuild.getAttribute("tabindex"), "-1");
  assert.equal(harness.addToBuild.getAttribute("href"), null);
  assert.match(harness.fitmentMessage.textContent, /FITMENT CHECK REQUIRED/);
  const inquiry = new URL(harness.fitmentInquiry.href, "https://example.test/pages/shop/forged-wheel.html");
  assert.equal(inquiry.pathname, "/pages/contact.html");
  assert.equal(inquiry.searchParams.get("service"), "Performance Parts");
  assert.equal(inquiry.searchParams.get("vehicle"), "2024 AUDI RS 5 B9.5");
});

test("incoming vehicle query is cleaned, bounded, and validated", () => {
  const harness = createProductHarness(
    "?make=BMW%00&model=G82%20M4%0A&year=2025EXTRA&chassis=G8X%7F"
  );

  assert.deepEqual(
    JSON.parse(JSON.stringify(harness.exported.getState().vehicle)),
    { make: "BMW", model: "G82 M4", year: "2025", chassis: "G8X" }
  );
  assert.equal(harness.exported.getState().supported, true);
  assert.deepEqual(
    [harness.make.value, harness.model.value, harness.year.value, harness.chassis.value],
    ["BMW", "G82 M4", "2025", "G8X"]
  );
});

test("hidden product option inputs expose a visible label focus state", () => {
  assert.match(
    css,
    /\.product-option-row label:has\(input:focus-visible\)\s*\{[^}]*outline:\s*2px solid var\(--accent-bright\)[^}]*outline-offset:\s*3px/s
  );
});
