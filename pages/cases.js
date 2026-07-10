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

function initEffect060Rail() {
  const effect = document.querySelector(".mwg_effect060");
  const pinHeight = effect?.querySelector(".pin-height");
  const container = effect?.querySelector(".container");
  const slides = effect?.querySelector(".slides");
  const slideItems = [...(effect?.querySelectorAll(".slide") || [])];
  const mediaItems = [...(effect?.querySelectorAll(".slide:not(.spacer) .media") || [])];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!effect || !pinHeight || !container || !slides || slideItems.length === 0 || reduceMotion) {
    return;
  }

  let ticking = false;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const update = () => {
    ticking = false;

    if (!window.matchMedia("(min-width: 1181px)").matches) {
      slides.style.removeProperty("transform");
      slideItems.forEach((slide) => slide.style.removeProperty("clip-path"));
      mediaItems.forEach((media) => media.style.removeProperty("transform"));
      return;
    }

    const rect = pinHeight.getBoundingClientRect();
    const travel = Math.max(slides.scrollHeight - container.clientHeight, 0);
    const scrollable = Math.max(rect.height - container.clientHeight, 1);
    const progress = clamp(-rect.top / scrollable, 0, 1);

    slides.style.transform = `translate3d(0, ${-travel * progress}px, 0)`;

    slideItems.forEach((slide) => {
      const media = slide.querySelector(".media");
      if (!media || slide.classList.contains("spacer")) return;

      const slideRect = slide.getBoundingClientRect();
      const spaceProgress = clamp((container.getBoundingClientRect().bottom - slideRect.top) / (container.clientHeight + slideRect.height), 0, 1);
      const centered = Math.sin(spaceProgress * Math.PI);
      const inset = 12 - centered * 12;
      const imageY = -12 + spaceProgress * 16;
      const scale = 1.16 - centered * 0.1;

      slide.style.clipPath = `inset(${inset}% 0% ${inset}% 0%)`;
      media.style.transform = `translate3d(0, ${imageY}%, 0) scale(${scale})`;
    });
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();
}

initEffect060Rail();
