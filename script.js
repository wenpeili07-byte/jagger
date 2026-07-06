(() => {
if (window.__lonmaDynamicInitialized) {
  return;
}

window.__lonmaDynamicInitialized = true;

function removeDuplicateShells() {
  document.querySelectorAll(".site-shell").forEach((shell, index) => {
    if (index > 0) {
      shell.remove();
    }
  });
}

removeDuplicateShells();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", removeDuplicateShells, { once: true });
} else {
  removeDuplicateShells();
}

window.addEventListener("load", removeDuplicateShells, { once: true });

const translations = {
  zh: {
    "brand.home": "回到首页",
    "nav.about": "关于",
    "nav.services": "业务",
    "nav.cases": "案例",
    "nav.contact": "联系",
    "hero.cnName": "龙马态度 · 二〇二六",
    "hero.note": "6 台改装车案例作为主展示，下面承接 LONMA DYNAMIC 的核心业务能力。",
    "hero.cta": "→ VIEW SERVICES",
    "cases.listLabel": "改装车案例列表",
    "cases.panelLabel": "改装车案例模块",
    "cases.heading": "LONMA-26-R1 · MODIFIED CAR CASES · 06 OF 36",
    "detail.status": "● NOW HOVERING",
    "services.sectionLabel": "业务展示模块",
    "services.heading": "BUSINESS MODULES",
    "services.count": "06 SERVICES · 03 × 02",
    "lang.next": "Switch to English"
  },
  en: {
    "brand.home": "Back to home",
    "nav.about": "ABOUT",
    "nav.services": "SERVICES",
    "nav.cases": "CASES",
    "nav.contact": "CONTACT",
    "hero.cnName": "LONMA DYNAMIC · 2026",
    "hero.note": "Six modified-car case studies lead the page, followed by LONMA DYNAMIC's core service capabilities.",
    "hero.cta": "→ VIEW SERVICES",
    "cases.listLabel": "Modified car case list",
    "cases.panelLabel": "Modified car case modules",
    "cases.heading": "LONMA-26-R1 · MODIFIED CAR CASES · 06 OF 36",
    "detail.status": "● NOW HOVERING",
    "services.sectionLabel": "Business service modules",
    "services.heading": "BUSINESS MODULES",
    "services.count": "06 SERVICES · 03 × 02",
    "lang.next": "切换到中文"
  }
};

const details = [
  {
    label: {
      zh: "案例 01",
      en: "CASE 01"
    },
    counter: "01",
    subtitle: {
      zh: "CASE 01 · STREET WIDEBODY",
      en: "CASE 01 · STREET WIDEBODY"
    },
    rowName: {
      zh: "街道宽体",
      en: "Street widebody"
    },
    title: {
      zh: "街道宽体案例",
      en: "Street Widebody Case"
    },
    text: {
      zh: "以日常驾驶为基础，加入宽体外观、轮毂姿态和刹车升级，让整车视觉更有压迫感，同时保留通勤可用性。",
      en: "Built around daily drivability, with widebody styling, wheel fitment, and brake upgrades for a stronger stance without losing street usability."
    }
  },
  {
    label: {
      zh: "案例 02",
      en: "CASE 02"
    },
    counter: "02",
    subtitle: {
      zh: "CASE 02 · TRACK SETUP",
      en: "CASE 02 · TRACK SETUP"
    },
    rowName: {
      zh: "赛道化升级",
      en: "Track setup"
    },
    title: {
      zh: "赛道化升级案例",
      en: "Track Setup Case"
    },
    text: {
      zh: "围绕刹车热衰、底盘支撑、轻量化和轮胎抓地做系统升级，让车辆更适合高强度驾驶。",
      en: "A focused upgrade path for brake heat control, chassis support, weight reduction, and tire grip so the car can handle harder driving."
    }
  },
  {
    label: {
      zh: "案例 03",
      en: "CASE 03"
    },
    counter: "03",
    subtitle: {
      zh: "CASE 03 · LOW STANCE",
      en: "CASE 03 · LOW STANCE"
    },
    rowName: {
      zh: "姿态低趴",
      en: "Low stance"
    },
    title: {
      zh: "姿态低趴案例",
      en: "Low Stance Case"
    },
    text: {
      zh: "通过避震高度、轮毂数据和车身比例调整，把视觉重心压低，做出干净利落的街头姿态。",
      en: "Ride height, wheel specs, and body proportions are tuned together to create a clean, low street presence."
    }
  },
  {
    label: {
      zh: "案例 04",
      en: "CASE 04"
    },
    counter: "04",
    subtitle: {
      zh: "CASE 04 · TURBO TUNE",
      en: "CASE 04 · TURBO TUNE"
    },
    rowName: {
      zh: "涡轮特调",
      en: "Turbo tune"
    },
    title: {
      zh: "涡轮特调案例",
      en: "Turbo Tune Case"
    },
    text: {
      zh: "在硬件升级后重新梳理进气、排气、增压和 ECU 标定，让动力输出更饱满也更可控。",
      en: "After hardware upgrades, intake, exhaust, boost, and ECU calibration are matched for stronger and more controllable power delivery."
    }
  },
  {
    label: {
      zh: "案例 05",
      en: "CASE 05"
    },
    counter: "05",
    subtitle: {
      zh: "CASE 05 · PHOTO FEATURE",
      en: "CASE 05 · PHOTO FEATURE"
    },
    rowName: {
      zh: "影像作品车",
      en: "Photo feature"
    },
    title: {
      zh: "影像作品车案例",
      en: "Photo Feature Case"
    },
    text: {
      zh: "以拍摄呈现为目标规划外观细节、灯光质感和成片风格，让改装成果更适合社媒传播。",
      en: "Exterior details, lighting character, and final visual style are planned around content creation and social presentation."
    }
  },
  {
    label: {
      zh: "案例 06",
      en: "CASE 06"
    },
    counter: "06",
    subtitle: {
      zh: "CASE 06 · BLUE PERFORMANCE",
      en: "CASE 06 · BLUE PERFORMANCE"
    },
    rowName: {
      zh: "蓝色性能车",
      en: "Blue performance"
    },
    title: {
      zh: "蓝色性能车案例",
      en: "Blue Performance Case"
    },
    text: {
      zh: "以 BMW 风格蓝色作为视觉线索，结合外观细节、动力响应和拍摄呈现，做出更统一的性能车态度。",
      en: "BMW-inspired blue cues tie together exterior details, power response, and photo presentation for a more unified performance attitude."
    }
  },
  {
    label: "BUILD",
    counter: "S1",
    subtitle: {
      zh: "BUILD",
      en: "BUILD"
    },
    title: {
      zh: "汽车改装",
      en: "Custom Builds"
    },
    text: {
      zh: "外观、轮毂、避震、刹车与整车风格升级方案。",
      en: "From stance, wheels, and brakes to chassis and power upgrades, each build is planned around style, reliability, and feel."
    }
  },
  {
    label: "PARTS",
    counter: "S2",
    subtitle: {
      zh: "PARTS",
      en: "PARTS"
    },
    title: {
      zh: "汽车配件",
      en: "Performance Parts"
    },
    text: {
      zh: "性能件、外观件、轮毂、避震与品牌配件选型供应。",
      en: "Selected intake, exhaust, wheel, brake, suspension, and body-kit options matched to the car and how it will be used."
    }
  },
  {
    label: "PHOTO",
    counter: "S3",
    subtitle: {
      zh: "PHOTO",
      en: "PHOTO"
    },
    title: {
      zh: "汽车摄影",
      en: "Automotive Photo"
    },
    text: {
      zh: "静态拍摄、Rolling Shot、短视频与社交媒体内容制作。",
      en: "Studio shoots, rolling street shots, event coverage, and color finishing that make the build visible and memorable."
    }
  },
  {
    label: "ECU",
    counter: "S4",
    subtitle: {
      zh: "ECU",
      en: "ECU"
    },
    title: {
      zh: "ECU 特调",
      en: "ECU Calibration"
    },
    text: {
      zh: "动力程序、数据记录、道路优化与 Stage 方案规划。",
      en: "Custom calibration based on hardware condition and driving goals, improving response, torque delivery, and daily control."
    }
  },
  {
    label: "CHASSIS",
    counter: "S5",
    subtitle: {
      zh: "CHASSIS",
      en: "CHASSIS"
    },
    title: {
      zh: "底盘设定",
      en: "Chassis Setup"
    },
    text: {
      zh: "车高、轮毂数据、定位与街道 / 赛道驾驶设定。",
      en: "Suspension, alignment, and brake feel are tuned for street, canyon, or track use so the car feels stable, precise, and responsive."
    }
  },
  {
    label: "EXHAUST",
    counter: "S6",
    subtitle: {
      zh: "EXHAUST",
      en: "EXHAUST"
    },
    title: {
      zh: "进排气",
      en: "Intake & Exhaust"
    },
    text: {
      zh: "进气、头段、中尾段、声浪与动力响应升级。",
      en: "Intake and exhaust choices balance sound, flow, road compliance, performance release, and long-term usability."
    }
  }
];

const cards = [...document.querySelectorAll("[data-detail]")];
const filmCards = [...document.querySelectorAll(".film-card")];
const rows = [...document.querySelectorAll(".roll-row")];
const activeLabel = document.querySelector("#activeLabel");
const detailTitle = document.querySelector("#detailTitle");
const detailText = document.querySelector("#detailText");
const stripCount = document.querySelector("#stripCount");
const langToggle = document.querySelector("[data-lang-toggle]");
const languageOptions = [...document.querySelectorAll("[data-lang-option]")];
const shell = document.querySelector(".site-shell");
const supportedLanguages = ["zh", "en"];
const serviceCtaText = {
  zh: "咨询详情 →",
  en: "REQUEST DETAILS →"
};
let activeIndex = 0;
let currentLanguage = getInitialLanguage();
const defaultCaseScene = getComputedStyle(shell).getPropertyValue("--active-case-scene").trim();
let activeSceneTarget = defaultCaseScene;

function installCaseBackgroundOverride() {
  if (!shell || document.querySelector("[data-case-background-override]")) {
    return;
  }

  const style = document.createElement("style");
  style.dataset.caseBackgroundOverride = "true";
  style.textContent = ".site-shell::before{background-image:var(--active-case-scene)!important;z-index:-3!important;}";
  document.head.append(style);
}

function transitionSceneBackground(scene) {
  if (!shell || !scene || activeSceneTarget === scene) {
    return;
  }

  activeSceneTarget = scene;
  shell.querySelectorAll(".scene-fade-layer").forEach((layer) => layer.remove());

  const layer = document.createElement("span");
  layer.className = "scene-fade-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.style.backgroundImage = scene;
  shell.append(layer);

  requestAnimationFrame(() => {
    layer.classList.add("is-visible");
  });

  window.setTimeout(() => {
    shell.style.setProperty("--active-case-scene", scene);
    shell.dataset.currentScene = scene;
    layer.remove();
  }, 780);
}

function getInitialLanguage() {
  const savedLanguage = localStorage.getItem("lonma-language");
  if (supportedLanguages.includes(savedLanguage)) {
    return savedLanguage;
  }

  return document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "zh";
}

function translateStaticText(language) {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = translations[language][key] || translations.zh[key] || element.textContent;
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    const key = element.dataset.i18nAria;
    element.setAttribute("aria-label", translations[language][key] || translations.zh[key] || "");
  });
}

