/* Keep product details concise on phones while retaining the desktop disclosures. */
(() => {
  const items = [...document.querySelectorAll("[data-product-disclosure]")];
  if (!items.length) return;

  const phone = window.matchMedia("(max-width: 767px)");
  const setExpanded = (item, expanded) => {
    const button = item.querySelector(".product-info-toggle");
    const panel = item.querySelector(".product-info-panel");
    button.setAttribute("aria-expanded", String(expanded));
    panel.hidden = !expanded;
    item.classList.toggle("is-open", expanded);
  };

  items.forEach((item) => {
    item.querySelector(".product-info-toggle").addEventListener("click", () => {
      const expanded = item.querySelector(".product-info-toggle").getAttribute("aria-expanded") === "true";
      setExpanded(item, !expanded);
    });
  });

  const applyViewportDefaults = () => {
    items.forEach((item) => setExpanded(item, !phone.matches && item.dataset.desktopOpen === "true"));
  };
  phone.addEventListener("change", applyViewportDefaults);
  applyViewportDefaults();
})();
