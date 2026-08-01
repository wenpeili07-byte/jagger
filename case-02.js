(() => {
  const stage = document.querySelector(".case02-video-stage");
  const video = document.querySelector("[data-case-video]");
  if (!stage || !video) return;

  const refreshCaseVideoState = () => {
    const hasSource = Boolean(video.currentSrc || video.getAttribute("src") || video.querySelector("source[src]"));
    stage.dataset.videoState = hasSource ? "ready" : "poster-only";

    if (!hasSource) {
      video.removeAttribute("controls");
      video.setAttribute("aria-disabled", "true");
    }
  };

  window.lonmaRefreshCaseVideoState = refreshCaseVideoState;
  refreshCaseVideoState();

  const refreshStoryMotion = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll(".case02-story-beat, .case02-story-full, .case02-story > .case02-story-wide").forEach((node) => {
      node.dataset.motion = reducedMotion ? "none" : "fade";
    });
  };

  refreshStoryMotion();
  window.addEventListener?.("lonma:content-updated", refreshStoryMotion);
})();
