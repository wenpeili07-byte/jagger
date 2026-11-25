import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { caseBuildCatalog, caseBuildTags, caseDetails, serviceDetails, serviceExtras, serviceProcess } from "../detail-pages-data.mjs";
import { responsiveImages, srcsetFor } from "../image-performance.mjs";
import { renderSeoMeta, seoForRoute } from "../seo-data.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const escapeAttribute = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const escapeText = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const i18n = (tag, values, attributes = "") =>
  `<${tag}${attributes} data-zh="${escapeAttribute(values.zh)}" data-en="${escapeAttribute(values.en)}">${escapeText(values.en)}</${tag}>`;
const i18nAttribute = (attribute, values) =>
  `${attribute}="${escapeAttribute(values.en)}" data-zh-${attribute}="${escapeAttribute(values.zh)}" data-en-${attribute}="${escapeAttribute(values.en)}"`;
const responsiveImageAttributes = (source, prefix, sizes, { priority = false } = {}) => {
  const record = responsiveImages.find((candidate) => candidate.source === source);
  if (!record) return "";

  return [
    `srcset="${srcsetFor(record.id, prefix)}"`,
    `sizes="${sizes}"`,
    `width="${record.sourceWidth}"`,
    `height="${record.sourceHeight}"`,
    priority ? 'fetchpriority="high"' : 'loading="lazy"',
    'decoding="async"',
  ].join(" ");
};

const header = (section) => `<header class="topbar">
    <a class="brand" href="../../index.html" ${i18nAttribute("aria-label", { zh: "回到首页", en: "Back to home" })}>LONMA DYNAMIC</a>
    <nav class="nav" ${i18nAttribute("aria-label", { zh: "主导航", en: "Main navigation" })}>
      <a href="../about.html">ABOUT</a>
      <a href="../services.html"${section === "services" ? ' aria-current="page"' : ""}>SERVICES</a>
      <a href="../cases.html"${section === "cases" ? ' aria-current="page"' : ""}>CASES</a>
      <a href="../contact.html">CONTACT</a>
      <a href="../shop.html">SHOP</a>
    </nav>
    <div class="top-actions">
      <a class="project-entry" href="../project.html">
        ${i18n("span", { zh: "开始项目", en: "START PROJECT" }, ' class="project-entry-label-full"')}
        ${i18n("span", { zh: "规划", en: "BUILD" }, ' class="project-entry-label-compact"')}
      </a>
      <button class="lang-toggle" type="button" aria-label="切换到中文">
        <span class="lang-option" data-lang-option="zh">中</span>
        <span class="lang-separator" aria-hidden="true">/</span>
        <span class="lang-option is-current" data-lang-option="en">EN</span>
      </button>
    </div>
  </header>`;

const globalFooter = (projectHref = "../contact.html") => `<footer class="content-footer">
        <span>LONMA DYNAMIC</span>
        <span data-zh="龙马态度 · 2026" data-en="AUTOMOTIVE ATTITUDE · 2026">AUTOMOTIVE ATTITUDE · 2026</span>
        <a href="${projectHref}" data-zh="开始你的项目 →" data-en="START YOUR PROJECT →">START YOUR PROJECT →</a>
      </footer>`;


const buildTagsFor = (record) =>
  (caseBuildTags[record.id] || []).map((tag, index) => ({
    ...caseBuildCatalog[tag.key],
    ...tag,
    number: String(index + 1).padStart(2, "0"),
  }));

const buildLinkCopy = (tag) =>
  tag.kind === "service"
    ? { zh: "查看服务 →", en: "VIEW SERVICE →" }
    : { zh: "分类参考 · 商店 →", en: "CATEGORY · SHOP →" };

const renderHotspots = (tags) => {
  const placed = tags.filter((tag) => Number.isFinite(tag.x) && Number.isFinite(tag.y));
  if (!placed.length) return "";

  return `<div class="build-hotspots" data-build-hotspots>
          ${placed.map((tag) => `<a class="build-hotspot" href="${tag.href}" data-build-key="${tag.key}" data-x="${tag.x}" data-y="${tag.y}" style="--x: ${tag.x}%; --y: ${tag.y}%" ${i18nAttribute("aria-label", { zh: `${tag.label.zh}：${tag.title.zh}`, en: `${tag.label.en}: ${tag.title.en}` })}>
            <span class="build-hotspot-dot" aria-hidden="true"></span>
            ${i18n("span", { zh: `${tag.number} · ${tag.label.zh}`, en: `${tag.number} · ${tag.label.en}` }, ' class="build-hotspot-label"')}
          </a>`).join("\n          ")}
        </div>`;
};

