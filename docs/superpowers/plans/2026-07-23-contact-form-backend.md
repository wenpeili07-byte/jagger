# Contact Form Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Contact page's `mailto:` behavior with a validated Vercel Function that sends inquiries to `lonmadynamic@gmail.com` through Resend.

**Architecture:** A dependency-free Vercel Function validates and formats submissions, then calls the Resend HTTP API. A Contact-only browser controller posts the existing form as JSON and owns pending, success, and failure feedback. Shared site assets advance to one cache key so production browsers cannot retain the old submission behavior.

**Tech Stack:** Static HTML/CSS/JavaScript, Vercel Node.js Function, Resend HTTP API, Node's built-in test runner.

## Global Constraints

- Preserve the existing Contact page layout, typography, navigation, and bilingual content.
- Store `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL` only in Vercel environment variables.
- Use `CONTACT_TO_EMAIL=lonmadynamic@gmail.com`.
- Do not add a database, CRM, uploads, customer confirmation email, or persistent rate limiter.
- Write every behavioral test before its production implementation and observe the expected failure.
- Keep English as the default language and map all new live feedback to English and Chinese.
- Advance every shared public asset reference to `contact-form-20260723`.

---

## File Structure

- Create `api/contact.js`: validation, safe email rendering, Resend request, and Vercel request handler.
- Create `contact-api.test.mjs`: endpoint validation, rendering, provider, and configuration tests.
- Create `contact-form.js`: Contact-only browser submission controller.
- Create `contact-form.test.mjs`: browser controller state and request tests.
- Modify `pages/contact.html`: endpoint metadata, honeypot, and Contact controller.
- Modify `content-pages.js`: remove the old `mailto:` listener.
- Modify `content-pages.css`: hidden honeypot and submit-state styling.
- Modify `README.md`: production environment variable and delivery-check instructions.
- Modify `scripts/render-detail-pages.mjs`, `scripts/render-shop-page.mjs`, generated HTML, and cache tests: move all shared references to `contact-form-20260723`.

---

### Task 1: Validated Email Delivery Function

**Files:**
- Create: `contact-api.test.mjs`
- Create: `api/contact.js`

**Interfaces:**
- Consumes: `POST` request body with `name`, `email`, `vehicle`, `service`, `message`, and optional `company`.
- Produces: `createContactHandler({ fetchImpl, env })`, `validateContactPayload(input)`, `buildContactEmail(payload)`, and the default Vercel handler.

- [ ] **Step 1: Write failing validation and rendering tests**

Create `contact-api.test.mjs` with direct tests for the exported helpers:

```js
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const {
  ALLOWED_SERVICES,
  buildContactEmail,
  createContactHandler,
  validateContactPayload,
} = require("./api/contact.js");

const validPayload = {
  name: "Jordan Lee",
  email: "jordan@example.com",
  vehicle: "2024 BMW G80 M3",
  service: "Custom Vehicle Builds",
  message: "I want to improve the street setup without losing daily usability.",
  company: "",
};

test("contact validation accepts the six published services", () => {
  assert.equal(ALLOWED_SERVICES.size, 6);
  for (const service of ALLOWED_SERVICES) {
    assert.equal(validateContactPayload({ ...validPayload, service }).ok, true);
  }
});

test("contact validation rejects malformed and oversized fields", () => {
  assert.equal(validateContactPayload({ ...validPayload, email: "bad" }).ok, false);
  assert.equal(validateContactPayload({ ...validPayload, message: "short" }).ok, false);
  assert.equal(validateContactPayload({ ...validPayload, vehicle: "x".repeat(121) }).ok, false);
});

test("contact email escapes customer HTML and provides plain text", () => {
  const email = buildContactEmail({
    ...validPayload,
    name: "<script>alert(1)</script>",
  });
  assert.doesNotMatch(email.html, /<script>/);
  assert.match(email.html, /&lt;script&gt;/);
  assert.match(email.text, /Jordan|script/);
  assert.equal(email.replyTo, validPayload.email);
});
```

- [ ] **Step 2: Run the helper tests and verify RED**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test contact-api.test.mjs
```

Expected: FAIL because `api/contact.js` does not exist.

- [ ] **Step 3: Add failing handler tests**

Append tests using a small fake response:

```js
function createResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
}

test("handler sends valid inquiries to configured Resend recipient", async () => {
  const requests = [];
  const handler = createContactHandler({
    env: {
      RESEND_API_KEY: "re_test",
      CONTACT_TO_EMAIL: "lonmadynamic@gmail.com",
      CONTACT_FROM_EMAIL: "LONMA DYNAMIC <onboarding@resend.dev>",
    },
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return { ok: true, json: async () => ({ id: "email_123" }) };
    },
  });
  const response = createResponse();

  await handler({ method: "POST", body: validPayload }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(requests[0].url, "https://api.resend.com/emails");
  const body = JSON.parse(requests[0].options.body);
  assert.deepEqual(body.to, ["lonmadynamic@gmail.com"]);
  assert.equal(body.reply_to, validPayload.email);
});

