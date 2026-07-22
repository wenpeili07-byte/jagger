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

  function revealMarker(id) {
    const marker = markers.find((node) => node.dataset.caseMarker === id);
    if (!marker) return;

    const bounds = marker.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const visible = bounds.top >= 0 && bounds.bottom <= viewportHeight;
    if (visible) return;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    marker.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }

  [...markers, ...parts].forEach((node) => {
    const id = node.dataset.caseMarker || node.dataset.casePart;
    node.addEventListener("pointerenter", () => setActivePart(id));
    node.addEventListener("focus", () => {
      setActivePart(id);
      if (node.dataset.casePart) revealMarker(id);
    });
    node.addEventListener("click", () => {
      setActivePart(id);
      if (node.dataset.casePart) revealMarker(id);
    });
  });

  setActivePart("01");
})();
