const casesPage = document.querySelector(".cases-page");
const featureCards = [...document.querySelectorAll(".case-feature-card")];
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const archiveCards = [...document.querySelectorAll("[data-brand]")];
const activeFilterLabel = document.querySelector("[data-active-filter]");

function setHeroScene(card) {
  const scene = card.dataset.scene || getComputedStyle(card).getPropertyValue("--scene").trim();
  if (!casesPage || !scene) return;
  const sceneValue = scene.startsWith("url(") || scene.startsWith("linear-gradient(") ? scene : `url("${scene}")`;

  featureCards.forEach((item) => item.classList.toggle("is-active", item === card));
  casesPage.style.setProperty("--cases-active-scene", sceneValue);
  casesPage.style.setProperty("--active-case-scene", sceneValue);
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
  ["mouseenter", "mouseover", "pointerenter", "focus", "focusin", "click"].forEach((eventName) => {
    card.addEventListener(eventName, () => setHeroScene(card));
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setArchiveFilter(button.dataset.filter));
});

if (featureCards[0]) {
  setHeroScene(featureCards[0]);
}