const renderBuildCards = (tags) => `<div class="build-cards">
              ${tags.map((tag) => `<a class="build-card" href="${tag.href}" data-build-key="${tag.key}" data-build-reveal>
                <span class="build-card-media"><img src="../../${tag.image}" ${responsiveImageAttributes(tag.image, "../../", "(max-width: 768px) 50vw, 20vw") || 'loading="lazy" decoding="async"'} alt="" /></span>
                ${i18n("span", { zh: tag.number, en: tag.number }, ' class="build-card-index"')}
                ${i18n("span", tag.label, ' class="build-card-label"')}
                ${i18n("strong", tag.title)}
                ${i18n("span", buildLinkCopy(tag), ' class="build-card-link"')}
              </a>`).join("\n              ")}
            </div>`;

const stepHead = (number, kicker) => `<span class="case-step-node" aria-hidden="true"></span>
            ${i18n("span", { zh: number, en: number }, ' class="case-step-index"')}
            ${i18n("p", kicker, ' class="case-step-kicker"')}`;

const renderBuildStage = (record, { titleId }) => {
  const tags = buildTagsFor(record);
  if (!tags.length) return "";
  const cover = responsiveImages.find((candidate) => candidate.source === record.image);
  const ratio = cover ? `${cover.sourceWidth} / ${cover.sourceHeight}` : "4 / 5";

  return `<section class="case-build-stage" data-build-stage aria-labelledby="${titleId}">
        <div class="case-build-copy">
          ${i18n("p", { zh: "买同款", en: "SHOP THE BUILD" }, ' class="detail-story-label"')}
          ${i18n("h2", { zh: "这台车用到的部件方向", en: "WHAT WENT INTO THIS CAR" }, ` id="${titleId}"`)}
          ${i18n("p", { zh: "点击车上的标记或列表查看分类。以下为分类参考，具体型号以到店评估为准。", en: "Tap a marker or a row to explore each category. These are category references; exact specification is confirmed after assessment." }, ' class="case-build-note"')}
          <ol class="case-build-index">
            ${tags.map((tag) => `<li><a class="build-row" href="${tag.href}" data-build-key="${tag.key}">
              ${i18n("span", { zh: tag.number, en: tag.number }, ' class="build-row-index"')}
              ${i18n("span", tag.label, ' class="build-row-label"')}
              ${i18n("strong", tag.title)}
              ${i18n("span", buildLinkCopy(tag), ' class="build-row-link"')}
            </a></li>`).join("\n            ")}
          </ol>
        </div>
        <figure class="case-build-figure" data-build-cover style="aspect-ratio: ${ratio}">
          <img src="../../${record.image}" ${responsiveImageAttributes(record.image, "../../", "(max-width: 768px) 100vw, 46vw")} ${i18nAttribute("alt", { zh: `LONMA DYNAMIC ${record.title.zh} 整车`, en: `LONMA DYNAMIC ${record.title.en} full car` })} />
          ${renderHotspots(tags)}
        </figure>
      </section>`;
};

const chapterTag = (tag) => tag
  ? `<a class="build-tag" href="${tag.href}" data-build-key="${tag.key}">${i18n("span", tag.label)}${i18n("span", tag.kind === "service" ? { zh: "查看服务 →", en: "VIEW SERVICE →" } : tag.kind === "case" ? { zh: "查看案例 →", en: "VIEW CASE →" } : { zh: "买同款 →", en: "SHOP THE PART →" }, ' class="build-tag-link"')}</a>`
  : "";

const partChapters = (tags) => tags.map((tag) => ({
  kicker: { zh: `部件 · ${tag.label.zh}`, en: `COMPONENT · ${tag.label.en}` },
  title: tag.title,
  body: tag.note,
  image: tag.image,
  alt: { zh: `分类参考：${tag.title.zh}`, en: `Category reference: ${tag.title.en}` },
  tag,
}));

