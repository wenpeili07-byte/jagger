const filterButtons = [...document.querySelectorAll("[data-filter]")];
const archiveCards = [...document.querySelectorAll("[data-brand]")];
const activeFilterLabel = document.querySelector("[data-active-filter]");

function setArchiveFilter(filter) {
  const label = filter === "all" ? "BBA" : filter.toUpperCase();

  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === filter);
  });

  archiveCards.forEach((card) => {
    const isVisible = filter === "all" || card.dataset.brand === filter;
    card.hidden = !isVisible;
  });

  if (activeFilterLabel) {
    activeFilterLabel.textContent = label;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setArchiveFilter(button.dataset.filter));
});

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