function getDetailLabel(detail, language) {
  return typeof detail.label === "string" ? detail.label : detail.label[language];
}

function updateCardCopy(language) {
  cards.forEach((card) => {
    const detail = details[Number(card.dataset.index)];
    const subtitle = card.querySelector("[data-card-subtitle]");
    const title = card.querySelector("[data-card-title]");
    const text = card.querySelector("[data-card-text]");
    const serviceCta = card.querySelector("[data-service-cta]");

    if (subtitle) {
      subtitle.textContent = detail.subtitle[language];
    }

    if (title && detail.title) {
      title.textContent = detail.title[language];
    }

    if (text && detail.text) {
      text.textContent = detail.text[language];
    }

    if (serviceCta) {
      serviceCta.textContent = serviceCtaText[language];
    }
  });

  rows.forEach((row) => {
    const detail = details[Number(row.dataset.index)];
    const label = row.querySelector("[data-case-label]");
    const name = row.querySelector("[data-case-name]");

    if (label) {
      label.textContent = getDetailLabel(detail, language);
    }

    if (name) {
      name.textContent = detail.rowName[language];
    }
  });
}

function updateLanguageToggle(language) {
  languageOptions.forEach((option) => {
    option.classList.toggle("is-current", option.dataset.langOption === language);
  });

  if (langToggle) {
    langToggle.setAttribute("aria-label", translations[language]["lang.next"]);
  }
}