const renderChapters = (chapters, { label, heading }) => {
  const total = String(chapters.length).padStart(2, "0");
  const imageAttributes = (image) => responsiveImageAttributes(image, "../../", "(max-width: 1000px) 100vw, 56vw") || 'loading="lazy" decoding="async"';

  return `<section class="case-chapters" data-case-chapters>
          <header class="case-chapters-head">
            ${i18n("p", label, ' class="detail-story-label"')}
            ${i18n("h2", heading)}
          </header>
          <div class="case-chapters-steps" data-case-process>
            ${chapters.map((chapter, index) => {
              const number = String(index + 1).padStart(2, "0");
              return `<article class="case-chapter${index === 0 ? " is-active" : ""}" data-chapter="${index}">
              <span class="case-step-node" aria-hidden="true"></span>
              ${i18n("span", { zh: number, en: number }, ' class="case-step-index"')}
              ${i18n("p", chapter.kicker, ' class="case-step-kicker"')}
              ${chapter.html || `${i18n("h3", chapter.title)}
              ${i18n("p", chapter.body, ' class="case-chapter-body"')}`}${chapter.tag ? `
              <p class="case-chapter-shop">${chapterTag(chapter.tag)}</p>` : ""}
            </article>`;
            }).join("\n            ")}
          </div>
          <div class="case-chapters-frame">
            ${chapters.map((chapter, index) => `<figure class="${chapter.figureClass || "case-chapter-media"}${chapter.crop ? " is-detail-crop" : ""}${index === 0 ? " is-active" : ""}" data-chapter-media="${index}">
              <img src="../../${chapter.image}" ${imageAttributes(chapter.image)} ${chapter.alt ? i18nAttribute("alt", chapter.alt) : 'alt=""'} />${chapter.tag ? `
              ${chapterTag(chapter.tag)}` : ""}
            </figure>`).join("\n            ")}
            <p class="case-chapters-count" aria-hidden="true"><span data-chapter-current>01</span> / ${total}</p>
            <span class="case-chapters-bar" aria-hidden="true"><span></span></span>
          </div>
        </section>`;
};


const nextCaseBanner = (record) => {
  const next = caseDetails.find(({ id }) => id === record.next);
  if (!next) return "";

  return `<a class="case-next" href="./case-${next.id}.html" ${i18nAttribute("aria-label", { zh: `下一案例 ${next.id}：${next.title.zh}`, en: `Next case ${next.id}: ${next.title.en}` })}>
        <img src="../../${next.image}" ${responsiveImageAttributes(next.image, "../../", "100vw")} alt="" />
        <span class="case-next-copy">
          ${i18n("span", { zh: "下一案例", en: "NEXT CASE" }, ' class="case-next-label"')}
          ${i18n("span", { zh: next.id, en: next.id }, ' class="case-next-number"')}
          ${i18n("strong", next.title)}
          ${i18n("span", next.subtitle, ' class="case-next-subtitle"')}
        </span>
        <span class="case-next-arrow" aria-hidden="true">→</span>
      </a>`;
};

