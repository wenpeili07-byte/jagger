const filterButtons = [...document.querySelectorAll("[data-filter]")];
const archiveCards = [...document.querySelectorAll("[data-brand]")];
const activeFilterLabel = document.querySelector("[data-active-filter]");

function buildMaskedImageRail() {
  const archiveMain = document.querySelector(".archive-main");
  const archiveGrid = document.querySelector(".archive-grid");

  if (!archiveMain || !archiveGrid || document.querySelector(".masked-image-rail")) {
    return;
  }

  const showcase = document.createElement("div");
  showcase.className = "archive-showcase";

  const rail = document.createElement("section");
  rail.className = "masked-image-rail";
  rail.setAttribute("aria-label", "滚动案例图片轨道");
  rail.innerHTML = `
    <div class="masked-rail-label">
      <span>SCROLL RAIL</span>
      <b>06 / 36</b>
    </div>
    <div class="masked-rail-viewport">
      <div class="masked-rail-track"></div>
    </div>
  `;

  const track = rail.querySelector(".masked-rail-track");
  archiveCards.forEach((card) => {
    const image = card.querySelector("img");
    const number = card.querySelector(".archive-number")?.textContent?.trim() || "";
    const title = card.querySelector("em")?.textContent?.trim() || card.querySelector("h3")?.textContent?.trim() || "";

    if (!image || !track) {
      return;
    }

    const frame = document.createElement("figure");
    frame.className = "masked-rail-frame";
    frame.innerHTML = `
      <img src="${image.getAttribute("src")}" alt="" loading="lazy" />
      <figcaption>${number} · ${title}</figcaption>
    `;
    track.append(frame);
  });

  archiveMain.insertBefore(showcase, archiveGrid);
  showcase.append(archiveGrid, rail);
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

function initMaskedImageRail() {
  const rail = document.querySelector(".masked-image-rail");
  const viewport = document.querySelector(".masked-rail-viewport");
  const track = document.querySelector(".masked-rail-track");
  const frames = [...document.querySelectorAll(".masked-rail-frame")];
  const images = frames.map((frame) => frame.querySelector("img")).filter(Boolean);
  const hasReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!rail || !viewport || !track || frames.length === 0 || images.length === 0 || hasReducedMotion || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  gsap.set(track, { y: 0, force3D: true });
  gsap.set(frames, {
    clipPath: "inset(7% 0% 7% 0%)",
    yPercent: 0,
    force3D: true
  });
  gsap.set(images, {
    scale: 1.12,
    yPercent: -8,
    force3D: true
  });

  ScrollTrigger.matchMedia({
    "(min-width: 1181px)": () => {
      const railTween = gsap.to(track, {
        y: () => {
          const overflow = track.scrollHeight - viewport.clientHeight;
          return overflow > 0 ? -overflow : 0;
        },
        ease: "none",
        scrollTrigger: {
          trigger: ".case-archive",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.85,
          invalidateOnRefresh: true
        }
      });

      const frameTweens = frames.map((frame, index) => {
        const image = images[index];
        return gsap.timeline({
          scrollTrigger: {
            trigger: frame,
            containerAnimation: railTween,
            start: "top 92%",
            end: "bottom 8%",
            scrub: 0.85
          }
        })
          .fromTo(frame, {
            clipPath: "inset(12% 0% 12% 0%)",
            yPercent: 8
          }, {
            clipPath: "inset(0% 0% 0% 0%)",
            yPercent: 0,
            ease: "power2.out",
            duration: 0.45
          })
          .to(image, {
            yPercent: 7,
            scale: 1.02,
            ease: "none",
            duration: 1
          }, 0);
      });

      return () => {
        railTween.scrollTrigger?.kill();
        railTween.kill();
        frameTweens.forEach((timeline) => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
        });
        gsap.set([track, frames, images], { clearProps: "transform,clipPath" });
      };
    }
  });
}

buildMaskedImageRail();
initMaskedImageRail();
