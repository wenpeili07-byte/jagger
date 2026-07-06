const casesPage = document.querySelector(".cases-page");
const featureCards = [...document.querySelectorAll(".case-feature-card")];
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const archiveCards = [...document.querySelectorAll("[data-brand]")];
const activeFilterLabel = document.querySelector("[data-active-filter]");

function setHeroScene(card) {
  const scene = card.dataset.scene;
  if (!casesPage || !scene) return;

  featureCards.forEach((item) => item.classList.toggle("is-active", item === card));
  casesPage.style.setProperty("--cases-active-scene", `url("${scene}")`);
  casesPage.style.setProperty("--active-case-scene", `url("${scene}")`);
}

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

featureCards.forEach((card) => {
  card.addEventListener("mouseenter", () => setHeroScene(card));
  card.addEventListener("focus", () => setHeroScene(card));
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setArchiveFilter(button.dataset.filter));
});
