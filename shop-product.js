(() => {
  const configNode = document.querySelector("[data-product-config]");
  const productConfig = readProductConfig(configNode);
  if (!productConfig) return;

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
  const backToShop = document.querySelector("[data-product-back]");
  const langToggle = document.querySelector(".lang-toggle");
  const defaultVehicle = { ...productConfig.defaults.vehicle };
  const productState = {
    vehicle: { ...defaultVehicle },
    diameter: productConfig.defaults.diameter,
    width: productConfig.defaults.width,
    finish: productConfig.defaults.finish,
    quantity: productConfig.defaults.quantity,
    supported: false,
  };

  function readProductConfig(node) {
    try {
      const parsed = JSON.parse(node?.textContent || "null");
      return parsed
        && typeof parsed.id === "string"
        && Array.isArray(parsed.vehicles)
        && Array.isArray(parsed.fitments)
        && parsed.defaults
        && parsed.options
        ? parsed
        : null;
    } catch {
      return null;
    }
  }

  function cleanQueryValue(value, maxLength) {
    return String(value || "")
      .replace(/[\u0000-\u001f\u007f]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  function cleanVehicle(values) {
    return {
      make: cleanQueryValue(values.make, 20).toUpperCase(),
      model: cleanQueryValue(values.model, 40),
      year: cleanQueryValue(values.year, 4),
      chassis: cleanQueryValue(values.chassis, 20),
    };
  }

  function normalizedVehicleValue(value) {
    return cleanQueryValue(value, 40).toUpperCase();
  }

  function findVehicleTuple(values) {
    const vehicle = cleanVehicle(values);
    return productConfig.vehicles.find((candidate) =>
      normalizedVehicleValue(candidate.make) === normalizedVehicleValue(vehicle.make)
      && normalizedVehicleValue(candidate.model) === normalizedVehicleValue(vehicle.model)
      && normalizedVehicleValue(candidate.year) === normalizedVehicleValue(vehicle.year)
      && normalizedVehicleValue(candidate.chassis) === normalizedVehicleValue(vehicle.chassis)
    ) || null;
  }

  function applyVehicleToControls(vehicle) {
    for (const [key, control] of Object.entries(vehicleControls)) {
      control.value = vehicle[key];
    }
  }

  function validateFitment(state) {
    const canonicalVehicle = findVehicleTuple(state.vehicle);
    if (!canonicalVehicle) return false;
    const fitment = productConfig.fitments.find((candidate) =>
      normalizedVehicleValue(candidate.make) === normalizedVehicleValue(canonicalVehicle.make)
      && normalizedVehicleValue(candidate.model) === normalizedVehicleValue(canonicalVehicle.model)
      && normalizedVehicleValue(candidate.year) === normalizedVehicleValue(canonicalVehicle.year)
      && normalizedVehicleValue(candidate.chassis) === normalizedVehicleValue(canonicalVehicle.chassis)
    );
    return Boolean(
      fitment?.combinations?.some((combination) =>
        combination.diameter === state.diameter
        && combination.width === state.width
      ),
    );
  }

  function syncBackToShop(state) {
    if (!backToShop) return;
    const source = new URLSearchParams(window.location.search);
    const categories = source
      .getAll("category")
      .flatMap((value) => value.split(","))
      .filter((value) => productConfig.categories.includes(value));
    const target = new URLSearchParams();
    if (categories.length > 0) target.set("category", [...new Set(categories)].join(","));
    for (const key of ["make", "model", "year", "chassis"]) {
      target.set(key, state.vehicle[key]);
    }
    backToShop.setAttribute("href", `../shop.html?${target.toString()}`);
  }

  function syncProductActions(state) {
    state.supported = validateFitment(state);
    const language = document.documentElement.lang.startsWith("zh") ? "zh" : "en";
    const fitmentCopy = state.supported
      ? productConfig.fitmentCopy.supported
      : productConfig.fitmentCopy.unsupported;

    fitmentMessage.dataset.en = fitmentCopy.en;
    fitmentMessage.dataset.zh = fitmentCopy.zh;
    fitmentMessage.textContent = fitmentCopy[language];
    addToBuild.setAttribute("aria-disabled", String(!state.supported));

    const plannerQuery = new URLSearchParams({
      product: productConfig.id,
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
      product: productConfig.id,
      message: `Product: ${productConfig.id}. Fitment check: ${state.diameter}, ${state.width}, ${state.finish}, quantity ${state.quantity}.`,
    });
    fitmentInquiry.setAttribute("href", `../contact.html?${contactQuery.toString()}`);
    syncBackToShop(state);
  }

  function selectedOption(key) {
    const selected = optionControls[key].find((control) => control.checked)?.value;
    const allowed = new Set(productConfig.options[key].map(({ id }) => id));
    return allowed.has(selected) ? selected : productConfig.defaults[key];
  }

  function syncStateFromControls() {
    const enteredVehicle = cleanVehicle(
      Object.fromEntries(
        Object.entries(vehicleControls).map(([key, control]) => [key, control.value]),
      ),
    );
    productState.vehicle = { ...(findVehicleTuple(enteredVehicle) || enteredVehicle) };
    productState.diameter = selectedOption("diameter");
    productState.width = selectedOption("width");
    productState.finish = selectedOption("finish");

    const quantity = Number.parseInt(quantityControl.value, 10);
    productState.quantity = Math.min(4, Math.max(1, Number.isNaN(quantity) ? 1 : quantity));
    quantityControl.value = String(productState.quantity);
    syncProductActions(productState);
  }

  function applyInitialVehicle() {
    const query = new URLSearchParams(window.location.search);
    const queryVehicle = cleanVehicle({
      make: query.get("make"),
      model: query.get("model"),
      year: query.get("year"),
      chassis: query.get("chassis"),
    });
    const complete = Object.values(queryVehicle).every(Boolean);
    const selectedVehicle = complete ? findVehicleTuple(queryVehicle) : null;
    productState.vehicle = { ...(selectedVehicle || defaultVehicle) };
    applyVehicleToControls(productState.vehicle);
  }

  applyInitialVehicle();

  vehicleControls.make.addEventListener("change", () => {
    const selectedVehicle =
      productConfig.vehicles.find(
        ({ make }) => make === cleanQueryValue(vehicleControls.make.value, 20).toUpperCase(),
      )
      || defaultVehicle;
    productState.vehicle = { ...selectedVehicle };
    applyVehicleToControls(productState.vehicle);
    syncStateFromControls();
  });
  [vehicleControls.model, vehicleControls.year, vehicleControls.chassis].forEach((control) => {
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
        const enteredVehicle = cleanVehicle({ make, model, year, chassis });
        productState.vehicle = { ...(findVehicleTuple(enteredVehicle) || enteredVehicle) };
        syncProductActions(productState);
      },
      syncProductActions,
      validateFitment,
    });
  }
})();
