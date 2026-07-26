(() => {
  const serviceMap = {
    build: "Custom Vehicle Builds",
    parts: "Performance Parts",
    photo: "Automotive Photography",
    ecu: "ECU Calibration",
    chassis: "Chassis Setup",
    exhaust: "Intake & Exhaust",
  };
  const serviceLabels = {
    build: { en: serviceMap.build, zh: "汽车改装" },
    parts: { en: serviceMap.parts, zh: "汽车配件" },
    photo: { en: serviceMap.photo, zh: "汽车摄影" },
    ecu: { en: serviceMap.ecu, zh: "ECU 特调" },
    chassis: { en: serviceMap.chassis, zh: "底盘设定" },
    exhaust: { en: serviceMap.exhaust, zh: "进排气" },
  };
  const productOptionLabels = {
    diameter: { en: "Diameter", zh: "直径" },
    width: { en: "Width", zh: "宽度" },
    finish: { en: "Finish", zh: "颜色" },
    quantity: { en: "Quantity", zh: "数量" },
  };
  const goalLabels = {
    street: { en: "STREET", zh: "街道" },
    "road-track": { en: "ROAD & TRACK", zh: "道路与赛道" },
    show: { en: "SHOW", zh: "展示" },
  };
  const plannerState = {
    step: 0,
    vehicle: { make: "BMW", model: "G80 M3", chassis: "G8X", year: "2024" },
    goal: "street",
    directions: new Set(),
    product: null,
  };
  let productSelection = null;
  let activeErrorKey = "";

  function cleanSelection(value, maxLength) {
    return String(value || "")
      .replace(/[\u0000-\u001f\u007f]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  function readPlannerQuery(search) {
    const query = new URLSearchParams(search);
    const product = cleanSelection(query.get("product"), 120);
    const options = [
      ["diameter", cleanSelection(query.get("diameter"), 80)],
      ["width", cleanSelection(query.get("width"), 80)],
      ["finish", cleanSelection(query.get("finish"), 80)],
      ["quantity", cleanSelection(query.get("quantity"), 8)],
    ].filter(([, value]) => value);

    return {
      direction: query.get("direction") === "parts" ? "parts" : "",
      productSelection: product ? { name: product, options } : null,
      product: product
        ? [
            product,
            ...options.map(([key, value]) => `${productOptionLabels[key].en}: ${value}`),
          ].join(", ")
        : null,
      vehicle: readVehicleSelection(query.get("vehicle")),
    };
  }

  function readVehicleSelection(value) {
    const parts = cleanSelection(value, 120).split(" ").filter(Boolean);
    if (parts.length < 4) return null;

    const year = cleanSelection(parts.shift(), 4);
    const make = cleanSelection(parts.shift(), 20).toUpperCase();
    const chassis = cleanSelection(parts.pop(), 20);
    const model = cleanSelection(parts.join(" "), 40);
    const supportedMakes = new Set(["BMW", "AUDI", "MERCEDES-BENZ"]);

    if (!/^\d{4}$/.test(year) || !supportedMakes.has(make) || !model || !chassis) {
      return null;
    }

    return { make, model, chassis, year };
  }

  function buildContactUrl(state) {
    const selectedServices = [...state.directions].map((key) => serviceMap[key]).filter(Boolean);
    const query = new URLSearchParams({
      vehicle: [state.vehicle.year, state.vehicle.make, state.vehicle.model, state.vehicle.chassis].filter(Boolean).join(" "),
      service: selectedServices[0] || "Custom Vehicle Builds",
      message: [
        `Goal: ${goalLabels[state.goal].en}.`,
        `Directions: ${selectedServices.join(", ")}.`,
        state.product ? `Product selection: ${state.product}.` : "",
      ].filter(Boolean).join(" "),
    });
    return `./contact.html?${query.toString()}`;
  }

  const root = document.querySelector("[data-project-planner]");
  const stepNodes = [...document.querySelectorAll("[data-planner-step]")];
  const progressButtons = [...document.querySelectorAll("[data-progress-step]")];
  const goalControls = [...document.querySelectorAll('input[name="goal"]')];
  const directionControls = [...document.querySelectorAll(".project-direction-grid input")];
  const vehicleControls = {
    make: document.querySelector("[data-vehicle-make]"),
    model: document.querySelector("[data-vehicle-model]"),
    chassis: document.querySelector("[data-vehicle-chassis]"),
    year: document.querySelector("[data-vehicle-year]"),
  };
  const backButton = document.querySelector("[data-planner-back]");
  const nextButton = document.querySelector("[data-planner-next]");
  const submitLink = document.querySelector("[data-planner-submit]");
  const errorNode = document.querySelector("[data-project-error]");
  const reviewNodes = {
    vehicle: document.querySelector("[data-review-vehicle]"),
    goal: document.querySelector("[data-review-goal]"),
    directions: document.querySelector("[data-review-directions]"),
    product: document.querySelector("[data-review-product]"),
    productRow: document.querySelector("[data-review-product-row]"),
  };
  const langToggle = document.querySelector(".lang-toggle");

  function getLanguage() {
    return document.documentElement.lang.startsWith("zh") ? "zh" : "en";
  }

  function setError(key = "") {
    const messages = {
      vehicle: {
        en: "COMPLETE ALL VEHICLE FIELDS TO CONTINUE.",
        zh: "请完整填写车辆资料后继续。",
      },
      direction: {
        en: "SELECT AT LEAST ONE PROJECT DIRECTION.",
        zh: "请至少选择一个项目方向。",
      },
    };
    activeErrorKey = key;
    errorNode.textContent = key ? messages[key][getLanguage()] : "";
  }

  function syncVehicle() {
    for (const [key, control] of Object.entries(vehicleControls)) {
      plannerState.vehicle[key] = cleanSelection(control.value, Number(control.maxLength) || 80);
    }
  }

  function hasCompleteVehicle() {
    return Object.values(plannerState.vehicle).every(Boolean);
  }

  function updateReview() {
    const language = getLanguage();
    const selectedServices = [...plannerState.directions]
      .map((key) => serviceLabels[key]?.[language])
      .filter(Boolean);

    reviewNodes.vehicle.textContent = [
      plannerState.vehicle.year,
      plannerState.vehicle.make,
      plannerState.vehicle.model,
      plannerState.vehicle.chassis,
    ].filter(Boolean).join(" ");
    reviewNodes.goal.textContent = goalLabels[plannerState.goal][language];
    reviewNodes.directions.textContent = selectedServices.join(", ");
    reviewNodes.product.textContent = productSelection
      ? [
          productSelection.name,
          ...productSelection.options.map(
            ([key, value]) => `${productOptionLabels[key][language]}: ${value}`
          ),
        ].join(", ")
      : plannerState.product || "";
    reviewNodes.productRow.hidden = !plannerState.product;
    submitLink.href = buildContactUrl(plannerState);
  }

  function setStep(index) {
    const parsedIndex = Number.parseInt(index, 10);
    const target = Math.min(3, Math.max(0, Number.isNaN(parsedIndex) ? 0 : parsedIndex));
    syncVehicle();

    if (target > plannerState.step && plannerState.step === 0 && !hasCompleteVehicle()) {
      setError("vehicle");
      return false;
    }
    if (target > 2 && plannerState.step <= 2 && plannerState.directions.size === 0) {
      setError("direction");
      return false;
    }

    plannerState.step = target;
    setError();
    stepNodes.forEach((node, stepIndex) => {
      node.hidden = stepIndex !== target;
    });
    progressButtons.forEach((button, stepIndex) => {
      if (stepIndex === target) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
      button.toggleAttribute("data-complete", stepIndex < target);
    });
    backButton.disabled = target === 0;
    nextButton.hidden = target === 3;
    submitLink.hidden = target !== 3;
    updateReview();
    return true;
  }

  if (root) {
    const initialQuery = readPlannerQuery(window.location.search);
    plannerState.product = initialQuery.product;
    productSelection = initialQuery.productSelection;
    if (initialQuery.vehicle) {
      Object.assign(plannerState.vehicle, initialQuery.vehicle);
      Object.entries(vehicleControls).forEach(([key, control]) => {
        control.value = plannerState.vehicle[key];
      });
    }
    if (initialQuery.direction) plannerState.directions.add(initialQuery.direction);

    Object.entries(vehicleControls).forEach(([key, control]) => {
      const update = () => {
        plannerState.vehicle[key] = cleanSelection(control.value, Number(control.maxLength) || 80);
        setError();
      };
      control.addEventListener("input", update);
      control.addEventListener("change", update);
    });

    goalControls.forEach((control) => {
      control.addEventListener("change", () => {
        if (control.checked && goalLabels[control.value]) {
          plannerState.goal = control.value;
          setError();
        }
      });
    });

    directionControls.forEach((control) => {
      control.checked = plannerState.directions.has(control.value);
      control.addEventListener("change", () => {
        if (control.checked && serviceMap[control.value]) {
          plannerState.directions.add(control.value);
        } else {
          plannerState.directions.delete(control.value);
        }
        setError();
      });
    });

    progressButtons.forEach((button) => {
      button.addEventListener("click", () => setStep(button.dataset.progressStep));
    });
    backButton.addEventListener("click", () => setStep(plannerState.step - 1));
    nextButton.addEventListener("click", () => setStep(plannerState.step + 1));
    submitLink.addEventListener("click", () => {
      const target = buildContactUrl(plannerState);
      submitLink.href = target;
      window.location.href = target;
    });
    langToggle?.addEventListener("click", () => {
      updateReview();
      setError(activeErrorKey);
    });

    setStep(0);
  }

  if (window.LonmaPlannerTest) {
    Object.assign(window.LonmaPlannerTest, {
      buildContactUrl,
      getState: () => plannerState,
      setGoal: (goal) => { plannerState.goal = goal; },
      setStep,
      toggleDirection: (key, enabled) => enabled
        ? plannerState.directions.add(key)
        : plannerState.directions.delete(key),
    });
  }
})();
