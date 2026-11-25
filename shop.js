(() => {
  const cards = [...document.querySelectorAll("[data-product-card]")];
  const productLinks = [...document.querySelectorAll("[data-product-link]")];
  const productLinkBases = new Map(
    productLinks.map((link) => [link, link.getAttribute("href")])
  );
  const managedProductQueryKeys = ["category", "make", "model", "year", "chassis"];
  const filters = [...document.querySelectorAll("[data-category-filter]")];
  const resultsStatus = document.querySelector("[data-results-status]");
  const emptyState = document.querySelector("[data-results-empty]");
  const productGrid = document.querySelector(".shop-product-grid");
  const sortControl = document.querySelector("[data-shop-sort]");
  const productDialog = document.querySelector("[data-product-dialog]");
  const dialogImage = document.querySelector("[data-dialog-image]");
  const dialogCategory = document.querySelector("[data-dialog-category]");
  const dialogTitle = document.querySelector("[data-dialog-title]");
  const dialogCompatibility = document.querySelector("[data-dialog-compatibility]");
  const dialogDescription = document.querySelector("[data-dialog-description]");
  const dialogInquiry = document.querySelector("[data-dialog-inquiry]");
  const dialogClose = document.querySelector("[data-dialog-close]");
  const makeControl = document.querySelector("[data-shop-make]");
  const modelControl = document.querySelector("[data-shop-model]");
  const yearControl = document.querySelector("[data-shop-year]");
  const chassisControl = document.querySelector("[data-shop-chassis]");
  const findButton = document.querySelector("[data-find-parts]");
  const shopSelector = document.querySelector(".shop-selector");
  const mobileVehicleEdit = document.querySelector("[data-mobile-vehicle-edit]");
  const mobileVehicleMake = document.querySelector("[data-mobile-vehicle-make]");
  const mobileVehicleModel = document.querySelector("[data-mobile-vehicle-model]");
  const mobileVehicleYear = document.querySelector("[data-mobile-vehicle-year]");
  const mobileVehicleChassis = document.querySelector("[data-mobile-vehicle-chassis]");
  const vehicleDataNode = document.querySelector("[data-shop-vehicle-data]");
  const dependentVehicleControls = [modelControl, yearControl, chassisControl];
  const vehicleTuples = readVehicleTuples();
  const defaultVehicle = vehicleTuples[0] || {
    make: "BMW",
    model: "G80 M3",
    year: "2024",
    chassis: "G8X",
  };
  const queryOnlyCategories = new Set(["ecu"]);
  let lastDialogTrigger = null;
  let selectedCategories = new Set();
  let vehicleMatchesSample = true;

  function cleanQueryValue(value, maxLength) {
    return String(value || "")
      .replace(/[\u0000-\u001f\u007f]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  function readVehicleTuples() {
    try {
      const parsed = JSON.parse(vehicleDataNode?.textContent || "[]");
      return Array.isArray(parsed)
        ? parsed.filter((vehicle) =>
            vehicle
            && typeof vehicle.make === "string"
            && typeof vehicle.model === "string"
            && typeof vehicle.year === "string"
            && typeof vehicle.chassis === "string"
          )
        : [];
    } catch {
      return [];
    }
  }

  function language() {
    return document.documentElement.lang.startsWith("zh") ? "zh" : "en";
  }

  function setBilingualText(node, values) {
    node.dataset.en = values.en;
    node.dataset.zh = values.zh;
    node.textContent = values[language()];
  }

  function setBilingualAlt(image, values) {
    image.dataset.enAlt = values.en;
    image.dataset.zhAlt = values.zh;
    image.alt = values[language()];
  }

  function activeCategories() {
    return new Set(selectedCategories);
  }

  function findVehicleTuple(values) {
    return vehicleTuples.find((vehicle) =>
      vehicle.make === values.make
      && vehicle.model === values.model
      && vehicle.year === values.year
      && vehicle.chassis === values.chassis
    );
  }

  function currentVehicleValues() {
    return {
      make: cleanQueryValue(makeControl.value, 20).toUpperCase(),
      model: cleanQueryValue(modelControl.value, 40),
      year: cleanQueryValue(yearControl.value, 4),
      chassis: cleanQueryValue(chassisControl.value, 20),
    };
  }

  function applyVehicleTuple(vehicle) {
    const target = vehicle || defaultVehicle;
    makeControl.value = target.make;
    modelControl.value = target.model;
    yearControl.value = target.year;
    chassisControl.value = target.chassis;
    dependentVehicleControls.forEach((control) => {
      control.disabled = false;
    });
    vehicleMatchesSample = Boolean(findVehicleTuple(target));
  }

  function vehicleFromQuery(query) {
    const values = {
      make: cleanQueryValue(query.get("make"), 20).toUpperCase(),
      model: cleanQueryValue(query.get("model"), 40),
      year: cleanQueryValue(query.get("year"), 4),
      chassis: cleanQueryValue(query.get("chassis"), 20),
    };
    const hasCompleteTuple = Object.values(values).every(Boolean);
    return hasCompleteTuple ? findVehicleTuple(values) || defaultVehicle : defaultVehicle;
  }

  function normalizeVehicleControls() {
    const current = currentVehicleValues();
    const exact = findVehicleTuple(current);
    const sameMake = vehicleTuples.find(({ make }) => make === current.make);
    applyVehicleTuple(exact || sameMake || defaultVehicle);
  }

  function updateMobileVehicleSummary() {
    const values = [makeControl, modelControl, yearControl, chassisControl];
    const summaries = [mobileVehicleMake, mobileVehicleModel, mobileVehicleYear, mobileVehicleChassis];

    summaries.forEach((node, index) => {
      if (node) node.textContent = values[index].value || "—";
    });
    syncProductLinks();
  }

  function syncProductLinks() {
    const source = new URLSearchParams(window.location.search);
    source.delete("category");
    if (selectedCategories.size > 0) {
      source.set("category", [...selectedCategories].join(","));
    }
    source.set("make", makeControl.value);
    source.set("model", modelControl.value);
    source.set("year", yearControl.value);
    source.set("chassis", chassisControl.value);

    productLinks.forEach((link) => {
      const target = new URL(productLinkBases.get(link), window.location.href);
      managedProductQueryKeys.forEach((key) => {
        const value = source.get(key);
        if (value) target.searchParams.set(key, value);
        else target.searchParams.delete(key);
      });
      link.href = `${target.pathname}${target.search}`;
    });
  }

  function setMobileVehicleEditor(open) {
    if (!shopSelector || !mobileVehicleEdit) return;
    shopSelector.classList.toggle("is-editing", open);
    mobileVehicleEdit.setAttribute("aria-expanded", String(open));
  }

  function setCategoryFilters(categories) {
    selectedCategories = new Set(categories);

    filters.forEach((filter) => {
      filter.checked = categories.has(filter.value);
    });
  }

  function updateCategoryQuery(categories) {
    const url = new URL(window.location.href);
    url.searchParams.delete("category");

    if (categories.size > 0) {
      url.searchParams.set("category", [...categories].join(","));
    }

    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function sortCards() {
    if (sortControl.value === "category") {
      [...cards]
        .sort((first, second) => first.dataset.category.localeCompare(second.dataset.category))
        .forEach((card) => productGrid.append(card));
      return;
    }

    cards.forEach((card) => productGrid.append(card));
  }

  function applyCatalogState() {
    const active = activeCategories();
    let visibleCount = 0;

    cards.forEach((card) => {
      const visible = vehicleMatchesSample && (active.size === 0 || active.has(card.dataset.category));
      card.hidden = !visible;
      visibleCount += Number(visible);
    });

    const resultCopy = {
      en: `${String(visibleCount).padStart(2, "0")} SAMPLE RESULTS`,
      zh: `${String(visibleCount).padStart(2, "0")} 项示例结果`,
    };
    resultsStatus.dataset.en = resultCopy.en;
    resultsStatus.dataset.zh = resultCopy.zh;
    resultsStatus.textContent = resultCopy[language()];
    emptyState.hidden = visibleCount !== 0;
  }

  function openProductDialog(card, trigger) {
    const category = card.querySelector(".shop-product-category");
    lastDialogTrigger = trigger;
    dialogImage.src = card.dataset.image;
    setBilingualAlt(dialogImage, { en: card.dataset.altEn, zh: card.dataset.altZh });
    setBilingualText(dialogCategory, { en: category.dataset.en, zh: category.dataset.zh });
    setBilingualText(dialogTitle, { en: card.dataset.titleEn, zh: card.dataset.titleZh });
    setBilingualText(dialogCompatibility, {
      en: card.dataset.compatibilityEn,
      zh: card.dataset.compatibilityZh,
    });
    setBilingualText(dialogDescription, { en: card.dataset.descriptionEn, zh: card.dataset.descriptionZh });
    const inquirySubject = language() === "zh"
      ? card.dataset.inquirySubjectZh
      : card.dataset.inquirySubjectEn;
    dialogInquiry.href = `./contact.html?product=${encodeURIComponent(card.dataset.productId)}&subject=${encodeURIComponent(inquirySubject)}`;
    productDialog.dataset.productId = card.dataset.productId;
    productDialog.dataset.shopifyProductId = card.dataset.shopifyProductId;
    productDialog.showModal();
  }

  const query = new URLSearchParams(window.location.search);
  const queryCategories = new Set(
    query
      .getAll("category")
      .flatMap((value) => value.split(","))
      .filter(
        (value) =>
          queryOnlyCategories.has(value)
          || filters.some((filter) => filter.value === value)
          || cards.some((card) => card.dataset.category === value),
      )
  );

  applyVehicleTuple(vehicleFromQuery(query));
  setCategoryFilters(queryCategories);
  sortCards();
  applyCatalogState();
  updateMobileVehicleSummary();

  mobileVehicleEdit?.addEventListener("click", () => {
    const open = !shopSelector.classList.contains("is-editing");
    setMobileVehicleEditor(open);

    if (open) makeControl.focus();
  });

  makeControl.addEventListener("change", () => {
    const selectedVehicle =
      vehicleTuples.find(({ make }) => make === cleanQueryValue(makeControl.value, 20).toUpperCase())
      || defaultVehicle;
    applyVehicleTuple(selectedVehicle);
    updateMobileVehicleSummary();
  });

  dependentVehicleControls.forEach((control) => {
    control.addEventListener("change", () => {
      normalizeVehicleControls();
      updateMobileVehicleSummary();
    });
  });

  findButton.addEventListener("click", () => {
    normalizeVehicleControls();
    applyCatalogState();
    updateMobileVehicleSummary();
    setMobileVehicleEditor(false);
  });

  filters.forEach((filter) => {
    filter.addEventListener("change", () => {
      setCategoryFilters(new Set(filters.filter((item) => item.checked).map((item) => item.value)));
      const categories = activeCategories();
      updateCategoryQuery(categories);
      applyCatalogState();
      syncProductLinks();
    });
  });

  sortControl.addEventListener("change", () => {
    sortCards();
    applyCatalogState();
  });

  cards.forEach((card) => {
    const trigger = card.querySelector("[data-product-open]");
    trigger?.addEventListener("click", () => openProductDialog(card, trigger));
  });

  dialogClose.addEventListener("click", () => productDialog.close());

  productDialog.addEventListener("click", (event) => {
    if (event.target === productDialog) {
      productDialog.close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && productDialog.open) {
      event.preventDefault();
      productDialog.close();
    }
  });

  productDialog.addEventListener("close", () => {
    if (lastDialogTrigger?.isConnected) {
      lastDialogTrigger.focus();
    }

    lastDialogTrigger = null;
  });
})();

// Featured product stage (top of the shop page). Reads everything from the
// existing product cards, so the catalogue stays the single source of truth.
(() => {
  const feature = document.querySelector("[data-shop-feature]");

  if (!feature) {
    return;
  }

  const cards = [...document.querySelectorAll("[data-product-card]")];
  const picks = [...feature.querySelectorAll("[data-feature-pick]")];
  const image = feature.querySelector("[data-feature-image]");
  const name = feature.querySelector("[data-feature-name]");
  const category = feature.querySelector("[data-feature-category]");
  const number = feature.querySelector("[data-feature-number]");
  const description = feature.querySelector("[data-feature-description]");
  const compatibility = feature.querySelector("[data-feature-compatibility]");
  const cta = feature.querySelector("[data-feature-cta]");
  const wheelRows = [...feature.querySelectorAll("[data-feature-wheel]")];
  const otherRows = [...feature.querySelectorAll("[data-feature-other]")];
  const vehicle = feature.querySelector("[data-feature-vehicle]");
  const vehicleMeta = feature.querySelector("[data-feature-vehicle-meta]");
  const vehicleLine = feature.querySelector("[data-feature-vehicle-line]");
  let current = 0;

  const language = () => (document.documentElement.lang.startsWith("zh") ? "zh" : "en");

  const setCopy = (node, zh, en) => {
    if (!node) {
      return;
    }

    node.dataset.zh = zh;
    node.dataset.en = en;
    node.textContent = language() === "zh" ? zh : en;
  };

  const show = (index) => {
    const count = cards.length;
    current = (index + count) % count;
    const card = cards[current];
    const id = card.dataset.productId;
    const categoryNode = card.querySelector(".shop-product-category");
    const link = card.querySelector("a.shop-product-target");
    const isWheel = Boolean(link);

    feature.classList.remove("is-changing");
    void feature.offsetWidth;
    feature.classList.add("is-changing");

    image.src = card.dataset.image;
    image.alt = language() === "zh" ? card.dataset.altZh : card.dataset.altEn;
    image.dataset.zhAlt = card.dataset.altZh;
    image.dataset.enAlt = card.dataset.altEn;
    setCopy(name, card.dataset.titleZh, card.dataset.titleEn);
    setCopy(category, categoryNode?.dataset.zh || "", categoryNode?.dataset.en || "");
    setCopy(description, card.dataset.descriptionZh, card.dataset.descriptionEn);
    setCopy(compatibility, card.dataset.compatibilityZh, card.dataset.compatibilityEn);
    number.textContent = String(current + 1).padStart(2, "0");

    wheelRows.forEach((row) => {
      row.hidden = !isWheel;
    });
    otherRows.forEach((row) => {
      row.hidden = isWheel;
    });

    if (isWheel) {
      cta.setAttribute("href", link.getAttribute("href"));
      setCopy(cta, "配置此产品", "CONFIGURE");
    } else {
      cta.setAttribute("href", `#${id}`);
      setCopy(cta, "查看详情", "VIEW DETAILS");
    }

    cta.dataset.featureTarget = id;
    picks.forEach((pick) => {
      if (pick.dataset.featurePick === id) {
        pick.setAttribute("aria-current", "true");
      } else {
        pick.removeAttribute("aria-current");
      }
    });
  };

  picks.forEach((pick) => {
    pick.addEventListener("click", () => {
      const index = cards.findIndex((card) => card.dataset.productId === pick.dataset.featurePick);
      if (index >= 0) {
        show(index);
      }
    });
  });

  feature.querySelectorAll("[data-feature-step]").forEach((button) => {
    button.addEventListener("click", () => show(current + Number(button.dataset.featureStep)));
  });

  feature.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      show(current - 1);
    } else if (event.key === "ArrowRight") {
      show(current + 1);
    }
  });

  // Swipe on touch screens.
  const stage = feature.querySelector(".shop-feature-stage");
  let touchStartX = null;
  let touchStartY = null;

  stage?.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    },
    { passive: true }
  );

  stage?.addEventListener(
    "touchend",
    (event) => {
      if (touchStartX === null) {
        return;
      }

      const deltaX = event.changedTouches[0].clientX - touchStartX;
      const deltaY = event.changedTouches[0].clientY - touchStartY;
      touchStartX = null;

      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
        show(current + (deltaX < 0 ? 1 : -1));
      }
    },
    { passive: true }
  );

  // Non-wheel products open the existing detail dialog.
  cta.addEventListener("click", (event) => {
    const card = cards[current];
    const dialogTrigger = card.querySelector("button.shop-product-target");

    if (dialogTrigger) {
      event.preventDefault();
      dialogTrigger.click();
    }
  });

  // Mirror the vehicle selected in the selector below.
  const syncVehicle = () => {
    const make = document.querySelector("[data-shop-make]")?.value || "BMW";
    const model = document.querySelector("[data-shop-model]")?.value || "";
    const year = document.querySelector("[data-shop-year]")?.value || "";
    const chassis = document.querySelector("[data-shop-chassis]")?.value || "";
    vehicle.textContent = `${make} ${model}`.trim();
    vehicleMeta.textContent = [year, chassis].filter(Boolean).join(" · ");
    vehicleLine.textContent = [`${make} ${model}`.trim(), year].filter(Boolean).join(" · ");
  };

  document.querySelectorAll("[data-shop-make], [data-shop-model], [data-shop-year], [data-shop-chassis]").forEach((field) => {
    field.addEventListener("change", syncVehicle);
  });
  syncVehicle();
})();

// Deep link: shop.html?product=<id> opens that product (used by "complete the build").
(() => {
  const requested = new URLSearchParams(window.location.search).get("product");

  if (!requested) {
    return;
  }

  const card = [...document.querySelectorAll("[data-product-card]")].find((node) => node.dataset.productId === requested);

  if (!card) {
    return;
  }

  const open = () => {
    card.scrollIntoView({ block: "center" });
    const trigger = card.querySelector("button.shop-product-target");

    if (trigger) {
      trigger.click();
    } else {
      card.querySelector("a.shop-product-target")?.focus();
    }
  };

  if (document.readyState === "complete") {
    open();
  } else {
    window.addEventListener("load", open, { once: true });
  }
})();