const renderGenericCasePage = (record) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeAttribute(record.meta)}" />
    <title>Case ${record.id} | LONMA DYNAMIC</title>
    <!-- SEO:START -->
    ${renderSeoMeta(seoForRoute(`/pages/cases/case-${record.id}`))}
    <!-- SEO:END -->
    <link rel="stylesheet" href="../../styles.css?v=sanity-case-cms-20260801" />
    <link rel="stylesheet" href="../../layout-canvas.css?v=sanity-case-cms-20260801" />
    <link rel="stylesheet" href="../../case-detail.css?v=sanity-case-cms-20260801" />
    <link rel="stylesheet" href="../../case-build.css?v=case-build-hotspot-20261125" />
    <link rel="stylesheet" href="../../mobile-experience.css?v=mobile-coordination-20260728" />
  </head>
  <body data-section="cases">
    <main class="site-shell case-detail-page" data-detail-page data-case-slug="case-${record.id}">
      ${header("cases")}
      <section class="detail-hero">
        <div class="detail-copy">
          ${i18n("a", { zh: "← 返回案例", en: "← BACK TO CASES" }, ' class="detail-back" href="../cases.html"')}
          <p class="detail-index" data-cms="caseNumber">CASE ${record.id}</p>
          ${i18n("h1", record.title, ' data-cms="title"')}
          ${i18n("h2", record.subtitle, ' data-cms="subtitle"')}
          ${i18n("p", record.intro, ' class="detail-intro" data-cms="lede"')}
        </div>
        <figure class="detail-hero-media">
          <img data-cms="cover" src="../../${record.image}" ${responsiveImageAttributes(record.image, "../../", "(max-width: 768px) 100vw, 50vw", { priority: true })} ${i18nAttribute("alt", { zh: `LONMA DYNAMIC ${record.title.zh}`, en: `LONMA DYNAMIC ${record.title.en}` })} />
        </figure>
      </section>
      ${renderBuildStage(record, { titleId: `case${record.id}-build-title` })}
      ${renderChapters([
        {
          kicker: { zh: "评估 · 方向", en: "ASSESS · DIRECTION" },
          html: `<div class="detail-story">
                ${i18n("h3", record.subtitle)}
                ${i18n("p", record.story, ' data-cms="story"')}
              </div>`,
          image: record.image,
          alt: { zh: `${record.title.zh} 细节`, en: `${record.title.en} detail` },
          crop: true,
        },
        ...partChapters(buildTagsFor(record)),
      ], { label: { zh: "改装流程", en: "THE PROCESS" }, heading: { zh: "从目标到整车", en: "FROM BRIEF TO BUILD" } })}
      <div class="detail-media-sections" data-cms-media-sections></div>
      <section class="detail-contact">
        ${i18n("h2", { zh: "讨论你的下一台车", en: "DISCUSS YOUR NEXT BUILD" })}
        ${i18n("a", { zh: "开始咨询 →", en: "START AN INQUIRY →" }, ' href="../contact.html"')}
      </section>
      <nav class="detail-pagination" ${i18nAttribute("aria-label", { zh: "案例分页", en: "Case pagination" })}>
        ${i18n("a", { zh: `← 上一案例 ${record.previous}`, en: `← CASE ${record.previous}` }, ` href="./case-${record.previous}.html" data-cms-pagination="previous"`)}
        ${i18n("a", { zh: `下一案例 ${record.next} →`, en: `CASE ${record.next} →` }, ` href="./case-${record.next}.html" data-cms-pagination="next"`)}
      </nav>
      ${nextCaseBanner(record)}
      ${globalFooter()}
    </main>
    <script src="../../content-pages.js?v=sanity-case-cms-20260801"></script>
    <script type="module" src="../../sanity-case-detail.js?v=sanity-case-cms-20260801"></script>
    <script src="../../case-build.js?v=case-build-20261124" defer></script>
  </body>
