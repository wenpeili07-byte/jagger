(() => {
  const cards = [...document.querySelectorAll("[data-product-card]")];
  const filters = [...document.querySelectorAll("[data-category-filter]")];
  const resultsStatus = document.querySelector("[data-results-status]");
  const emptyState = document.querySelector("[data-results-empty]");
  const productGrid = document.querySelector(".shop-product-grid");
  const sortControl = document.querySelector("[data-shop-sort]");
  const productDialog = document.querySelector("[data-product-dialog]");
  const dialogImage = document.querySelector("[data-dialog-image]");
  const dialogCategory = document.querySelector("[data-dialog-category]");
  const dialogTitle = document.querySelector("[data-dialog-title]");
  const dialogDescription = document.querySelector("[data-dialog-description]");
  const dialogInquiry = document.querySelector("[data-dialog-inquiry]");
  const dialogClose = document.querySelector("[data-dialog-close]");
  const queryOnlyCategories = new Set(["ecu"]);
  let lastDialogTrigger = null;
  let selectedCategories = new Set();

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
      const visible = active.size === 0 || active.has(card.dataset.category);
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
    setBilingualText(dialogDescription, { en: card.dataset.descriptionEn, zh: card.dataset.descriptionZh });
    dialogInquiry.href = `./contact.html?product=${encodeURIComponent(card.dataset.productId)}`;
    productDialog.showModal();
  }

  const query = new URLSearchParams(window.location.search);
  const queryCategories = new Set(
    query
      .getAll("category")
      .flatMap((value) => value.split(","))
      .filter((value) => queryOnlyCategories.has(value) || filters.some((filter) => filter.value === value))
  );

  setCategoryFilters(queryCategories);
  sortCards();
  applyCatalogState();

  filters.forEach((filter) => {
    filter.addEventListener("change", () => {
      setCategoryFilters(new Set(filters.filter((item) => item.checked).map((item) => item.value)));
      const categories = activeCategories();
      updateCategoryQuery(categories);
      applyCatalogState();
    });
  });

  sortControl.addEventListener("change", () => {
    sortCards();
    applyCatalogState();
  });

  cards.forEach((card) => {
    const trigger = card.querySelector("[data-product-open]");
    trigger.addEventListener("click", () => openProductDialog(card, trigger));
  });

  dialogClose.addEventListener("click", () => productDialog.close());

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