function setLanguage(language) {
  currentLanguage = supportedLanguages.includes(language) ? language : "zh";
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  document.body.dataset.lang = currentLanguage;
  localStorage.setItem("lonma-language", currentLanguage);

  translateStaticText(currentLanguage);
  updateCardCopy(currentLanguage);
  updateLanguageToggle(currentLanguage);
  setActive(activeIndex);
}

function setActive(index) {
  activeIndex = (index + details.length) % details.length;
  const detail = details[activeIndex];

  cards.forEach((card) => {
    card.classList.toggle("is-active", Number(card.dataset.index) === activeIndex);
  });

  rows.forEach((row) => {
    row.classList.toggle("is-active", Number(row.dataset.index) === activeIndex);
  });

  activeLabel.textContent = getDetailLabel(detail, currentLanguage);
  detailTitle.textContent = detail.title[currentLanguage];
  detailText.textContent = detail.text[currentLanguage];
  stripCount.textContent = detail.counter;
}

function previewCaseBackground(card) {
  const scene = getComputedStyle(card).getPropertyValue("--scene").trim();

  transitionSceneBackground(scene);
}

function resetCaseBackground() {
  transitionSceneBackground(defaultCaseScene);
}

cards.forEach((card) => {
  const index = Number(card.dataset.index);
  const activateCard = () => setActive(index);

  card.addEventListener("pointerenter", activateCard);
  card.addEventListener("pointermove", activateCard);
  card.addEventListener("mouseenter", () => setActive(index));
  card.addEventListener("focus", () => setActive(index));
  card.addEventListener("click", () => setActive(index));
});

