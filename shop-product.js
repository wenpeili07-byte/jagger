(() => {
  const productState = {
    vehicle: { make: "BMW", model: "G80 M3", year: "2024", chassis: "G8X" },
    diameter: "19 inch",
    width: "9.5J / 10.5J",
    finish: "Satin Black",
    quantity: 4,
    supported: true,
  };

  const vehicleControls = {
    make: document.querySelector("[data-fitment-make]"),
    model: document.querySelector("[data-fitment-model]"),
    year: document.querySelector("[data-fitment-year]"),
    chassis: document.querySelector("[data-fitment-chassis]"),
  };
  const optionControls = {
    diameter: [...document.querySelectorAll('[data-option-group="diameter"] input')],
    width: [...document.querySelectorAll('[data-option-group="width"] input')],
    finish: [...document.querySelectorAll('[data-option-group="finish"] input')],
  };
  const quantityControl = document.querySelector("[data-product-quantity]");
  const fitmentMessage = document.querySelector("[data-fitment-message]");
  const addToBuild = document.querySelector("[data-add-to-build]");
  const fitmentInquiry = document.querySelector("[data-fitment-inquiry]");
  const langToggle = document.querySelector(".lang-toggle");

  function cleanQueryValue(value, maxLength) {
    return String(value || "")
      .replace(/[\u0000-\u001f\u007f]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  function validateFitment(state) {
    const supportedModel = /^(G80 M3|G82 M4|G83 M4)$/i.test(state.vehicle.model.trim());
    const supportedYear = Number(state.vehicle.year) >= 2021 && Number(state.vehicle.year) <= 2026;
    const supportedSize =
      (state.diameter === "19 inch" && state.width === "9.5J / 10.5J") ||
      (state.diameter === "20 inch" && state.width === "10J / 11J");
    return state.vehicle.make === "BMW"
      && state.vehicle.chassis.toUpperCase() === "G8X"
      && supportedModel
      && supportedYear
      && supportedSize;
  }

  function syncProductActions(state) {
    state.supported = validateFitment(state);
    const language = document.documentElement.lang.startsWith("zh") ? "zh" : "en";
    const fitmentCopy = state.supported
      ? { en: "FITMENT MATCH · FINAL CLEARANCE CHECK REQUIRED", zh: "适配匹配 · 仍需最终空间确认" }
      : { en: "FITMENT CHECK REQUIRED", zh: "需要确认车型适配" };

    fitmentMessage.dataset.en = fitmentCopy.en;
    fitmentMessage.dataset.zh = fitmentCopy.zh;
    fitmentMessage.textContent = fitmentCopy[language];
    addToBuild.setAttribute("aria-disabled", String(!state.supported));

    const plannerQuery = new URLSearchParams({
      product: "forged-wheel",
      vehicle: [state.vehicle.year, state.vehicle.make, state.vehicle.model, state.vehicle.chassis].join(" "),
      direction: "parts",
      diameter: state.diameter,
      width: state.width,
      finish: state.finish,
      quantity: String(state.quantity),
    });

    if (state.supported) {
      addToBuild.removeAttribute("tabindex");
      addToBuild.setAttribute("href", `../project.html?${plannerQuery.toString()}`);
    } else {
      addToBuild.setAttribute("tabindex", "-1");
      addToBuild.removeAttribute("href");
    }

    const contactQuery = new URLSearchParams({
      vehicle: [state.vehicle.year, state.vehicle.make, state.vehicle.model, state.vehicle.chassis].join(" "),
      service: "Performance Parts",
      product: "forged-wheel",
      message: `Fitment check: ${state.diameter}, ${state.width}, ${state.finish}, quantity ${state.quantity}.`,
    });
    fitmentInquiry.setAttribute("href", `../contact.html?${contactQuery.toString()}`);
  }

  function syncStateFromControls() {
    productState.vehicle = {
      make: cleanQueryValue(vehicleControls.make.value, 20),
      model: cleanQueryValue(vehicleControls.model.value, 40),
      year: cleanQueryValue(vehicleControls.year.value, 4),
      chassis: cleanQueryValue(vehicleControls.chassis.value, 20),
    };

    for (const [key, controls] of Object.entries(optionControls)) {
      productState[key] = controls.find((control) => control.checked)?.value || productState[key];
    }

    const quantity = Number.parseInt(quantityControl.value, 10);
    productState.quantity = Math.min(4, Math.max(1, Number.isNaN(quantity) ? 1 : quantity));
    quantityControl.value = String(productState.quantity);
    syncProductActions(productState);
  }

  function applyInitialVehicle() {
    const query = new URLSearchParams(window.location.search);
    const limits = { make: 20, model: 40, year: 4, chassis: 20 };

    for (const [key, control] of Object.entries(vehicleControls)) {
      const value = cleanQueryValue(query.get(key), limits[key]);
      if (value) control.value = value;
    }
  }

  applyInitialVehicle();

  Object.values(vehicleControls).forEach((control) => {
    control.addEventListener("input", syncStateFromControls);
    control.addEventListener("change", syncStateFromControls);
  });
  Object.values(optionControls).flat().forEach((control) => {
    control.addEventListener("change", syncStateFromControls);
  });
  quantityControl.addEventListener("input", syncStateFromControls);
  quantityControl.addEventListener("change", syncStateFromControls);
  langToggle?.addEventListener("click", () => syncProductActions(productState));
  addToBuild.addEventListener("click", (event) => {
    if (!productState.supported) event.preventDefault();
  });

  syncStateFromControls();

  if (window.LonmaProductTest) {
    Object.assign(window.LonmaProductTest, {
      getState: () => productState,
      setVehicle(make, model, year, chassis) {
        productState.vehicle = { make, model, year, chassis };
        syncProductActions(productState);
      },
      syncProductActions,
      validateFitment,
    });
  }
})();
