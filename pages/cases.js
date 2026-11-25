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

// Rail: five cases visible on desktop. Scrolling over the rail steps through
// the six cases one at a time and drives the background scene; once the last
// (or first) case is reached the page scrolls normally. On narrow screens the
// rail is a horizontal strip and the card nearest the left edge becomes active.
function initRailScenes() {
  const rail = document.querySelector(".mwg_effect060 .slides");
  if (!rail) return;

  const desktopRail = window.matchMedia("(min-width: 1181px)");
  const slides = () => [...rail.querySelectorAll(".slide[data-scene]")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let wheelTotal = 0;
  let lastStep = 0;
  let scrollFrame = 0;

  const activeIndex = () => Math.max(0, slides().findIndex((slide) => slide.classList.contains("is-active")));

  const setActive = (index, { reveal = true } = {}) => {
    const list = slides();
    const target = list[index];
    if (!target || target.classList.contains("is-active")) return false;

    // While the rail moves under a still pointer, hover must not steal focus.
    rail.dataset.railStepping = "true";
    clearTimeout(rail.railSteppingTimer);
    rail.railSteppingTimer = setTimeout(() => delete rail.dataset.railStepping, 800);

    list.forEach((slide) => slide.classList.toggle("is-active", slide === target));
    window.dispatchEvent(new CustomEvent("lonma:case-rail-active", { detail: { index } }));

    if (reveal && desktopRail.matches) {
      const top = target.offsetTop - rail.clientHeight / 2 + target.offsetHeight / 2;
      rail.scrollTo({ top, behavior: reduceMotion.matches ? "auto" : "smooth" });
    }

    return true;
  };

  rail.addEventListener("wheel", (event) => {
    if (!desktopRail.matches) return;

    const direction = Math.sign(event.deltaY);
    rail.dataset.railStepping = "true";
    clearTimeout(rail.railSteppingTimer);
    rail.railSteppingTimer = setTimeout(() => delete rail.dataset.railStepping, 800);
    const current = activeIndex();
    const last = slides().length - 1;
    const atEdge = (direction > 0 && current >= last) || (direction < 0 && current <= 0);

    if (!direction || atEdge) {
      // The rail contains its own overscroll, so pass the gesture to the page.
      wheelTotal = 0;
      event.preventDefault();
      window.scrollBy({ top: event.deltaY, behavior: "auto" });
      return;
    }

    event.preventDefault();
    wheelTotal += event.deltaY;
    const now = Date.now();

    if (Math.abs(wheelTotal) < 40 || now - lastStep < 380) return;

    wheelTotal = 0;
    lastStep = now;
    setActive(current + direction);
  }, { passive: false });

  rail.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(event.key)) return;
    const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    if (setActive(activeIndex() + step)) {
      event.preventDefault();
      slides()[activeIndex()].focus({ preventScroll: true });
    }
  });

  // Horizontal strip (tablet/phone): active follows the swipe.
  rail.addEventListener("scroll", () => {
    if (desktopRail.matches || rail.scrollWidth <= rail.clientWidth) return;
    clearTimeout(scrollFrame);
    scrollFrame = setTimeout(() => {
      const left = rail.getBoundingClientRect().left;
      let best = 0;
      let bestDistance = Infinity;
      slides().forEach((slide, index) => {
        const distance = Math.abs(slide.getBoundingClientRect().left - left);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      setActive(best, { reveal: false });
    }, 60);
  }, { passive: true });
}

initRailScenes();