filmCards.forEach((card) => {
  const previewCard = () => previewCaseBackground(card);

  card.addEventListener("pointerenter", previewCard);
  card.addEventListener("pointermove", previewCard);
  card.addEventListener("mouseenter", () => previewCaseBackground(card));
  card.addEventListener("focus", () => previewCaseBackground(card));
  card.addEventListener("click", () => previewCaseBackground(card));
});

rows.forEach((row) => {
  row.addEventListener("click", () => setActive(Number(row.dataset.index)));
});

if (langToggle) {
  langToggle.addEventListener("click", () => {
    const nextLanguage = currentLanguage === "zh" ? "en" : "zh";
    setLanguage(nextLanguage);
  });
}

installCaseBackgroundOverride();
setLanguage(currentLanguage);
})();
(() => {
if (window.__lonmaDynamicInitialized) {
  return;
}

window.__lonmaDynamicInitialized = true;

function removeDuplicateShells() {
  document.querySelectorAll(".site-shell").forEach((shell, index) => {
    if (index > 0) {
      shell.remove();
    }
  });
}

removeDuplicateShells();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", removeDuplicateShells, { once: true });
} else {
  removeDuplicateShells();
}

window.addEventListener("load", removeDuplicateShells, { once: true });

const translations = {
  zh: {
    "brand.home": "回到首页",
    "nav.about": "关于",
    "nav.services": "业务",
    "nav.cases": "案例",
    "nav.contact": "联系",
    "hero.cnName": "龙马态度 · 二〇二六",
    "hero.note": "6 台改装车案例作为主展示，下面承接 LONMA DYNAMIC 的核心业务能力。",
    "hero.cta": "→ VIEW SERVICES",
    "cases.listLabel": "改装车案例列表",
    "cases.panelLabel": "改装车案例模块",
    "cases.heading": "LONMA-26-R1 · MODIFIED CAR CASES · 06 OF 36",
    "detail.status": "● NOW HOVERING",
    "services.sectionLabel": "业务展示模块",
    "services.heading": "BUSINESS MODULES",
    "services.count": "06 SERVICES · 03 × 02",
    "lang.next": "Switch to English"
  },
  en: {
    "brand.home": "Back to home",
    "nav.about": "ABOUT",
    "nav.services": "SERVICES",
    "nav.cases": "CASES",
    "nav.contact": "CONTACT",
    "hero.cnName": "LONMA DYNAMIC · 2026",
    "hero.note": "Six modified-car case studies lead the page, followed by LONMA DYNAMIC's core service capabilities.",
    "hero.cta": "→ VIEW SERVICES",
    "cases.listLabel": "Modified car case list",
    "cases.panelLabel": "Modified car case modules",
    "cases.heading": "LONMA-26-R1 · MODIFIED CAR CASES · 06 OF 36",
    "detail.status": "● NOW HOVERING",
    "services.sectionLabel": "Business service modules",
    "services.heading": "BUSINESS MODULES",
    "services.count": "06 SERVICES · 03 × 02",
    "lang.next": "切换到中文"
  }
};

const details = [
  {
    label: {
      zh: "案例 01",
      en: "CASE 01"
    },
    counter: "01",
    subtitle: {
      zh: "CASE 01 · STREET WIDEBODY",
      en: "CASE 01 · STREET WIDEBODY"
    },
    rowName: {
      zh: "街道宽体",
      en: "Street widebody"
    },
    title: {
      zh: "街道宽体案例",
      en: "Street Widebody Case"
    },
    text: {
      zh: "以日常驾驶为基础，加入宽体外观、轮毂姿态和刹车升级，让整车视觉更有压迫感，同时保留通勤可用性。",
      en: "Built around daily drivability, with widebody styling, wheel fitment, and brake upgrades for a stronger stance without losing street usability."
    }
  },
  {
    label: {
      zh: "案例 02",
      en: "CASE 02"
    },
    counter: "02",
    subtitle: {
      zh: "CASE 02 · TRACK SETUP",
      en: "CASE 02 · TRACK SETUP"
    },
    rowName: {
      zh: "赛道化升级",
      en: "Track setup"
    },
    title: {
      zh: "赛道化升级案例",
      en: "Track Setup Case"
    },
    text: {
      zh: "围绕刹车热衰、底盘支撑、轻量化和轮胎抓地做系统升级，让车辆更适合高强度驾驶。",
      en: "A focused upgrade path for brake heat control, chassis support, weight reduction, and tire grip so the car can handle harder driving."
    }
  },
  {
    label: {
      zh: "案例 03",
      en: "CASE 03"
    },
    counter: "03",
    subtitle: {
      zh: "CASE 03 · LOW STANCE",
      en: "CASE 03 · LOW STANCE"
    },
    rowName: {
      zh: "姿态低趴",
      en: "Low stance"
    },
    title: {
      zh: "姿态低趴案例",
      en: "Low Stance Case"
    },
    text: {
      zh: "通过避震高度、轮毂数据和车身比例调整，把视觉重心压低，做出干净利落的街头姿态。",
      en: "Ride height, wheel specs, and body proportions are tuned together to create a clean, low street presence."
    }
  },
  {
    label: {
      zh: "案例 04",
      en: "CASE 04"
    },
    counter: "04",
    subtitle: {
      zh: "CASE 04 · TURBO TUNE",
      en: "CASE 04 · TURBO TUNE"
    },
    rowName: {
      zh: "涡轮特调",
      en: "Turbo tune"
    },
    title: {
      zh: "涡轮特调案例",
      en: "Turbo Tune Case"
    },
    text: {
      zh: "在硬件升级后重新梳理进气、排气、增压和 ECU 标定，让动力输出更饱满也更可控。",
      en: "After hardware upgrades, intake, exhaust, boost, and ECU calibration are matched for stronger and more controllable power delivery."
    }
  },
  {
    label: {
      zh: "案例 05",
      en: "CASE 05"
    },
    counter: "05",
    subtitle: {
      zh: "CASE 05 · PHOTO FEATURE",
      en: "CASE 05 · PHOTO FEATURE"
    },
    rowName: {
      zh: "影像作品车",
      en: "Photo feature"
    },
    title: {
      zh: "影像作品车案例",
      en: "Photo Feature Case"
    },
    text: {
      zh: "以拍摄呈现为目标规划外观细节、灯光质感和成片风格，让改装成果更适合社媒传播。",
      en: "Exterior details, lighting character, and final visual style are planned around content creation and social presentation."
    }
  },
  {
    label: {
      zh: "案例 06",
      en: "CASE 06"
    },
    counter: "06",
    subtitle: {
      zh: "CASE 06 · BLUE PERFORMANCE",
      en: "CASE 06 · BLUE PERFORMANCE"
    },
    rowName: {
      zh: "蓝色性能车",
      en: "Blue performance"
    },
    title: {
      zh: "蓝色性能车案例",
      en: "Blue Performance Case"
    },
    text: {
      zh: "以 BMW 风格蓝色作为视觉线索，结合外观细节、动力响应和拍摄呈现，做出更统一的性能车态度。",
      en: "BMW-inspired blue cues tie together exterior details, power response, and photo presentation for a more unified performance attitude."
    }
  },
  {
    label: "BUILD",
    counter: "S1",
    subtitle: {
      zh: "BUILD",
      en: "BUILD"
    },
    title: {
      zh: "汽车改装",
      en: "Custom Builds"
    },
    text: {
      zh: "外观、轮毂、避震、刹车与整车风格升级方案。",
      en: "From stance, wheels, and brakes to chassis and power upgrades, each build is planned around style, reliability, and feel."
    }
  },
  {
    label: "PARTS",
    counter: "S2",
    subtitle: {
      zh: "PARTS",
      en: "PARTS"
    },
    title: {
      zh: "汽车配件",
      en: "Performance Parts"
    },
    text: {
      zh: "性能件、外观件、轮毂、避震与品牌配件选型供应。",
      en: "Selected intake, exhaust, wheel, brake, suspension, and body-kit options matched to the car and how it will be used."
    }
  },
  {
    label: "PHOTO",
    counter: "S3",
    subtitle: {
      zh: "PHOTO",
      en: "PHOTO"
    },
    title: {
      zh: "汽车摄影",
      en: "Automotive Photo"
    },
    text: {
      zh: "静态拍摄、Rolling Shot、短视频与社交媒体内容制作。",
      en: "Studio shoots, rolling street shots, event coverage, and color finishing that make the build visible and memorable."
    }
  },
  {
    label: "ECU",
    counter: "S4",
    subtitle: {
      zh: "ECU",
      en: "ECU"
    },
    title: {
      zh: "ECU 特调",
      en: "ECU Calibration"
    },
    text: {
      zh: "动力程序、数据记录、道路优化与 Stage 方案规划。",
      en: "Custom calibration based on hardware condition and driving goals, improving response, torque delivery, and daily control."
    }
  },
  {
    label: "CHASSIS",
    counter: "S5",
    subtitle: {
      zh: "CHASSIS",
      en: "CHASSIS"
    },
    title: {
      zh: "底盘设定",
      en: "Chassis Setup"
    },
    text: {
      zh: "车高、轮毂数据、定位与街道 / 赛道驾驶设定。",
      en: "Suspension, alignment, and brake feel are tuned for street, canyon, or track use so the car feels stable, precise, and responsive."
    }
  },
  {
    label: "EXHAUST",
    counter: "S6",
    subtitle: {
      zh: "EXHAUST",
      en: "EXHAUST"
    },
    title: {
      zh: "进排气",
      en: "Intake & Exhaust"
    },
    text: {
      zh: "进气、头段、中尾段、声浪与动力响应升级。",
      en: "Intake and exhaust choices balance sound, flow, road compliance, performance release, and long-term usability."
    }
  }
];

const cards = [...document.querySelectorAll("[data-detail]")];
const filmCards = [...document.querySelectorAll(".film-card")];
const rows = [...document.querySelectorAll(".roll-row")];
const activeLabel = document.querySelector("#activeLabel");
const detailTitle = document.querySelector("#detailTitle");
const detailText = document.querySelector("#detailText");
const stripCount = document.querySelector("#stripCount");
const langToggle = document.querySelector("[data-lang-toggle]");
const languageOptions = [...document.querySelectorAll("[data-lang-option]")];
const shell = document.querySelector(".site-shell");
const supportedLanguages = ["zh", "en"];
const serviceCtaText = {
  zh: "咨询详情 →",
  en: "REQUEST DETAILS →"
};
let activeIndex = 0;
let currentLanguage = getInitialLanguage();
const defaultCaseScene = getComputedStyle(shell).getPropertyValue("--active-case-scene").trim();
let activeSceneTarget = defaultCaseScene;

function installCaseBackgroundOverride() {
  if (!shell || document.querySelector("[data-case-background-override]")) {
    return;
  }

  const style = document.createElement("style");
  style.dataset.caseBackgroundOverride = "true";
  style.textContent = ".site-shell::before{background-image:var(--active-case-scene)!important;z-index:-3!important;}";
  document.head.append(style);
}

function transitionSceneBackground(scene) {
  if (!shell || !scene || activeSceneTarget === scene) {
    return;
  }

  activeSceneTarget = scene;
  shell.querySelectorAll(".scene-fade-layer").forEach((layer) => layer.remove());

  const layer = document.createElement("span");
  layer.className = "scene-fade-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.style.backgroundImage = scene;
  shell.append(layer);

  requestAnimationFrame(() => {
    layer.classList.add("is-visible");
  });

  window.setTimeout(() => {
    shell.style.setProperty("--active-case-scene", scene);
    shell.dataset.currentScene = scene;
    layer.remove();
  }, 780);
}

function getInitialLanguage() {
  const savedLanguage = localStorage.getItem("lonma-language");
  if (supportedLanguages.includes(savedLanguage)) {
    return savedLanguage;
  }

  return document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "zh";
}

function translateStaticText(language) {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = translations[language][key] || translations.zh[key] || element.textContent;
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    const key = element.dataset.i18nAria;
    element.setAttribute("aria-label", translations[language][key] || translations.zh[key] || "");
  });
}