</html>
`;

export const renderCase02Page = (record) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeAttribute(record.meta)}" />
    <title>Case ${record.id} | LONMA DYNAMIC</title>
    <!-- SEO:START -->
    ${renderSeoMeta(seoForRoute(`/pages/cases/case-${record.id}`))}
    <!-- SEO:END -->
    <link rel="stylesheet" href="../../styles.css?v=sanity-case-cms-20260801" />
    <link rel="stylesheet" href="../../layout-canvas.css?v=sanity-case-cms-20260801" />
    <link rel="stylesheet" href="../../case-detail.css?v=sanity-case-cms-20260801" />
    <link rel="stylesheet" href="../../case-build.css?v=case-build-hotspot-20261125" />
    <link rel="stylesheet" href="../../case-02.css?v=case02-mobile-20261124" />
    <link rel="stylesheet" href="../../mobile-experience.css?v=mobile-coordination-20260728" />
  </head>
  <body data-section="cases">
    <main class="site-shell case-detail-page case02-page" data-detail-page data-case-slug="case-02">
      ${header("cases")}
      <section class="case02-video-stage" data-video-state="poster-only" aria-labelledby="case02-title">
        <video
          data-case-video data-cms="poster"
          poster="../../assets/images/generated/case-02/case-02-960w.webp"
          controls
          preload="metadata"
          aria-label="Case 02 project film"
          data-en-aria-label="Case 02 project film"
          data-zh-aria-label="案例 02 项目影片"
        ></video>
        <div class="case02-video-copy">
          ${i18n("a", { zh: "← 返回案例", en: "← BACK TO CASES" }, ' href="../cases.html"')}
          <p data-cms="caseNumber">CASE ${record.id}</p>
          ${i18n("h1", record.title, ' id="case02-title" data-cms="title"')}
          <dl>
            <div>${i18n("dt", { zh: "车辆", en: "VEHICLE" })}<dd data-cms="vehicleModel">BMW G80 M3</dd></div>
            <div>${i18n("dt", { zh: "年份", en: "YEAR" })}<dd data-cms="vehicleYear">2024</dd></div>
          </dl>
        </div>
        ${i18n("button", { zh: "完整影片即将上线", en: "FINAL FILM COMING SOON" }, ' type="button" class="case02-video-status" disabled')}
      </section>
      ${renderBuildStage(record, { titleId: "case02-build-title" })}
      <div class="case02-story" data-cms-media-sections>
        ${renderChapters([
          {
            kicker: { zh: "方向 · 刹车", en: "DIRECTION · BRAKES" },
            title: { zh: "改装方向", en: "THE DIRECTION" },
            body: {
              zh: "提升响应，同时保留车辆在真实道路中的完整性。刹车、底盘反馈与轮毂数据作为一个系统共同调整。",
              en: "Sharper response without turning the car into a single-purpose machine. Braking, chassis feedback, and wheel fitment are considered as one system.",
            },
            image: "assets/images/shop/brake-kit.webp",
            alt: { zh: "分类参考图片：刹车系统", en: "Category reference image: brake system" },
            figureClass: "case02-story-media case-chapter-media",
            tag: buildTagsFor(record).find(({ key }) => key === "brakes"),
          },
          {
            kicker: { zh: "测试 · 避震", en: "TEST · SUSPENSION" },
            title: { zh: "测试、调整、再测试", en: "TEST, ADJUST, REPEAT" },
            body: {
              zh: "每一次变化都通过真实驾驶、轮胎状态与驾驶反馈判断。持续调整，直到整车形成统一响应。",
              en: "Each change is judged through real driving, tire condition, and driver feedback. The setup evolves until the car responds as one complete package.",
            },
            image: "assets/images/shop/coilover-kit.webp",
            alt: { zh: "分类参考图片：底盘设定", en: "Category reference image: chassis setup" },
            figureClass: "case02-story-media case-chapter-media",
            tag: buildTagsFor(record).find(({ key }) => key === "suspension"),
          },
          {
            ...partChapters(buildTagsFor(record).filter(({ key }) => key === "wheels"))[0],
            alt: { zh: "分类参考图片：锻造轮毂", en: "Category reference image: forged wheel" },
            figureClass: "case02-story-media case-chapter-media",
          },
          ...partChapters(buildTagsFor(record).filter(({ key }) => key === "ecu")).map((chapter) => ({ ...chapter, alt: { zh: "案例 04 发动机舱", en: "Case 04 engine bay" } })),
        ], { label: { zh: "改装流程", en: "THE PROCESS" }, heading: { zh: "一步步完成整车", en: "ONE STEP AT A TIME" } })}
      </div>
      <section class="detail-contact">
        ${i18n("h2", { zh: "讨论你的下一台车", en: "DISCUSS YOUR NEXT BUILD" })}
        ${i18n("a", { zh: "开始咨询 →", en: "START AN INQUIRY →" }, ' href="../contact.html?service=Custom%20Vehicle%20Builds&amp;vehicle=2024%20BMW%20G80%20M3&amp;message=Case%2002%20road%20and%20track%20direction."')}
      </section>
      <nav class="detail-pagination" ${i18nAttribute("aria-label", { zh: "案例分页", en: "Case pagination" })}>
        ${i18n("a", { zh: `← 上一案例 ${record.previous}`, en: `← CASE ${record.previous}` }, ` href="./case-${record.previous}.html" data-cms-pagination="previous"`)}
        ${i18n("a", { zh: `下一案例 ${record.next} →`, en: `CASE ${record.next} →` }, ` href="./case-${record.next}.html" data-cms-pagination="next"`)}
      </nav>
      ${nextCaseBanner(record)}
      ${globalFooter()}
    </main>
    <script src="../../content-pages.js?v=sanity-case-cms-20260801"></script>
    <script src="../../case-02.js?v=sanity-case-cms-20260801"></script>
    <script type="module" src="../../sanity-case-detail.js?v=sanity-case-cms-20260801"></script>
    <script src="../../case-build.js?v=case-build-20261124" defer></script>
  </body>
</html>
`;

export const renderCasePage = (record) =>
  record.id === "02" ? renderCase02Page(record) : renderGenericCasePage(record);

const serviceRelatedCases = (extras) =>
  caseDetails.filter((record) => (caseBuildTags[record.id] || []).some(({ key }) => extras.keys.includes(key)));

const serviceShopTags = (extras) =>
  extras.shop.map((key, index) => ({ ...caseBuildCatalog[key], key, number: String(index + 1).padStart(2, "0") }));

