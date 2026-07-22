import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { caseDetails } from "./detail-pages-data.mjs";
import { shopProducts } from "./shop-data.mjs";
import { renderCasePage } from "./scripts/render-detail-pages.mjs";

const case02 = caseDetails.find((record) => record.id === "02");
const html = readFileSync(new URL("./pages/cases/case-02.html", import.meta.url), "utf8");
const shopController = readFileSync(new URL("./shop.js", import.meta.url), "utf8");
const caseController = readFileSync(new URL("./case-02.js", import.meta.url), "utf8");

class FakeNode {
  constructor({ dataset = {}, value = "" } = {}) {
    this.checked = false;
    this.dataset = { ...dataset };
    this.hidden = false;
    this.listeners = new Map();
    this.open = false;
    this.textContent = "";
    this.value = value;
  }

  addEventListener(name, listener) {
    this.listeners.set(name, listener);
  }

  append() {}

  close() {
    this.open = false;
  }

  focus() {}

  showModal() {
    this.open = true;
  }
}

function runShopQuery(category) {
  const cards = shopProducts.map((product) => {
    const card = new FakeNode({ dataset: { category: product.category } });
    card.querySelector = (selector) =>
      selector === "[data-product-open]"
        ? new FakeNode()
        : new FakeNode({ dataset: { en: product.category.toUpperCase(), zh: product.category } });
    return card;
  });
  const filters = [...new Set(shopProducts.map((product) => product.category))].map(
    (value) => new FakeNode({ value })
  );
  const resultsStatus = new FakeNode();
  const emptyState = new FakeNode();
  const sortControl = new FakeNode({ value: "featured" });
  const productDialog = new FakeNode();
  const locationUrl = new URL(`https://example.test/pages/shop.html?category=${category}`);
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
    ["[data-shop-sort]", sortControl],
    ["[data-product-dialog]", productDialog],
    ["[data-dialog-image]", new FakeNode()],
    ["[data-dialog-category]", new FakeNode()],
    ["[data-dialog-title]", new FakeNode()],
    ["[data-dialog-description]", new FakeNode()],
    ["[data-dialog-inquiry]", new FakeNode()],
    ["[data-dialog-close]", new FakeNode()],
    ["[data-shop-make]", new FakeNode({ value: "BMW" })],
    ["[data-shop-model]", new FakeNode({ value: "G80 M3" })],
    ["[data-shop-year]", new FakeNode({ value: "2024" })],
    ["[data-shop-chassis]", new FakeNode({ value: "G8X" })],
    ["[data-find-parts]", new FakeNode()],
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

  vm.runInNewContext(shopController, {
    URL,
    URLSearchParams,
    document,
    encodeURIComponent,
    window: { history, location },
  });

  return {
    emptyVisible: !emptyState.hidden,
    search: location.search,
    status: resultsStatus.textContent,
    visibleCategories: cards.filter((card) => !card.hidden).map((card) => card.dataset.category),
  };
}

test("Case 02 owns four category-level parts references", () => {
  assert.equal(case02.partsUsed.length, 4);
  assert.deepEqual(case02.partsUsed.map((part) => part.category), ["brakes", "suspension", "wheels", "ecu"]);
});

test("all Case 02 category links initialize a truthful Shop query state", () => {
  for (const part of case02.partsUsed) {
    assert.match(html, new RegExp(`href="\\.\\.\\/shop\\.html\\?category=${part.category}"`));

    const state = runShopQuery(part.category);
    const expectedCategories = shopProducts
      .filter((product) => product.category === part.category)
      .map((product) => product.category);
    const expectedCount = expectedCategories.length;

    assert.deepEqual(state.visibleCategories, expectedCategories, `${part.category} should show only matching samples`);
    assert.equal(state.status, `${String(expectedCount).padStart(2, "0")} SAMPLE RESULTS`);
    assert.equal(state.emptyVisible, expectedCount === 0);
    assert.equal(state.search, `?category=${part.category}`, `${part.category} should remain in the URL`);
  }
});

