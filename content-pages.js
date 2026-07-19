(() => {
  const supportedLanguages = ["zh", "en"];
  const langToggle = document.querySelector(".lang-toggle");
  const languageOptions = [...document.querySelectorAll("[data-lang-option]")];
  const translatedNodes = [...document.querySelectorAll("[data-zh][data-en]")];
  const placeholderNodes = [...document.querySelectorAll("[data-zh-placeholder][data-en-placeholder]")];
  const navLinks = [...document.querySelectorAll(".nav a")];
  const contactForm = document.querySelector("[data-contact-form]");
  const contactStatus = document.querySelector("[data-contact-status]");
  const navLabels = {
    "about.html": { zh: "关于", en: "ABOUT" },
    "services.html": { zh: "业务", en: "SERVICES" },
    "cases.html": { zh: "案例", en: "CASES" },
    "contact.html": { zh: "联系", en: "CONTACT" },
  };
  let currentLanguage = getInitialLanguage();

  function getInitialLanguage() {
    try {
      const savedLanguage = localStorage.getItem("lonma-language");
      if (supportedLanguages.includes(savedLanguage)) {
        return savedLanguage;
      }
    } catch {
      // File previews can block storage without affecting page use.
    }

    return document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "zh";
  }

  function setStoredLanguage(language) {
    try {
      localStorage.setItem("lonma-language", language);
    } catch {
      // Keep the current page functional when storage is unavailable.
    }
  }

  function updateNavigation(language) {
    const currentSection = document.body.dataset.section;

    navLinks.forEach((link) => {
      const pageName = link.getAttribute("href").split("/").pop();
      const pageSection = pageName.replace(/\.html$/, "");
      const labels = navLabels[pageName];

      if (labels) {
        link.textContent = labels[language];
      }

      if (currentSection === pageSection || window.location.pathname.endsWith(pageName)) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function updateLanguageToggle(language) {
    languageOptions.forEach((option) => {
      option.classList.toggle("is-current", option.dataset.langOption === language);
    });

    if (langToggle) {
      langToggle.setAttribute("aria-label", language === "zh" ? "Switch to English" : "切换到中文");
    }
  }

  function setLanguage(language) {
    currentLanguage = supportedLanguages.includes(language) ? language : "zh";
    document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
    document.body.dataset.lang = currentLanguage;

    translatedNodes.forEach((node) => {
      node.textContent = node.dataset[currentLanguage];
    });

    placeholderNodes.forEach((node) => {
      node.setAttribute("placeholder", node.dataset[`${currentLanguage}Placeholder`]);
    });

    updateNavigation(currentLanguage);
    updateLanguageToggle(currentLanguage);
    setStoredLanguage(currentLanguage);
  }

  if (langToggle) {
    langToggle.addEventListener("click", () => {
      setLanguage(currentLanguage === "zh" ? "en" : "zh");
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const subject = `[LONMA DYNAMIC] ${formData.get("service")} · ${formData.get("vehicle")}`;
      const body = [
        `Name: ${formData.get("name")}`,
        `Email: ${formData.get("email")}`,
        `Vehicle: ${formData.get("vehicle")}`,
        `Service: ${formData.get("service")}`,
        "",
        `${formData.get("message")}`,
      ].join("\n");

      if (contactStatus) {
        contactStatus.textContent = currentLanguage === "zh" ? "正在打开邮件应用…" : "Opening your email app…";
      }

      window.location.href = `mailto:hello@lonmadynamic.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  setLanguage(currentLanguage);

  const serviceRows = Array.from(document.querySelectorAll("[data-service-row]"));

  const setActiveServiceRow = (activeRow) => {
    serviceRows.forEach((row) => {
      row.toggleAttribute("data-active", row === activeRow);
    });
  };

  serviceRows.forEach((row) => {
    row.addEventListener("pointerenter", () => setActiveServiceRow(row));
    row.addEventListener("focusin", () => setActiveServiceRow(row));
  });
})();
