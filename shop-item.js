/* Detail pages for catalogue items without configurable data:
   gallery, request summary, and planner / inquiry links that carry the vehicle. */
(() => {
  const configNode = document.querySelector("[data-item-config]");
  let config = null;
  try {
    config = JSON.parse(configNode?.textContent || "null");
  } catch {
    config = null;
  }
  if (!config || typeof config.id !== "string") return;

  const fields = {
    make: document.querySelector("[data-item-make]"),
    model: document.querySelector("[data-item-model]"),
    year: document.querySelector("[data-item-year]"),
    chassis: document.querySelector("[data-item-chassis]"),
  };
  const summary = document.querySelector("[data-item-summary]");
  const build = document.querySelector("[data-item-build]");
  const inquiry = document.querySelector("[data-item-inquiry]");
  const back = document.querySelector("[data-product-back]");
  const clean = (value, max) => String(value || "").replace(/[^\p{L}\p{N} .\-/]/gu, "").trim().slice(0, max);
  const language = () => (document.documentElement.lang.startsWith("zh") ? "zh" : "en");

  const query = new URLSearchParams(window.location.search);
  for (const [key, max] of [["make", 20], ["model", 40], ["year", 4], ["chassis", 20]]) {
    const value = clean(query.get(key), max);
    if (!value || !fields[key]) continue;
    if (fields[key].tagName === "SELECT") {
      if ([...fields[key].options].some((option) => option.value === value)) fields[key].value = value;
    } else {
      fields[key].value = value;
    }
  }

  const state = () => {
    const vehicle = {
      make: clean(fields.make?.value, 20),
      model: clean(fields.model?.value, 40),
      year: clean(fields.year?.value, 4),
      chassis: clean(fields.chassis?.value, 20),
    };
    const use = document.querySelector('[data-item-use] input:checked');
    const useLabel = use?.closest("label")?.querySelector("span")?.textContent.trim() || "";
    return { vehicle, use: use?.value || "", useLabel };
  };

  const render = () => {
    const { vehicle, use, useLabel } = state();
    const vehicleLine = [vehicle.year, vehicle.make, vehicle.model, vehicle.chassis].filter(Boolean).join(" ");
    if (summary) summary.textContent = [vehicleLine, useLabel].filter(Boolean).join("  ·  ");

    if (build) {
      build.href = `../project.html?${new URLSearchParams({ product: config.id, vehicle: vehicleLine, direction: "parts", goal: use })}`;
    }
    if (inquiry) {
      const subject = config.inquirySubject?.[language()] || config.id;
      inquiry.href = `../contact.html?${new URLSearchParams({
        vehicle: vehicleLine,
        service: "Performance Parts",
        product: config.id,
        subject,
        message: `Product: ${config.id}. Intended use: ${use}. Please confirm fitment for my vehicle.`,
      })}`;
    }
    if (back) {
      const target = new URLSearchParams();
      const categories = query.getAll("category").flatMap((value) => value.split(",")).filter((value) => config.categories.includes(value));
      if (categories.length) target.set("category", [...new Set(categories)].join(","));
      for (const key of ["make", "model", "year", "chassis"]) if (vehicle[key]) target.set(key, vehicle[key]);
      back.setAttribute("href", `../shop.html?${target}`);
    }
  };

  document.querySelectorAll("[data-item-make], [data-item-model], [data-item-year], [data-item-chassis], [data-item-use] input").forEach((control) => {
    control.addEventListener("input", render);
    control.addEventListener("change", render);
  });
  document.querySelector(".lang-toggle")?.addEventListener("click", () => window.setTimeout(render, 0));
  render();
})();

// Gallery: cross-fade + settle zoom between views (arrows, thumbnails, keys, swipe).
(() => {
  const gallery = document.querySelector("[data-gallery]");
  if (!gallery) return;

  const views = [...gallery.querySelectorAll("[data-gallery-view]")];
  const thumbs = [...document.querySelectorAll("[data-gallery-thumb]")];
  const indexNode = document.querySelector("[data-gallery-index]");
  const labelNode = document.querySelector("[data-gallery-label]");
  let current = 0;
  let touchX = null;

  const language = () => (document.documentElement.lang.startsWith("zh") ? "zh" : "en");
  const updateLabel = () => {
    const view = views[current];
    if (labelNode && view) labelNode.textContent = language() === "zh" ? view.dataset.labelZh : view.dataset.labelEn;
  };

  const show = (next, direction = next > current ? 1 : -1) => {
    const target = (next + views.length) % views.length;
    if (target === current) return;
    const previous = views[current];
    const incoming = views[target];
    gallery.style.setProperty("--view-direction", String(direction));
    previous.classList.remove("is-active", "is-entering");
    previous.classList.add("is-leaving");
    previous.setAttribute("aria-hidden", "true");
    window.setTimeout(() => previous.classList.remove("is-leaving"), 900);
    incoming.classList.remove("is-leaving");
    incoming.classList.add("is-active", "is-entering");
    incoming.removeAttribute("aria-hidden");
    window.setTimeout(() => incoming.classList.remove("is-entering"), 1100);
    current = target;
    if (indexNode) indexNode.textContent = String(current + 1).padStart(2, "0");
    updateLabel();
    thumbs.forEach((thumb, index) => {
      if (index === current) thumb.setAttribute("aria-current", "true");
      else thumb.removeAttribute("aria-current");
    });
  };

  document.querySelectorAll("[data-gallery-step]").forEach((button) => {
    button.addEventListener("click", () => {
      const step = Number(button.dataset.galleryStep);
      show(current + step, step);
    });
  });
  thumbs.forEach((thumb) => thumb.addEventListener("click", () => show(Number(thumb.dataset.galleryThumb))));
  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") show(current + 1, 1);
    else if (event.key === "ArrowLeft") show(current - 1, -1);
  });
  gallery.addEventListener("touchstart", (event) => { touchX = event.touches[0].clientX; }, { passive: true });
  gallery.addEventListener("touchend", (event) => {
    if (touchX === null) return;
    const delta = event.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(delta) > 40) show(current + (delta < 0 ? 1 : -1), delta < 0 ? 1 : -1);
  }, { passive: true });
  document.querySelector(".lang-toggle")?.addEventListener("click", () => window.setTimeout(updateLabel, 0));
  updateLabel();
})();