test("handler rejects invalid input without calling Resend", async () => {
  let called = false;
  const handler = createContactHandler({
    env: {
      RESEND_API_KEY: "re_test",
      CONTACT_TO_EMAIL: "lonmadynamic@gmail.com",
      CONTACT_FROM_EMAIL: "LONMA DYNAMIC <onboarding@resend.dev>",
    },
    fetchImpl: async () => {
      called = true;
    },
  });
  const response = createResponse();

  await handler({ method: "POST", body: { ...validPayload, email: "bad" } }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(called, false);
});
```

Append the remaining response cases:

```js
const configuredEnv = {
  RESEND_API_KEY: "re_test",
  CONTACT_TO_EMAIL: "lonmadynamic@gmail.com",
  CONTACT_FROM_EMAIL: "LONMA DYNAMIC <onboarding@resend.dev>",
};

test("handler rejects unsupported methods", async () => {
  const response = createResponse();
  await createContactHandler({ env: configuredEnv })({ method: "GET" }, response);
  assert.equal(response.statusCode, 405);
});

test("handler rejects bodies larger than 16 KiB", async () => {
  const response = createResponse();
  await createContactHandler({ env: configuredEnv })(
    { method: "POST", body: JSON.stringify({ ...validPayload, message: "x".repeat(17_000) }) },
    response,
  );
  assert.equal(response.statusCode, 413);
});

test("handler silently accepts the filled honeypot without sending", async () => {
  let called = false;
  const response = createResponse();
  await createContactHandler({
    env: configuredEnv,
    fetchImpl: async () => {
      called = true;
    },
  })({ method: "POST", body: { ...validPayload, company: "Spam LLC" } }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(called, false);
});

test("handler reports missing server configuration", async () => {
  const response = createResponse();
  await createContactHandler({ env: {} })({ method: "POST", body: validPayload }, response);
  assert.equal(response.statusCode, 500);
});

test("handler reports a Resend provider failure", async () => {
  const response = createResponse();
  await createContactHandler({
    env: configuredEnv,
    fetchImpl: async () => ({ ok: false }),
  })({ method: "POST", body: validPayload }, response);
  assert.equal(response.statusCode, 502);
});
```

- [ ] **Step 4: Implement the minimal dependency-free Function**

Create `api/contact.js`:

```js
const ALLOWED_SERVICES = new Set([
  "Custom Vehicle Builds",
  "Performance Parts",
  "Automotive Photography",
  "ECU Calibration",
  "Chassis Setup",
  "Intake & Exhaust",
]);

const LIMITS = {
  name: [2, 100],
  email: [3, 254],
  vehicle: [2, 120],
  message: [10, 3000],
};

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function validateContactPayload(input = {}) {
  const payload = {
    name: clean(input.name),
    email: clean(input.email).toLowerCase(),
    vehicle: clean(input.vehicle),
    service: clean(input.service),
    message: clean(input.message),
    company: clean(input.company),
  };
  const validLength = (key) =>
    payload[key].length >= LIMITS[key][0] && payload[key].length <= LIMITS[key][1];
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email);
  const ok =
    validLength("name") &&
    validLength("email") &&
    validLength("vehicle") &&
    validLength("message") &&
    emailOk &&
    ALLOWED_SERVICES.has(payload.service);
  return { ok, payload };
}

function buildContactEmail(payload) {
  const subject = `[LONMA DYNAMIC] ${payload.service} · ${payload.vehicle}`;
  const rows = [
    ["Name", payload.name],
    ["Email", payload.email],
    ["Vehicle", payload.vehicle],
    ["Service", payload.service],
  ];
  const text = `${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\n${payload.message}`;
  const html = `${rows
    .map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`)
    .join("")}<p>${escapeHtml(payload.message).replaceAll("\n", "<br>")}</p>`;
  return { subject, text, html, replyTo: payload.email };
}

function createContactHandler({
  fetchImpl = globalThis.fetch,
  env = process.env,
} = {}) {
  return async function contactHandler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, code: "method_not_allowed" });
    }

    const rawBody = req.body ?? {};
    const bodySize = Buffer.byteLength(
      typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody),
      "utf8",
    );
    if (bodySize > 16_384) {
      return res.status(413).json({ ok: false, code: "payload_too_large" });
    }

    let body;
    try {
      body = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
    } catch {
      return res.status(400).json({ ok: false, code: "invalid_json" });
    }

    const { ok, payload } = validateContactPayload(body);
    if (payload.company) {
      return res.status(200).json({ ok: true });
    }
    if (!ok) {
      return res.status(400).json({ ok: false, code: "invalid_submission" });
    }

    const apiKey = env.RESEND_API_KEY;
    const to = env.CONTACT_TO_EMAIL;
    const from = env.CONTACT_FROM_EMAIL;
    if (!apiKey || !to || !from || typeof fetchImpl !== "function") {
      return res.status(500).json({ ok: false, code: "missing_configuration" });
    }

    const email = buildContactEmail(payload);
    let providerResponse;
    try {
      providerResponse = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: email.replyTo,
          subject: email.subject,
          text: email.text,
          html: email.html,
        }),
      });
    } catch {
      return res.status(502).json({ ok: false, code: "provider_unavailable" });
    }

    if (!providerResponse.ok) {
      return res.status(502).json({ ok: false, code: "provider_rejected" });
    }

    return res.status(200).json({ ok: true });
  };
}

const handler = createContactHandler();
module.exports = handler;
module.exports.ALLOWED_SERVICES = ALLOWED_SERVICES;
module.exports.buildContactEmail = buildContactEmail;
module.exports.createContactHandler = createContactHandler;
module.exports.validateContactPayload = validateContactPayload;
```

