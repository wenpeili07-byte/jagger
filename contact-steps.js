/* Contact page: service chips mirror the service select, and a 4-step progress bar
   follows what has been filled in. The original form, validation and submit stay intact. */
(() => {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const select = form.querySelector('select[name="service"]');
  const chips = form.querySelector("[data-contact-chips]");
  const steps = [...document.querySelectorAll("[data-contact-progress]")];
  const groups = [...form.querySelectorAll("[data-contact-step]")];
  const field = (name) => form.elements.namedItem(name);

  document.documentElement.classList.add("contact-steps-ready");

  if (chips && select) {
    chips.hidden = false;
    const buttons = [...chips.querySelectorAll("[data-service-value]")];
    const syncChips = () => {
      buttons.forEach((button) => {
        const on = button.dataset.serviceValue === select.value;
        button.setAttribute("aria-pressed", String(on));
        button.classList.toggle("is-selected", on);
      });
    };
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        select.value = select.value === button.dataset.serviceValue ? "" : button.dataset.serviceValue;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
    select.addEventListener("change", syncChips);
    form.addEventListener("reset", () => window.setTimeout(syncChips, 0));
    syncChips();
    window.setTimeout(syncChips, 0);
  }

  const valid = (name) => {
    const input = field(name);
    return Boolean(input && input.value.trim() && input.checkValidity());
  };
  const done = () => [
    valid("vehicle"),
    valid("service"),
    valid("message"),
    valid("name") && valid("email"),
  ];

  const update = () => {
    const state = done();
    const current = state.indexOf(false);
    steps.forEach((step, index) => {
      step.classList.toggle("is-done", state[index]);
      step.classList.toggle("is-current", index === current);
    });
    groups.forEach((group, index) => {
      group.classList.toggle("is-done", state[index]);
      group.classList.toggle("is-current", index === current);
      group.classList.toggle("is-upcoming", current !== -1 && index > current && !state[index]);
    });
    const count = state.filter(Boolean).length;
    form.style.setProperty("--contact-progress", String(count / state.length));
    form.dataset.contactComplete = String(count);
  };

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("reset", () => window.setTimeout(update, 0));
  window.setTimeout(update, 0);
  update();
})();
