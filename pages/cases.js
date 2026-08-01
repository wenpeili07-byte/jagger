const filterButtons = [...document.querySelectorAll("[data-filter]")];
const archiveCards = [...document.querySelectorAll("[data-brand]")];
const activeFilterLabel = document.querySelector("[data-active-filter]");
let activeFilter = "all";

function getFilterLabel(filter) {
  if (filter !== "all") {
    return filter === "benz" ? "MERCEDES-BENZ" : filter.toUpperCase();
  }

  return document.body.dataset.lang === "zh" ? "全部品牌" : "ALL MAKES";
}

function getFilterLanguageValues(filter) {
  if (filter === "all") {
    return { zh: "全部品牌", en: "ALL MAKES" };
  }

  const label = getFilterLabel(filter);
  return { zh: label, en: label };
}

function setArchiveFilter(filter) {
  activeFilter = filter;
  const label = getFilterLabel(filter);
  const languageValues = getFilterLanguageValues(filter);

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  archiveCards.forEach((card) => {
    const isVisible = filter === "all" || card.dataset.brand === filter;
    card.hidden = !isVisible;
  });

  if (activeFilterLabel) {
    activeFilterLabel.dataset.zh = languageValues.zh;
    activeFilterLabel.dataset.en = languageValues.en;
    activeFilterLabel.textContent = label;
  }
}

function updateFilterCounts() {
  filterButtons.forEach((button) => {
    const filter = button.dataset.filter;
    if (filter === "all") return;

    const countNode = button.querySelector("small");
    if (!countNode) return;
    const count = archiveCards.filter((card) => card.dataset.brand === filter).length;
    const number = String(count).padStart(2, "0");
    countNode.dataset.en = `${number} ${count === 1 ? "CASE" : "CASES"}`;
    countNode.dataset.zh = `${number} 案例`;
    countNode.textContent = countNode.dataset[document.body.dataset.lang === "zh" ? "zh" : "en"];
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setArchiveFilter(button.dataset.filter));
});

setArchiveFilter("all");

if (typeof window.addEventListener === "function") {
  window.addEventListener("lonma:content-updated", () => {
    updateFilterCounts();
    setArchiveFilter(activeFilter);
  });
}

function initIndependentRailScroll() {
  const rail = document.querySelector(".mwg_effect060 .slides");
  const desktopRail = window.matchMedia("(min-width: 1181px)");

  if (!rail) return;

  rail.addEventListener("wheel", (event) => {
    if (!desktopRail.matches) return;

    event.preventDefault();
    rail.scrollTop += event.deltaY;
  }, { passive: false });
}

initIndependentRailScroll();
