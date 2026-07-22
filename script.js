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
    "site.label": "LONMA DYNAMIC 网站",
    "brand.home": "回到首页",
    "nav.label": "主导航",
    "nav.about": "关于",
    "nav.services": "业务",
    "nav.cases": "案例",
    "nav.contact": "联系",
    "hero.cnName": "龙马态度 · 二〇二六",
    "hero.note": "6 台改装车案例作为主展示，下面承接 LONMA DYNAMIC 的核心业务能力。",
    "hero.cta": "→ VIEW SERVICES",
    "cases.listLabel": "改装车案例列表",
    "cases.panelLabel": "改装车案例模块",
    "cases.heading": "LONMA-26-R1 · FEATURED BUILDS · 06 OF 36",
    "detail.status": "● CURRENT SELECTION",
    "services.sectionLabel": "业务展示模块",
    "services.heading": "CORE SERVICES",
    "services.count": "06 SERVICES · 03 × 02",
    "footer.attitude": "龙马态度 · 2026",
    "footer.contact": "开始你的项目 →",
    "lang.next": "Switch to English"
  },
  en: {
    "site.label": "LONMA DYNAMIC website",
    "brand.home": "Back to home",
    "nav.label": "Main navigation",
    "nav.about": "ABOUT",
    "nav.services": "SERVICES",
    "nav.cases": "CASES",
    "nav.contact": "CONTACT",
    "hero.cnName": "LONMA DYNAMIC · 2026",
    "hero.note": "Six featured builds introduce LONMA DYNAMIC, followed by the workshop's six core services.",
    "hero.cta": "→ VIEW SERVICES",
    "cases.listLabel": "Featured build list",
    "cases.panelLabel": "Featured build cards",
    "cases.heading": "LONMA-26-R1 · FEATURED BUILDS · 06 OF 36",
    "detail.status": "● CURRENT SELECTION",
    "services.sectionLabel": "Core services",
    "services.heading": "CORE SERVICES",
    "services.count": "06 SERVICES · 03 × 02",
    "footer.attitude": "AUTOMOTIVE ATTITUDE · 2026",
    "footer.contact": "START YOUR PROJECT →",
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
      en: "Street Widebody"
    },
    text: {
      zh: "以日常驾驶为基础，加入宽体外观、轮毂姿态和刹车升级，让整车视觉更有压迫感，同时保留通勤可用性。",
      en: "A street-focused widebody build shaped around daily drivability, wheel fitment, braking, and a more assertive stance."
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
      en: "Road & Track Setup"
    },
    text: {
      zh: "围绕刹车热衰、底盘支撑、轻量化和轮胎抓地做系统升级，让车辆更适合高强度驾驶。",
      en: "Braking, chassis support, weight, and tire grip developed for repeatable performance on road and track."
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
      en: "Low Stance"
    },
    text: {
      zh: "通过避震高度、轮毂数据和车身比例调整，把视觉重心压低，做出干净利落的街头姿态。",
      en: "Ride height, wheel fitment, and body clearance tuned together for a clean, usable low stance."
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
      en: "Turbo Tuning"
    },
    text: {
      zh: "在硬件升级后重新梳理进气、排气、增压和 ECU 标定，让动力输出更饱满也更可控。",
      en: "Intake, exhaust, boost control, and ECU calibration matched for stronger, more predictable power delivery."
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
      en: "Automotive Media Feature"
    },
    text: {
      zh: "以拍摄呈现为目标规划外观细节、灯光质感和成片风格，让改装成果更适合社媒传播。",
      en: "Exterior detail, lighting, location, and motion planned as one complete automotive media feature."
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
      en: "Blue Performance Build"
    },
    text: {
      zh: "以 BMW 风格蓝色作为视觉线索，结合外观细节、动力响应和拍摄呈现，做出更统一的性能车态度。",
      en: "Exterior, chassis, and power delivery developed around a single performance objective."
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
      en: "Custom Vehicle Builds"
    },
    text: {
      zh: "外观、轮毂、避震、刹车与整车风格升级方案。",
      en: "Exterior, wheels, suspension, and braking upgrades developed around one complete vehicle."
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
      en: "A curated selection of performance, exterior, wheel, suspension, and OEM-grade components."
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
      en: "Automotive Photography"
    },
    text: {
      zh: "静态拍摄、Rolling Shot、短视频与社交媒体内容制作。",
      en: "Still photography, rolling shots, short films, and social content created around the car."
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
      en: "Custom ECU calibration, data logging, road testing, and staged upgrade planning."
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
      en: "Ride height, wheel fitment, alignment, and chassis settings for street or track use."
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
      en: "Intake, downpipe, mid-pipe, and axle-back upgrades tuned for sound and response."
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
  shell.style.setProperty("--active-case-scene", scene);
  shell.dataset.currentScene = scene;
  shell.classList.remove("scene-is-fading");
  void shell.offsetWidth;
  shell.classList.add("scene-is-fading");
}

function getInitialLanguage() {
  try {
    const savedLanguage = sessionStorage.getItem("lonma-language");
    if (supportedLanguages.includes(savedLanguage)) {
      return savedLanguage;
    }
  } catch {
    // Storage can be unavailable in local previews without affecting page use.
  }

  return "en";
}

function setStoredLanguage(language) {
  try {
    sessionStorage.setItem("lonma-language", language);
  } catch {
    // Keep the current page functional when storage is unavailable.
  }
}

function translateStaticText(language) {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = translations[language][key] || translations.en[key] || element.textContent;
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    const key = element.dataset.i18nAria;
    element.setAttribute("aria-label", translations[language][key] || translations.en[key] || "");
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
  currentLanguage = supportedLanguages.includes(language) ? language : "en";
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  document.body.dataset.lang = currentLanguage;
  setStoredLanguage(currentLanguage);

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

  card.addEventListener("mouseenter", activateCard);
  card.addEventListener("focus", () => setActive(index));
  card.addEventListener("click", () => setActive(index));
});

filmCards.forEach((card) => {
  const previewCard = () => previewCaseBackground(card);

  card.addEventListener("mouseenter", previewCard);
  card.addEventListener("focus", () => previewCaseBackground(card));
  card.addEventListener("click", () => previewCaseBackground(card));
  card.addEventListener("mouseleave", resetCaseBackground);
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
