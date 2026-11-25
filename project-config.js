/* Project planner configurator: workstream markers on the car and a live summary bar.
   The planner's own steps, validation and submit (project.js) stay in charge. */
(() => {
  const planner = document.querySelector("[data-project-planner]");
  if (!planner) return;

  const figure = planner.querySelector(".project-visual");
  const image = figure?.querySelector("img");
  const layer = planner.querySelector("[data-project-hotspots]");
  const hotspots = [...planner.querySelectorAll("[data-project-hotspot]")];
  const summary = planner.querySelector("[data-project-summary]");
  const checkboxes = [...planner.querySelectorAll('[data-planner-step="2"] input[type="checkbox"]')];
  const vehicleFields = ["make", "model", "chassis", "year"].map((key) => planner.querySelector(`[data-vehicle-${key}]`));
  const out = {
    vehicle: planner.querySelector("[data-summary-vehicle]"),
    goal: planner.querySelector("[data-summary-goal]"),
    directions: planner.querySelector("[data-summary-directions]"),
    count: planner.querySelector("[data-summary-count]"),
  };

  if (layer) layer.hidden = false;
  if (summary) summary.hidden = false;

  const boxFor = (key) => checkboxes.find((box) => box.value === key);
  const labelText = (input) => input?.closest("label")?.querySelector("span, strong")?.textContent.trim() || "";

  const place = () => {
    if (!figure || !image || !image.naturalWidth) return;
    const width = figure.clientWidth;
    const height = figure.clientHeight;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const renderedWidth = image.naturalWidth * scale;
    const renderedHeight = image.naturalHeight * scale;
    const [px = "50%", py = "50%"] = getComputedStyle(image).objectPosition.split(" ");
    const offsetX = (width - renderedWidth) * (parseFloat(px) / 100);
    const offsetY = (height - renderedHeight) * (parseFloat(py) / 100);
    hotspots.forEach((spot) => {
      const x = offsetX + renderedWidth * (Number(spot.dataset.x) / 100);
      const y = offsetY + renderedHeight * (Number(spot.dataset.y) / 100);
      spot.style.left = `${Math.min(width - 24, Math.max(24, x))}px`;
      spot.style.top = `${Math.min(height - 24, Math.max(24, y))}px`;
      spot.classList.toggle("is-flipped", x > width * 0.6);
    });
  };

  const render = () => {
    const vehicle = vehicleFields.map((field) => field?.value.trim()).filter(Boolean);
    if (out.vehicle) out.vehicle.textContent = vehicle.length ? [vehicle[3], vehicle[0], vehicle[1], vehicle[2]].filter(Boolean).join(" ") : "—";
    const goal = planner.querySelector('input[name="goal"]:checked');
    if (out.goal) out.goal.textContent = goal ? goal.closest("label")?.querySelector("strong")?.textContent.trim() || "" : "—";
    const chosen = checkboxes.filter((box) => box.checked);
    if (out.directions) out.directions.textContent = chosen.length ? chosen.map(labelText).join(" · ") : "—";
    if (out.count) out.count.textContent = String(chosen.length).padStart(2, "0");
    hotspots.forEach((spot) => {
      const on = Boolean(boxFor(spot.dataset.projectHotspot)?.checked);
      spot.classList.toggle("is-selected", on);
      spot.setAttribute("aria-pressed", String(on));
    });
  };

  hotspots.forEach((spot) => {
    spot.addEventListener("click", () => {
      const box = boxFor(spot.dataset.projectHotspot);
      if (!box) return;
      box.checked = !box.checked;
      box.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });

  planner.addEventListener("input", render);
  planner.addEventListener("change", render);
  document.querySelector(".lang-toggle")?.addEventListener("click", () => window.setTimeout(render, 0));
  if (image && !image.complete) image.addEventListener("load", place, { once: true });
  window.addEventListener("resize", place, { passive: true });
  window.setTimeout(() => { place(); render(); }, 0);
  place();
  render();
})();
