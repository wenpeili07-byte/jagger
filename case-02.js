(() => {
  const markers = [...document.querySelectorAll("[data-case-marker]")];
  const parts = [...document.querySelectorAll("[data-case-part]")];

  function setActivePart(id) {
    [...markers, ...parts].forEach((node) => {
      const active = (node.dataset.caseMarker || node.dataset.casePart) === id;
      node.toggleAttribute("data-active", active);

      if (node.matches("button")) {
        node.setAttribute("aria-pressed", String(active));
      }
    });
  }

  [...markers, ...parts].forEach((node) => {
    const id = node.dataset.caseMarker || node.dataset.casePart;
    node.addEventListener("pointerenter", () => setActivePart(id));
    node.addEventListener("focus", () => setActivePart(id));
    node.addEventListener("click", () => setActivePart(id));
  });

  setActivePart("01");
})();
