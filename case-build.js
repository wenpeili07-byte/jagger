/* Case detail: "shop the build" hotspots, linked rows/cards, and the process timeline. */
(() => {
  const root = document.documentElement;
  const page = document.querySelector(".case-detail-page, .service-detail-page");
  if (!page) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("case-build-ready");

  /* Hotspots on a cover photo that uses object-fit: cover — map photo % to the visible frame. */
  const placeCoverHotspots = (figure) => {
    const image = figure.querySelector("img");
    const hotspots = figure.querySelectorAll(".build-hotspot");
    if (!image || !hotspots.length || !image.naturalWidth) return;

    const frameWidth = figure.clientWidth;
    const frameHeight = figure.clientHeight;
    const scale = Math.max(frameWidth / image.naturalWidth, frameHeight / image.naturalHeight);
    const renderedWidth = image.naturalWidth * scale;
    const renderedHeight = image.naturalHeight * scale;
    const [positionX = "50%", positionY = "50%"] = getComputedStyle(image).objectPosition.split(" ");
    const offsetX = (frameWidth - renderedWidth) * (parseFloat(positionX) / 100);
    const offsetY = (frameHeight - renderedHeight) * (parseFloat(positionY) / 100);
    const margin = 28;
    const frameRect = figure.getBoundingClientRect();
    const copy = figure.closest(".detail-hero")?.querySelectorAll(".detail-copy h1, .detail-copy h2, .detail-intro, .detail-index, .detail-back") || [];
    const blocked = [...copy].map((node) => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left - frameRect.left - 40, right: rect.right - frameRect.left + 40, top: rect.top - frameRect.top - 40, bottom: rect.bottom - frameRect.top + 40 };
    });

    hotspots.forEach((hotspot) => {
      const x = offsetX + renderedWidth * (Number(hotspot.dataset.x) / 100);
      const y = offsetY + renderedHeight * (Number(hotspot.dataset.y) / 100);
      const overlapsCopy = blocked.some((box) => x > box.left && x < box.right && y > box.top && y < box.bottom);
      const visible = !overlapsCopy && x > margin && x < frameWidth - margin && y > margin && y < frameHeight - margin;
      hotspot.style.left = `${x}px`;
      hotspot.style.top = `${y}px`;
      hotspot.hidden = !visible;
      hotspot.classList.toggle("is-flipped", x > frameWidth * 0.62);
    });
  };

  const coverFigures = [...document.querySelectorAll("[data-build-cover]")];
  const placeAll = () => coverFigures.forEach(placeCoverHotspots);
  coverFigures.forEach((figure) => {
    const image = figure.querySelector("img");
    if (image && !image.complete) image.addEventListener("load", () => placeCoverHotspots(figure), { once: true });
  });
  placeAll();
  window.addEventListener("resize", placeAll, { passive: true });
  window.addEventListener("lonma:content-updated", placeAll);

  /* Linked activation: a hotspot, a list row, a card and a story tag share one key. */
  const linked = () => [...document.querySelectorAll("[data-build-key]")];
  const activate = (key) => {
    linked().forEach((node) => node.classList.toggle("is-active", node.dataset.buildKey === key));
  };

  const stages = [...document.querySelectorAll("[data-build-stage]")];
  stages.forEach((stage) => {
    const keys = [...stage.querySelectorAll(".build-hotspot")]
      .filter((node) => !node.hidden)
      .map((node) => node.dataset.buildKey);
    if (!keys.length) return;

    let index = 0;
    let paused = false;
    let timer = 0;

    const step = () => {
      const visibleKeys = [...stage.querySelectorAll(".build-hotspot")]
        .filter((node) => !node.hidden)
        .map((node) => node.dataset.buildKey);
      if (!paused && visibleKeys.length) {
        index = (index + 1) % visibleKeys.length;
        activate(visibleKeys[index]);
      }
      timer = window.setTimeout(step, 3200);
    };

    window.setTimeout(() => {
      activate(keys[0]);
      if (!reducedMotion) timer = window.setTimeout(step, 3200);
    }, 900);

    stage.addEventListener("pointerenter", () => { paused = true; });
    stage.addEventListener("pointerleave", () => { paused = false; });
    stage.addEventListener("focusin", () => { paused = true; });
    stage.addEventListener("focusout", () => { paused = false; });
    window.addEventListener("pagehide", () => window.clearTimeout(timer), { once: true });
  });

  document.addEventListener("pointerover", (event) => {
    const node = event.target.closest?.("[data-build-key]");
    if (node) activate(node.dataset.buildKey);
  });
  document.addEventListener("focusin", (event) => {
    const node = event.target.closest?.("[data-build-key]");
    if (node) activate(node.dataset.buildKey);
  });

  /* Reveal steps, cards and story tags as they enter the viewport. */
  const revealTargets = document.querySelectorAll("[data-build-reveal]");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((node) => node.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    revealTargets.forEach((node) => observer.observe(node));
  }

  /* Process spine fills as the reader moves down the timeline. */
  const spines = [...document.querySelectorAll("[data-case-process]")];
  const updateSpines = () => {
    const middle = window.innerHeight * 0.6;
    spines.forEach((spine) => {
      const rect = spine.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (middle - rect.top) / Math.max(1, rect.height)));
      spine.style.setProperty("--spine", progress.toFixed(3));
    });
  };
  updateSpines();
  window.addEventListener("scroll", updateSpines, { passive: true });
  window.addEventListener("resize", updateSpines, { passive: true });
})();

/* Scroll chapters: the step nearest the reading line drives the sticky frame. */
(() => {
  document.querySelectorAll("[data-case-chapters]").forEach((section) => {
    const steps = [...section.querySelectorAll("[data-chapter]")];
    const media = [...section.querySelectorAll("[data-chapter-media]")];
    const current = section.querySelector("[data-chapter-current]");
    const bar = section.querySelector(".case-chapters-bar");
    if (!steps.length) return;

    let active = -1;
    const setActive = (index) => {
      if (index === active) return;
      active = index;
      steps.forEach((step, i) => {
        step.classList.toggle("is-active", i === index);
        step.classList.toggle("is-past", i < index);
      });
      media.forEach((figure, i) => figure.classList.toggle("is-active", i === index));
      if (current) current.textContent = String(index + 1).padStart(2, "0");
      bar?.style.setProperty("--chapter-progress", ((index + 1) / steps.length).toFixed(3));
    };

    const update = () => {
      const narrow = window.matchMedia("(max-width: 1000px)").matches;
      const line = window.innerHeight * (narrow ? 0.72 : 0.55);
      let index = 0;
      steps.forEach((step, i) => {
        if (step.getBoundingClientRect().top < line) index = i;
      });
      setActive(index);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
  });
})();
