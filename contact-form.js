(function initializeContactForm() {
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-contact-status]");
  if (!form || !status) return;

  const button = form.querySelector('button[type="submit"]');
  const prefillStatus = document.querySelector("[data-contact-prefill-status]");
  const knownServices = new Set([
    "Custom Vehicle Builds",
    "Performance Parts",
    "Automotive Photography",
    "ECU Calibration",
    "Chassis Setup",
    "Intake & Exhaust",
  ]);
  const messages = {
    pending: { en: "SENDING YOUR INQUIRY…", zh: "正在发送项目需求…" },
    success: { en: "INQUIRY SENT. WE WILL REPLY BY EMAIL.", zh: "项目需求已发送，我们会通过邮件回复。" },
    error: {
      en: "UNABLE TO SEND. PLEASE CHECK YOUR CONNECTION AND TRY AGAIN.",
      zh: "暂时无法发送，请检查网络后重试。",
    },
    validation: {
      en: "PLEASE CHECK THE FORM DETAILS AND TRY AGAIN.",
      zh: "请检查填写内容后重试。",
    },
  };
  let submitting = false;

  function cleanQueryValue(value, maxLength) {
    return String(value || "")
      .replace(/[\u0000-\u001f\u007f]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  function readContactPrefill(search) {
    const query = new URLSearchParams(search);
    const vehicle = cleanQueryValue(query.get("vehicle"), 120);
    const requestedService = cleanQueryValue(query.get("service"), 80);
    const product = cleanQueryValue(query.get("product"), 120);
    const subject = cleanQueryValue(query.get("subject"), 180);
    const directMessage = cleanQueryValue(query.get("message"), product ? 2850 : 3000);
    const baseMessage = directMessage || subject;
    const productMessage =
      product && !baseMessage.toLowerCase().includes(product.toLowerCase())
        ? `Product: ${product}.`
        : "";
    const message = cleanQueryValue(
      [baseMessage, productMessage].filter(Boolean).join(" "),
      3000,
    );

    return {
      vehicle,
      service: knownServices.has(requestedService) ? requestedService : "",
      message,
    };
  }

  function applyContactPrefill() {
    const values = readContactPrefill(window.location.search);
    const fields = {
      vehicle: form.elements.namedItem("vehicle"),
      service: form.elements.namedItem("service"),
      message: form.elements.namedItem("message"),
    };
    let applied = false;

    Object.entries(values).forEach(([name, value]) => {
      if (value && fields[name] && !fields[name].value) {
        fields[name].value = value;
        applied = true;
      }
    });

    if (prefillStatus) prefillStatus.hidden = !applied;
  }

  applyContactPrefill();

  function setStatus(state) {
    const language = document.body.dataset.lang === "zh" ? "zh" : "en";
    status.dataset.en = messages[state].en;
    status.dataset.zh = messages[state].zh;
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
      if (!response.ok) {
        throw new Error(response.status === 400 ? "invalid_submission" : "contact_request_failed");
      }

      form.reset();
      if (prefillStatus) prefillStatus.hidden = true;
      setStatus("success");
    } catch (error) {
      setStatus(error?.message === "invalid_submission" ? "validation" : "error");
    } finally {
      submitting = false;
      form.removeAttribute("aria-busy");
      button.disabled = false;
    }
  });
})();
