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
