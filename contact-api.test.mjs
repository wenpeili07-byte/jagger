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
  assert.match(
    requests[0].options.headers["Idempotency-Key"],
    /^contact\/[a-f0-9]{64}$/,
  );
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

test("handler rejects a valid parsed body whose Content-Length exceeds 16 KiB before fetch", async () => {
  let called = false;
  const response = createResponse();
  await createContactHandler({
    env: configuredEnv,
    fetchImpl: async () => {
      called = true;
      return { ok: true };
    },
  })(
    {
      method: "POST",
      body: validPayload,
      headers: { "content-length": "50000" },
    },
    response,
  );

  assert.equal(response.statusCode, 413);
  assert.equal(response.payload.code, "payload_too_large");
  assert.equal(called, false);
});

test("handler reads Content-Length from a Headers-like request object", async () => {
  const response = createResponse();
  await createContactHandler({ env: configuredEnv })(
    {
      method: "POST",
      body: validPayload,
      headers: { get: (name) => (name === "content-length" ? "50000" : null) },
    },
    response,
  );

  assert.equal(response.statusCode, 413);
  assert.equal(response.payload.code, "payload_too_large");
});

test("handler falls back to body size when Headers-like Content-Length is absent", async () => {
  const response = createResponse();
  await createContactHandler({ env: configuredEnv })(
    {
      method: "POST",
      body: JSON.stringify({ ...validPayload, message: "x".repeat(17_000) }),
      headers: { get: () => null },
    },
    response,
  );

  assert.equal(response.statusCode, 413);
  assert.equal(response.payload.code, "payload_too_large");
});

test("handler returns invalid_submission for non-object JSON bodies", async () => {
  for (const body of ["null", "[]", '"plain value"']) {
    const response = createResponse();
    await assert.doesNotReject(async () => {
      await createContactHandler({ env: configuredEnv })({ method: "POST", body }, response);
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.payload.code, "invalid_submission");
  }
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