test("Case 02 uses the approved special layout and real hero", () => {
  assert.match(html, /class="case02-showcase"/);
  assert.match(html, /optimized\/case-02\.jpg/);
  assert.equal((html.match(/data-case-marker/g) || []).length, 4);
  assert.equal((html.match(/data-case-part/g) || []).length, 4);
  assert.match(html, /PARTS USED/);
  assert.match(html, /href="\.\.\/shop\.html\?category=brakes"/);
  assert.match(html, /case-02\.css\?v=case02-final-review-20260722/);
  assert.match(html, /case-02\.js\?v=case02-final-review-20260722/);
  assert.doesNotMatch(html, /\$\s?\d|IN STOCK|data-price/i);
});

test("Case 02 complete build action targets its stable editorial section", () => {
  const target = html.match(/class="case02-shop-all" href="#([^"]+)"/)?.[1];

  assert.ok(target, "VIEW COMPLETE BUILD LIST should use a same-page fragment");
  assert.match(html, new RegExp(`<section class="detail-story" id="${target}">`));
});

function runMarkerReveal({ markerTop, reducedMotion }) {
  class CaseNode {
    constructor({ marker, part, top = 100 } = {}) {
      this.attributes = new Map();
      this.dataset = {};
      this.listeners = new Map();
      this.scrollCalls = [];
      this.top = top;

      if (marker) this.dataset.caseMarker = marker;
      if (part) this.dataset.casePart = part;
    }

    addEventListener(name, listener) {
      this.listeners.set(name, listener);
    }

    getBoundingClientRect() {
      return { bottom: this.top + 32, top: this.top };
    }

    matches(selector) {
      return selector === "button" && Boolean(this.dataset.caseMarker);
    }

    scrollIntoView(options) {
      this.scrollCalls.push(options);
    }

    setAttribute(name, value) {
      this.attributes.set(name, value);
    }

    toggleAttribute(name, enabled) {
      if (enabled) this.attributes.set(name, "");
      else this.attributes.delete(name);
    }
  }

  const marker = new CaseNode({ marker: "02", top: markerTop });
  const part = new CaseNode({ part: "02" });
  const document = {
    documentElement: { clientHeight: 900 },
    querySelectorAll(selector) {
      if (selector === "[data-case-marker]") return [marker];
      if (selector === "[data-case-part]") return [part];
      return [];
    },
  };

  vm.runInNewContext(caseController, {
    document,
    window: {
      innerHeight: 900,
      matchMedia: () => ({ matches: reducedMotion }),
    },
  });
  part.listeners.get("focus")();

  return { marker, part };
}

test("Case 02 reveals a matching marker only when it is outside the viewport", () => {
  const visible = runMarkerReveal({ markerTop: 120, reducedMotion: false });
  const hidden = runMarkerReveal({ markerTop: -40, reducedMotion: false });

  assert.equal(visible.marker.scrollCalls.length, 0);
  assert.equal(hidden.marker.scrollCalls.length, 1);
  assert.equal(hidden.marker.scrollCalls[0].behavior, "smooth");
  assert.equal(hidden.marker.scrollCalls[0].block, "nearest");
});

test("Case 02 marker reveal is instant when reduced motion is requested", () => {
  const { marker } = runMarkerReveal({ markerTop: 920, reducedMotion: true });

  assert.equal(marker.scrollCalls.length, 1);
  assert.equal(marker.scrollCalls[0].behavior, "auto");
});

test("other cases retain the generic template", () => {
  for (const record of caseDetails.filter((item) => item.id !== "02")) {
    const output = renderCasePage(record);
    assert.match(output, /class="detail-hero"/);
    assert.doesNotMatch(output, /case02-showcase|data-case-marker|data-case-part/);
  }
});
