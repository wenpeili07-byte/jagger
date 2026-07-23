const { createHash } = require("node:crypto");

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

function getContentLength(headers) {
  if (!headers) return null;

  const value = typeof headers.get === "function"
    ? headers.get("content-length")
    : headers["content-length"] ?? headers["Content-Length"];
  if (value == null || (typeof value === "string" && value.trim() === "")) {
    return null;
  }
  const contentLength = Number(value);
  return Number.isFinite(contentLength) && contentLength >= 0 ? contentLength : null;
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

function createIdempotencyKey(payload) {
  const digest = createHash("sha256")
    .update(JSON.stringify([
      payload.name,
      payload.email,
      payload.vehicle,
      payload.service,
      payload.message,
    ]))
    .digest("hex");
  return `contact/${digest}`;
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
    const contentLength = getContentLength(req.headers);
    const bodySize = contentLength ?? Buffer.byteLength(
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

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ ok: false, code: "invalid_submission" });
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
          "Idempotency-Key": createIdempotencyKey(payload),
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