- [ ] **Step 5: Run API tests and verify GREEN**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test contact-api.test.mjs
```

Expected: all Contact API tests PASS.

- [ ] **Step 6: Commit the Function**

```bash
git add api/contact.js contact-api.test.mjs
git commit -m "Add validated contact email function"
```

---

### Task 2: Contact Page Submission Controller

**Files:**
- Create: `contact-form.test.mjs`
- Create: `contact-form.js`
- Modify: `content-pages.js:10-11,104-125`
- Modify: `pages/contact.html:60-126,135`
- Modify: `content-pages.css:601-704`

**Interfaces:**
- Consumes: `[data-contact-form]`, `[data-contact-status]`, and `POST /api/contact`.
- Produces: accessible bilingual pending, success, and failure states without navigation.

- [ ] **Step 1: Write the failing markup and controller contract tests**

Create `contact-form.test.mjs`:

```js
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
  assert.match(html, /src="\.\.\/contact-form\.js\?v=contact-form-20260723"/);
});

test("shared page controller no longer opens a mail client", () => {
  assert.doesNotMatch(sharedJs, /mailto:/);
  assert.doesNotMatch(sharedJs, /Opening your email application/);
});

test("contact controller file exists", () => {
  assert.doesNotThrow(() => readFileSync(formJsUrl, "utf8"));
});
```

Append this executable VM harness and state coverage:

```js
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
```

- [ ] **Step 2: Run the controller test and verify RED**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test contact-form.test.mjs
```

Expected: FAIL because `contact-form.js` and the new form contract do not exist.

- [ ] **Step 3: Update Contact markup and styling**

Change the form opening tag to:

```html
<form class="contact-form" action="/api/contact" method="post" data-contact-form>
```

Add the honeypot immediately inside the form:

```html
<label class="contact-honeypot" aria-hidden="true">
  <span>Company</span>
  <input type="text" name="company" tabindex="-1" autocomplete="off" />
</label>
```

Load the Contact-only controller after `content-pages.js`:

```html
<script src="../contact-form.js?v=contact-form-20260723"></script>
```

Add scoped CSS:

```css
.contact-honeypot {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.contact-form[aria-busy="true"] .contact-submit-row button,
.contact-submit-row button:disabled {
  cursor: wait;
  opacity: 0.58;
}

.contact-submit-row p[data-state="success"] {
  color: var(--text);
}

.contact-submit-row p[data-state="error"] {
  color: #d8a7a2;
}
```

Remove the complete Contact submit block from `content-pages.js`.

- [ ] **Step 4: Implement the Contact controller**

Create `contact-form.js` as this IIFE:

```js
(function initializeContactForm() {
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-contact-status]");
  if (!form || !status) return;

  const button = form.querySelector('button[type="submit"]');
  const messages = {
    pending: { en: "SENDING YOUR INQUIRY…", zh: "正在发送项目需求…" },
    success: { en: "INQUIRY SENT. WE WILL REPLY BY EMAIL.", zh: "项目需求已发送，我们会通过邮件回复。" },
    error: {
      en: "UNABLE TO SEND. PLEASE CHECK YOUR CONNECTION AND TRY AGAIN.",
      zh: "暂时无法发送，请检查网络后重试。",
    },
  };
  let submitting = false;

  function setStatus(state) {
    const language = document.body.dataset.lang === "zh" ? "zh" : "en";
    status.dataset.state = state;
    status.textContent = messages[state][language];
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;

    submitting = true;
    form.setAttribute("aria-busy", "true");
    button.disabled = true;
    setStatus("pending");

    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("contact_request_failed");

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      submitting = false;
      form.removeAttribute("aria-busy");
      button.disabled = false;
    }
  });
})();
```

