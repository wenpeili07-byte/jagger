import { caseDetails, serviceDetails } from "./detail-pages-data.mjs";

export const siteOrigin = "https://jagger-sage.vercel.app";

const defaultImage = "/assets/images/%E7%BD%91%E9%A1%B5/%E9%A6%96%E9%A1%B5%E8%83%8C%E6%99%AF.jpg";
const caseImage = (id) => `/assets/images/%E7%BD%91%E9%A1%B5/optimized/case-${id}.jpg`;

const corePages = [
  {
    file: "index.html",
    route: "/",
    title: "LONMA DYNAMIC | Performance Journal",
    description: "LONMA DYNAMIC creates complete vehicle builds, supplies performance parts, produces automotive photography, and provides ECU calibration, chassis setup, and intake and exhaust upgrades.",
    image: defaultImage,
  },
  {
    file: "pages/about.html",
    route: "/pages/about",
    title: "About | LONMA DYNAMIC",
    description: "Learn how LONMA DYNAMIC develops complete vehicle builds through observation, purposeful modification, real-world testing, and refinement.",
    image: defaultImage,
  },
  {
    file: "pages/services.html",
    route: "/pages/services",
    title: "Services | LONMA DYNAMIC",
    description: "Explore LONMA DYNAMIC services for custom vehicle builds, performance parts, automotive photography, ECU calibration, chassis setup, and intake and exhaust upgrades.",
    image: defaultImage,
  },
  {
    file: "pages/cases.html",
    route: "/pages/cases",
    title: "Cases | LONMA DYNAMIC",
    description: "Explore LONMA DYNAMIC vehicle builds, including widebody, road and track, stance, turbo tuning, automotive media, and complete performance projects.",
    image: caseImage("01"),
  },
  {
    file: "pages/contact.html",
    route: "/pages/contact",
    title: "Contact | LONMA DYNAMIC",
    description: "Contact LONMA DYNAMIC about your vehicle, current setup, intended use, and goals for a complete build or focused upgrade.",
    image: caseImage("06"),
  },
  {
    file: "pages/project.html",
    route: "/pages/project",
    title: "Project Planner | LONMA DYNAMIC",
    description: "Start a LONMA DYNAMIC vehicle project.",
    image: caseImage("02"),
  },
  {
    file: "pages/shop.html",
    route: "/pages/shop",
    title: "Shop | LONMA DYNAMIC",
    description: "Browse sample performance-part categories for a selected vehicle and contact LONMA DYNAMIC for fitment and installation details.",
    image: "/assets/images/shop/forged-wheel.webp",
  },
  {
    file: "pages/shop/forged-wheel.html",
    route: "/pages/shop/forged-wheel",
    title: "Monoblock Forged Wheel | LONMA DYNAMIC",
    description: "Configure a forged wheel direction and request final fitment verification from LONMA DYNAMIC.",
    image: "/assets/images/shop/forged-wheel.webp",
  },
];

const casePages = caseDetails.map((record) => ({
  file: `pages/cases/case-${record.id}.html`,
  route: `/pages/cases/case-${record.id}`,
  title: `Case ${record.id} | LONMA DYNAMIC`,
  description: record.meta,
  image: caseImage(record.id),
}));

const servicePages = serviceDetails.map((record) => ({
  file: `pages/services/${record.id}.html`,
  route: `/pages/services/${record.id}`,
  title: `${record.label} | LONMA DYNAMIC`,
  description: record.meta,
  image: caseImage(record.number),
}));

export const publicPages = Object.freeze([
  ...corePages,
  ...casePages,
  ...servicePages,
]);

export const seoForRoute = (route) => {
  const page = publicPages.find((record) => record.route === route);
  if (!page) throw new Error(`Unknown public route: ${route}`);
  return page;
};

const escapeAttribute = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

export const renderSeoMeta = (page) => {
  const url = `${siteOrigin}${page.route}`;
  const image = `${siteOrigin}${page.image}`;

  return [
    `<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />`,
    `<link rel="canonical" href="${escapeAttribute(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="LONMA DYNAMIC" />`,
    `<meta property="og:title" content="${escapeAttribute(page.title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(page.description)}" />`,
    `<meta property="og:url" content="${escapeAttribute(url)}" />`,
    `<meta property="og:image" content="${escapeAttribute(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttribute(page.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttribute(page.description)}" />`,
    `<meta name="twitter:image" content="${escapeAttribute(image)}" />`,
  ].join("\n    ");
};