function getDetailLabel(detail, language) {
  return typeof detail.label === "string" ? detail.label : detail.label[language];
}

function updateCardCopy(language) {
  cards.forEach((card) => {
    const detail = details[Number(card.dataset.index)];
    const subtitle = card.querySelector("[data-card-subtitle]");
    const title = card.querySelector("[data-card-title]");
    const text = card.querySelector("[data-card-text]");
    const serviceCta = card.querySelector("[data-service-cta]");

    if (subtitle) {
      subtitle.textContent = detail.subtitle[language];
    }

    if (title && detail.title) {
      title.textContent = detail.title[language];
    }

    if (text && detail.text) {
      text.textContent = detail.text[language];
    }

    if (serviceCta) {
      serviceCta.textContent = serviceCtaText[language];
    }
  });

  rows.forEach((row) => {
    const detail = details[Number(row.dataset.index)];
    const label = row.querySelector("[data-case-label]");
    const name = row.querySelector("[data-case-name]");

    if (label) {
      label.textContent = getDetailLabel(detail, language);
    }

    if (name) {
      name.textContent = detail.rowName[language];
    }
  });
}

function updateLanguageToggle(language) {
  languageOptions.forEach((option) => {
    option.classList.toggle("is-current", option.dataset.langOption === language);
  });

  if (langToggle) {
    langToggle.setAttribute("aria-label", translations[language]["lang.next"]);
  }
}

