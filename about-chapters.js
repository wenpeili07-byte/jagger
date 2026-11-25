/* About page: the four process steps drive one sticky photo frame. */
(() => {
  const section = document.querySelector("[data-about-chapters]");
  if (!section) return;
  const steps = [...section.querySelectorAll("[data-about-step]")];
  const media = [...section.querySelectorAll("[data-about-media]")];
  const current = section.querySelector("[data-about-current]");
  const bar = section.querySelector(".about-chapter-bar");
  if (!steps.length) return;

  document.documentElement.classList.add("about-chapters-ready");
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
    bar?.style.setProperty("--about-progress", ((index + 1) / steps.length).toFixed(3));
    section.style.setProperty("--about-spine", ((index + 1) / steps.length).toFixed(3));
  };

  const update = () => {
    const narrow = window.matchMedia("(max-width: 900px)").matches;
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
})();