const caseTag = (record) => ({
  key: `case-${record.id}`,
  label: { zh: `案例 ${record.id}`, en: `CASE ${record.id}` },
  href: `../cases/case-${record.id}.html`,
  kind: "case",
});

export const renderServicePage = (record) => {
  const projectHref = record.id === "build"
    ? "../project.html"
    : "../contact.html";
  const extras = serviceExtras[record.id];
  const related = serviceRelatedCases(extras);
  const shopTags = serviceShopTags(extras);
  const heroCase = caseDetails.find((candidate) => candidate.image === record.image);
  const allowedHeroKeys = new Set([...extras.keys, ...extras.shop]);
  const heroTags = heroCase
    ? buildTagsFor(heroCase).filter((tag) => allowedHeroKeys.has(tag.key))
    : [];
  const chapterImages = [
    ...related.map((item) => ({ image: item.image, tag: caseTag(item), alt: { zh: `案例 ${item.id} ${item.title.zh}`, en: `Case ${item.id} ${item.title.en}` } })),
    ...shopTags.map((tag) => ({ image: tag.image, tag, alt: { zh: `分类参考：${tag.title.zh}`, en: `Category reference: ${tag.title.en}` } })),
  ];
  const chapters = serviceProcess.map((step, index) => {
    const media = index === 0
      ? { image: record.image, crop: true, alt: { zh: `${record.title.zh} 细节`, en: `${record.title.en} detail` }, tag: heroTags[0] }
      : chapterImages[(index - 1) % Math.max(1, chapterImages.length)] || { image: record.image, crop: true, alt: { zh: record.title.zh, en: record.title.en } };
    return {
      kicker: { zh: `${step.kicker.zh} · ${step.kicker.en}`, en: step.kicker.en },
      title: step.title,
      body: step.body,
      ...media,
    };
  });

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeAttribute(record.meta)}" />
    <title>${record.label} | LONMA DYNAMIC</title>
    <!-- SEO:START -->
    ${renderSeoMeta(seoForRoute(`/pages/services/${record.id}`))}
    <!-- SEO:END -->
    <link rel="stylesheet" href="../../styles.css?v=sanity-case-cms-20260801" />
    <link rel="stylesheet" href="../../layout-canvas.css?v=sanity-case-cms-20260801" />
    <link rel="stylesheet" href="../../service-detail.css?v=service-touch-20261124" />
    <link rel="stylesheet" href="../../case-build.css?v=case-build-hotspot-20261125" />
    <link rel="stylesheet" href="../../mobile-experience.css?v=mobile-coordination-20260728" />
  </head>
  <body data-section="services">
    <main class="site-shell service-detail-page" data-detail-page>
      ${header("services")}
      <section class="detail-hero">
        <div class="detail-copy">
          <span class="service-number" aria-hidden="true">${record.number}</span>
          ${i18n("a", { zh: "← 返回业务", en: "← BACK TO SERVICES" }, ' class="detail-back" href="../services.html"')}
          <p class="detail-index">${record.number} · ${record.label}</p>
          ${i18n("h1", record.title)}
          ${i18n("p", record.intro, ' class="detail-intro"')}
        </div>
        <figure class="detail-hero-media" data-build-stage data-build-cover>
          <img src="../../${record.image}" ${responsiveImageAttributes(record.image, "../../", "(max-width: 768px) 100vw, 50vw", { priority: true })} ${i18nAttribute("alt", { zh: `LONMA DYNAMIC ${record.title.zh}`, en: `LONMA DYNAMIC ${record.title.en}` })} />${heroTags.length ? `
          ${renderHotspots(heroTags)}` : ""}
        </figure>
      </section>
      <section class="detail-story">
        ${i18n("p", record.scope)}
        ${i18n("p", { zh: "沟通目标 · 规划方案 · 执行调整 · 完成复查", en: "ASSESS · PLAN · EXECUTE · VERIFY" }, ' class="detail-process"')}
        ${i18n("span", { zh: "服务理念", en: "THE APPROACH" }, ' class="service-label service-story-label"')}
      </section>
      <section class="service-sheet">
        <aside class="service-sheet-aside">
          ${i18n("span", { zh: "服务资料", en: "SERVICE SHEET" }, ' class="service-label"')}
          ${i18n("h2", record.title)}
          <dl>
            <div>${i18n("dt", { zh: "服务", en: "SERVICE" })}<dd>${record.number} / ${String(serviceDetails.length).padStart(2, "0")}</dd></div>
            <div>${i18n("dt", { zh: "重点", en: "FOCUS" })}${i18n("dd", extras.focus)}</div>
            <div>${i18n("dt", { zh: "方法", en: "METHOD" })}${i18n("dd", extras.method)}</div>
            <div>${i18n("dt", { zh: "相关案例", en: "RELATED BUILDS" })}<dd>${String(related.length).padStart(2, "0")}</dd></div>
          </dl>
          ${i18n("a", { zh: "提交车辆信息 →", en: "SEND VEHICLE DETAILS →" }, ` class="service-sheet-cta" href="${projectHref}"`)}
          ${i18n("a", record.id === "build" ? { zh: "直接联系我们 →", en: "CONTACT US DIRECTLY →" } : { zh: "规划完整改装 →", en: "PLAN A COMPLETE BUILD →" }, ` class="service-sheet-link" href="${record.id === "build" ? "../contact.html" : "../project.html"}"`)}
        </aside>
        <div class="service-sheet-main">
          <section class="service-block">
            ${i18n("h3", { zh: "01 · 服务内容", en: "01 · WHAT'S INCLUDED" }, ' class="service-label"')}
            <ol class="service-included">
              ${extras.included.map((item, index) => `<li>${i18n("span", { zh: String(index + 1).padStart(2, "0"), en: String(index + 1).padStart(2, "0") }, ' class="service-included-index"')}${i18n("strong", item)}</li>`).join("\n              ")}
            </ol>
          </section>
          ${shopTags.length ? `<section class="service-block">
            ${i18n("h3", { zh: "02 · 搭配部件", en: "02 · PAIRS WELL WITH" }, ' class="service-label"')}
            ${i18n("p", { zh: "分类参考，具体型号以到店评估为准。", en: "Category references; exact specification is confirmed after assessment." }, ' class="service-block-note"')}
            ${renderBuildCards(shopTags)}
          </section>` : ""}
        </div>
      </section>
      ${related.length ? `<section class="service-proof">
        <header class="service-proof-head">
          <div>
            ${i18n("span", { zh: "做过的车", en: "PROOF" }, ' class="service-label"')}
            ${i18n("h2", { zh: "用过这项服务的案例", en: "BUILDS THAT USED THIS SERVICE" })}
          </div>
          ${i18n("a", { zh: "全部案例 →", en: "ALL CASES →" }, ' class="service-proof-all" href="../cases.html"')}
        </header>
        <div class="service-proof-track">
          ${related.map((item) => `<a class="service-proof-card" href="../cases/case-${item.id}.html">
            <img src="../../${item.image}" ${responsiveImageAttributes(item.image, "../../", "(max-width: 768px) 80vw, 30vw") || 'loading="lazy" decoding="async"'} alt="" />
            <span class="service-proof-copy">
              ${i18n("span", { zh: `案例 ${item.id}`, en: `CASE ${item.id}` }, ' class="service-proof-index"')}
              ${i18n("strong", item.title)}
              ${i18n("span", item.subtitle, ' class="service-proof-sub"')}
            </span>
          </a>`).join("\n          ")}
        </div>
      </section>` : ""}
      ${renderChapters(chapters, { label: { zh: "合作流程", en: "HOW WE WORK" }, heading: { zh: "一步步完成", en: "ONE STEP AT A TIME" } })}
      <section class="detail-contact">
        <div>
          <p class="service-contact-index">${record.number} · ${record.label}</p>
          ${i18n("h2", { zh: "开始你的项目", en: "START YOUR PROJECT" })}
        </div>
        ${i18n("a", { zh: "提交车辆信息 →", en: "SEND VEHICLE DETAILS →" }, ` href="${projectHref}"`)}
      </section>
      ${globalFooter(projectHref)}
    </main>
    <script src="../../content-pages.js?v=sanity-case-cms-20260801"></script>
    <script src="../../case-build.js?v=case-build-20261124" defer></script>
  </body>
</html>
`;
};

export async function writeDetailPages() {
  await mkdir(resolve(root, "pages/cases"), { recursive: true });
  await mkdir(resolve(root, "pages/services"), { recursive: true });

  for (const record of caseDetails) {
    await writeFile(resolve(root, `pages/cases/case-${record.id}.html`), renderCasePage(record));
  }

  for (const record of serviceDetails) {
    await writeFile(resolve(root, `pages/services/${record.id}.html`), renderServicePage(record));
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await writeDetailPages();
}