- [ ] **Step 5: Run controller tests and verify GREEN**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test contact-form.test.mjs content-pages.test.mjs
```

Expected: all tests PASS after replacing the two old `mailto:` assertions.

- [ ] **Step 6: Commit the browser workflow**

```bash
git add contact-form.js contact-form.test.mjs content-pages.js content-pages.css pages/contact.html content-pages.test.mjs
git commit -m "Submit contact inquiries through site API"
```

---

### Task 3: Cache Closure And Deployment Documentation

**Files:**
- Modify: `shared-cache.test.mjs`
- Modify: `english-copy.test.mjs`
- Modify: `header-layout.test.mjs`
- Modify: `cases-page.test.mjs`
- Modify: `scripts/render-detail-pages.mjs`
- Modify: `scripts/render-shop-page.mjs`
- Modify: `index.html`
- Modify: `pages/*.html`
- Regenerate: `pages/cases/*.html`, `pages/services/*.html`, `pages/shop.html`
- Modify: `README.md`

**Interfaces:**
- Consumes: shared version `contact-form-20260723`.
- Produces: one cache version across all public and generated pages plus exact Vercel configuration instructions.

- [ ] **Step 1: Write the failing cache-version expectation**

Change every test constant that currently equals `shop-case02-20260722-2` to:

```js
const sharedAssetVersion = "contact-form-20260723";
```

Update known stale-key checks to include `shop-case02-20260722-2`.

- [ ] **Step 2: Run cache tests and verify RED**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test shared-cache.test.mjs english-copy.test.mjs header-layout.test.mjs cases-page.test.mjs
```

Expected: FAIL because public pages and renderers still use the previous key.

- [ ] **Step 3: Advance source templates and regenerate**

Replace the shared stylesheet, homepage script, and content controller cache key
with `contact-form-20260723` in hand-authored pages and render scripts.

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/render-detail-pages.mjs
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/render-shop-page.mjs
```

Confirm the Contact-only `contact-form.js` script remains only on
`pages/contact.html`.

- [ ] **Step 4: Document environment setup and delivery verification**

Add to `README.md`:

```markdown
## Contact email delivery

The production Contact form uses `api/contact.js` and Resend.

Required Vercel environment variables:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL=lonmadynamic@gmail.com`
- `CONTACT_FROM_EMAIL=LONMA DYNAMIC <onboarding@resend.dev>`

After changing environment variables, redeploy Production. Submit one inquiry
from `/pages/contact`, confirm the inline success message, verify receipt at
`lonmadynamic@gmail.com`, and reply to confirm the customer's address is used.
Replace the testing sender after a LONMA-owned domain is verified in Resend.
```

- [ ] **Step 5: Run all tests**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test *.test.mjs
```

Expected: all tests PASS with zero failures.

- [ ] **Step 6: Run static checks**

Run:

```bash
git diff --check
rg -n "mailto:|Opening your email application" content-pages.js contact-form.js pages/contact.html
rg -n "shop-case02-20260722-2" --glob "*.html" --glob "*.js" --glob "*.mjs" .
```

Expected: `git diff --check` is clean and both searches return no stale runtime
behavior or stale public cache keys.

- [ ] **Step 7: Commit cache and deployment closure**

```bash
git add README.md index.html pages scripts *.test.mjs
git commit -m "Close contact form deployment configuration"
```

---

### Task 4: Browser And Production Verification

**Files:**
- Verify only; no planned production edits.

**Interfaces:**
- Consumes: locally served site and configured production deployment.
- Produces: desktop/mobile evidence plus a real email delivery result.

- [ ] **Step 1: Start the local static preview**

Run:

```bash
python3 -m http.server 4202
```

Expected: the site is available locally. The static preview can verify form
layout and failure feedback, but cannot execute the Vercel Function.

- [ ] **Step 2: Verify desktop and mobile Contact states**

At `1440 × 900` and `390 × 844`:

- confirm no horizontal overflow;
- confirm the honeypot is not visible or focusable;
- confirm the pending state disables the button without resizing the form;
- confirm failure feedback remains readable and preserves every field;
- confirm English and Chinese feedback switch correctly;
- confirm keyboard focus remains visible.

- [ ] **Step 3: Configure Vercel and deploy**

Create a Resend integration/API key, then set the three environment variables
for Production. Deploy the exact tested commit.

- [ ] **Step 4: Perform one real delivery test**

Submit a test inquiry on the production Contact page and verify:

- the page shows the success message;
- `lonmadynamic@gmail.com` receives the formatted message;
- replying targets the submitted customer email;
- no secret or recipient configuration appears in browser source or network
  responses.

- [ ] **Step 5: Final verification commit only if browser fixes were required**

If no fixes were required, do not create an empty commit. If a verified defect
required a correction, rerun the full suite and commit only that focused fix.
