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

function initCaseScrollMotion() {
  const hero = document.querySelector(".cases-hero");
  const caseCards = [...document.querySelectorAll(".case-feature-card")];
  const hasReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!hero || caseCards.length === 0 || hasReducedMotion || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  gsap.set(caseCards, {
    autoAlpha: 0,
    "--scroll-lift": (index) => `${index % 2 === 0 ? 42 : -42}px`,
    "--scroll-scale": 0.955
  });

  gsap.to(caseCards, {
    autoAlpha: 1,
    "--scroll-lift": "0px",
    "--scroll-scale": 1,
    duration: 0.95,
    ease: "power3.out",
    stagger: {
      amount: 0.42,
      from: "start"
    },
    scrollTrigger: {
      trigger: hero,
      start: "top 72%",
      end: "bottom 24%",
      toggleActions: "play none none reverse"
    }
  });

  if (window.matchMedia("(min-width: 900px)").matches) {
    gsap.to(caseCards, {
      "--scroll-lift": (index) => `${index % 2 === 0 ? -10 : 10}px`,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 0.65
      }
    });
  }
}

initCaseScrollMotion();