function setLanguage(language) {
  currentLanguage = supportedLanguages.includes(language) ? language : "zh";
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  document.body.dataset.lang = currentLanguage;
  localStorage.setItem("lonma-language", currentLanguage);

  translateStaticText(currentLanguage);
  updateCardCopy(currentLanguage);
  updateLanguageToggle(currentLanguage);
  setActive(activeIndex);
}

function setActive(index) {
  activeIndex = (index + details.length) % details.length;
  const detail = details[activeIndex];

  cards.forEach((card) => {
    card.classList.toggle("is-active", Number(card.dataset.index) === activeIndex);
  });

  rows.forEach((row) => {
    row.classList.toggle("is-active", Number(row.dataset.index) === activeIndex);
  });

  activeLabel.textContent = getDetailLabel(detail, currentLanguage);
  detailTitle.textContent = detail.title[currentLanguage];
  detailText.textContent = detail.text[currentLanguage];
  stripCount.textContent = detail.counter;
}

function previewCaseBackground(card) {
  const scene = getComputedStyle(card).getPropertyValue("--scene").trim();

  transitionSceneBackground(scene);
}

function resetCaseBackground() {
  transitionSceneBackground(defaultCaseScene);
}

cards.forEach((card) => {
  const index = Number(card.dataset.index);
  const activateCard = () => setActive(index);

  card.addEventListener("pointerenter", activateCard);
  card.addEventListener("pointermove", activateCard);
  card.addEventListener("mouseenter", () => setActive(index));
  card.addEventListener("focus", () => setActive(index));
  card.addEventListener("click", () => setActive(index));
});

filmCards.forEach((card) => {
  const previewCard = () => previewCaseBackground(card);

  card.addEventListener("pointerenter", previewCard);
  card.addEventListener("pointermove", previewCard);
  card.addEventListener("mouseenter", () => previewCaseBackground(card));
  card.addEventListener("focus", () => previewCaseBackground(card));
  card.addEventListener("click", () => previewCaseBackground(card));
});

rows.forEach((row) => {
  row.addEventListener("click", () => setActive(Number(row.dataset.index)));
});

if (langToggle) {
  langToggle.addEventListener("click", () => {
    const nextLanguage = currentLanguage === "zh" ? "en" : "zh";
    setLanguage(nextLanguage);
  });
}

installCaseBackgroundOverride();
setLanguage(currentLanguage);
})();
