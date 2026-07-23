import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

const html = readFileSync(new URL("./pages/contact.html", import.meta.url), "utf8");
const sharedJs = readFileSync(new URL("./content-pages.js", import.meta.url), "utf8");
const formJsUrl = new URL("./contact-form.js", import.meta.url);

test("contact form targets the same-site API and includes a honeypot", () => {
  assert.match(html, /action="\/api\/contact" method="post"/);
  assert.match(html, /name="company"[^>]*tabindex="-1"/);
  assert.match(html, /src="\.\.\/contact-form\.js\?v=contact-form-final-review-20260723"/);
});

test("contact fields mirror the API validation limits", () => {
  assert.match(html, /name="name"[\s\S]*?minlength="2"[\s\S]*?maxlength="100"/);
  assert.match(html, /name="email"[\s\S]*?minlength="3"[\s\S]*?maxlength="254"/);
  assert.match(html, /name="vehicle"[\s\S]*?minlength="2"[\s\S]*?maxlength="120"/);
  assert.match(html, /name="message"[\s\S]*?minlength="10"[\s\S]*?maxlength="3000"/);
});

test("shared page controller no longer opens a mail client", () => {
  assert.doesNotMatch(sharedJs, /mailto:/);
  assert.doesNotMatch(sharedJs, /Opening your email application/);
});

test("contact controller file exists", () => {
  assert.doesNotThrow(() => readFileSync(formJsUrl, "utf8"));
});

class FakeNode {
  constructor() {
    this.attributes = new Map();
    this.dataset = {};
    this.disabled = false;
    this.textContent = "";
    this.listeners = new Map();
  }

  addEventListener(name, listener) {
    this.listeners.set(name, listener);
  }

  dispatch(name, event = {}) {
    return this.listeners.get(name)?.(event);
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }
}

function runController({ language = "en", fetchImpl }) {
  const source = readFileSync(formJsUrl, "utf8");
  const status = new FakeNode();
  const button = new FakeNode();
  const form = new FakeNode();
  form.action = "/api/contact";
  form.values = {
    name: "Jordan Lee",
    email: "jordan@example.com",
    vehicle: "2024 BMW G80 M3",
    service: "Custom Vehicle Builds",
    message: "Street setup with daily usability.",
    company: "",
  };
  form.querySelector = (selector) => selector === 'button[type="submit"]' ? button : null;
  form.reportValidity = () => true;
  form.resetCount = 0;
  form.reset = () => {
    form.resetCount += 1;
  };

  class FakeFormData {
    constructor() {}
    entries() {
      return Object.entries(form.values);
    }
  }

  const document = {
    body: { dataset: { lang: language } },
    querySelector(selector) {
      if (selector === "[data-contact-form]") return form;
      if (selector === "[data-contact-status]") return status;
      return null;
    },
  };

  vm.runInNewContext(source, {
    document,
    fetch: fetchImpl,
    FormData: FakeFormData,
    JSON,
    Object,
    Promise,
  });

  return { button, form, status };
}

test("contact controller posts JSON and resets after success", async () => {
  const requests = [];
  const harness = runController({
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return { ok: true };
    },
  });
  await harness.form.dispatch("submit", { preventDefault() {} });

  assert.equal(requests[0].url, "/api/contact");
  assert.equal(requests[0].options.method, "POST");
  assert.equal(JSON.parse(requests[0].options.body).email, "jordan@example.com");
  assert.equal(harness.form.resetCount, 1);
  assert.equal(harness.status.dataset.state, "success");
  assert.match(harness.status.textContent, /INQUIRY SENT/);
});

test("contact controller blocks repeats while pending", async () => {
  let resolveRequest;
  let requestCount = 0;
  const pending = new Promise((resolve) => {
    resolveRequest = resolve;
  });
  const harness = runController({
    fetchImpl: async () => {
      requestCount += 1;
      return pending;
    },
  });

  const first = harness.form.dispatch("submit", { preventDefault() {} });
  await Promise.resolve();
  assert.equal(harness.button.disabled, true);
  assert.equal(harness.form.attributes.get("aria-busy"), "true");
  await harness.form.dispatch("submit", { preventDefault() {} });
  assert.equal(requestCount, 1);

  resolveRequest({ ok: true });
  await first;
  assert.equal(harness.button.disabled, false);
  assert.equal(harness.form.attributes.has("aria-busy"), false);
});

test("contact controller preserves values and localizes provider errors", async () => {
  const harness = runController({
    language: "zh",
    fetchImpl: async () => ({ ok: false }),
  });
  await harness.form.dispatch("submit", { preventDefault() {} });

  assert.equal(harness.form.resetCount, 0);
  assert.equal(harness.status.dataset.state, "error");
  assert.match(harness.status.textContent, /暂时无法发送/);
});

test("contact controller preserves values and localizes validation failures", async () => {
  const harness = runController({
    language: "zh",
    fetchImpl: async () => ({ ok: false, status: 400 }),
  });
  await harness.form.dispatch("submit", { preventDefault() {} });

  assert.equal(harness.form.resetCount, 0);
  assert.equal(harness.status.dataset.state, "validation");
  assert.match(harness.status.textContent, /请检查填写内容/);
});

test("contact status follows the shared language toggle after a status is set", async () => {
  const sharedSource = readFileSync(new URL("./content-pages.js", import.meta.url), "utf8");
  const formSource = readFileSync(formJsUrl, "utf8");
  const status = new FakeNode();
  const button = new FakeNode();
  const form = new FakeNode();
  const langToggle = new FakeNode();
  form.action = "/api/contact";
  form.values = {
    name: "Jordan Lee",
    email: "jordan@example.com",
    vehicle: "2024 BMW G80 M3",
    service: "Custom Vehicle Builds",
    message: "Street setup with daily usability.",
    company: "",
  };
  form.querySelector = (selector) => selector === 'button[type="submit"]' ? button : null;
  form.reportValidity = () => true;
  form.reset = () => {};

  class FakeFormData {
    constructor() {}
    entries() {
      return Object.entries(form.values);
    }
  }

  const translatedNodes = [status];
  const nodesBySelector = new Map([
    [".lang-toggle", [langToggle]],
    ["[data-lang-option]", []],
    ["[data-zh][data-en]", translatedNodes],
    ["[data-zh-placeholder][data-en-placeholder]", []],
    ["[data-zh-aria-label][data-en-aria-label]", []],
    ["[data-zh-alt][data-en-alt]", []],
    [".nav a", []],
    ["[data-service-row]", []],
    ["[data-contact-form]", [form]],
    ["[data-contact-status]", [status]],
  ]);
  const document = {
    body: { dataset: { lang: "en" } },
    documentElement: { lang: "en" },
    querySelector: (selector) => nodesBySelector.get(selector)?.[0] ?? null,
    querySelectorAll: (selector) => nodesBySelector.get(selector) ?? [],
  };

  vm.runInNewContext(sharedSource, {
    document,
    sessionStorage: { getItem: () => null, setItem: () => {} },
    window: { location: { pathname: "/pages/contact.html" } },
  });
  vm.runInNewContext(formSource, {
    document,
    fetch: async () => new Promise(() => {}),
    FormData: FakeFormData,
    JSON,
    Object,
    Promise,
  });

  form.dispatch("submit", { preventDefault() {} });
  await Promise.resolve();
  assert.equal(status.textContent, "SENDING YOUR INQUIRY…");

  langToggle.dispatch("click");

  assert.equal(status.textContent, "正在发送项目需求…");
});
