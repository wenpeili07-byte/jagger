import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { caseDetails, serviceDetails } from "../detail-pages-data.mjs";

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

const renderGenericCasePage = (record) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeAttribute(record.meta)}" />
    <title>Case ${record.id} | LONMA DYNAMIC</title>
    <link rel="stylesheet" href="../../styles.css?v=three-page-expansion-20260726" />
    <link rel="stylesheet" href="../../layout-canvas.css?v=three-page-expansion-20260726" />
    <link rel="stylesheet" href="../../case-detail.css?v=mobile-spacing-20260722" />
  </head>
  <body data-section="cases">
    <main class="site-shell case-detail-page" data-detail-page>
      ${header("cases")}
      <section class="detail-hero">
        <div class="detail-copy">
          ${i18n("a", { zh: "← 返回案例", en: "← BACK TO CASES" }, ' class="detail-back" href="../cases.html"')}
          <p class="detail-index">CASE ${record.id}</p>
          ${i18n("h1", record.title)}
          ${i18n("h2", record.subtitle)}
          ${i18n("p", record.intro, ' class="detail-intro"')}
        </div>
        <figure class="detail-hero-media">
          <img src="../../${record.image}" ${i18nAttribute("alt", { zh: `LONMA DYNAMIC ${record.title.zh}`, en: `LONMA DYNAMIC ${record.title.en}` })} />
        </figure>
      </section>
      <section class="detail-story">
        ${i18n("p", record.story)}
      </section>
      <section class="detail-contact">
        ${i18n("h2", { zh: "讨论你的下一台车", en: "DISCUSS YOUR NEXT BUILD" })}
        ${i18n("a", { zh: "开始咨询 →", en: "START AN INQUIRY →" }, ' href="../contact.html"')}
      </section>
      <nav class="detail-pagination" ${i18nAttribute("aria-label", { zh: "案例分页", en: "Case pagination" })}>
        ${i18n("a", { zh: `← 上一案例 ${record.previous}`, en: `← CASE ${record.previous}` }, ` href="./case-${record.previous}.html"`)}
        ${i18n("a", { zh: `下一案例 ${record.next} →`, en: `CASE ${record.next} →` }, ` href="./case-${record.next}.html"`)}
      </nav>
      ${globalFooter()}
    </main>
    <script src="../../content-pages.js?v=three-page-expansion-20260726"></script>
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
    <link rel="stylesheet" href="../../styles.css?v=three-page-expansion-20260726" />
    <link rel="stylesheet" href="../../layout-canvas.css?v=three-page-expansion-20260726" />
    <link rel="stylesheet" href="../../case-detail.css?v=mobile-spacing-20260722" />
    <link rel="stylesheet" href="../../case-02.css?v=three-page-expansion-20260726" />
  </head>
  <body data-section="cases">
    <main class="site-shell case-detail-page case02-page" data-detail-page>
      ${header("cases")}
      <section class="case02-video-stage" data-video-state="poster-only" aria-labelledby="case02-title">
        <video
          data-case-video
          poster="../../assets/images/网页/optimized/case-02.jpg"
          controls
          preload="metadata"
          aria-label="Case 02 project film"
          data-en-aria-label="Case 02 project film"
          data-zh-aria-label="案例 02 项目影片"
        ></video>
        <div class="case02-video-copy">
          ${i18n("a", { zh: "← 返回案例", en: "← BACK TO CASES" }, ' href="../cases.html"')}
          <p>CASE ${record.id}</p>
          ${i18n("h1", record.title, ' id="case02-title"')}
          <dl>
            <div>${i18n("dt", { zh: "车辆", en: "VEHICLE" })}<dd>BMW G80 M3</dd></div>
            <div>${i18n("dt", { zh: "年份", en: "YEAR" })}<dd>2024</dd></div>
          </dl>
        </div>
        ${i18n("button", { zh: "完整影片即将上线", en: "FINAL FILM COMING SOON" }, ' type="button" class="case02-video-status" disabled')}
      </section>
      <div class="case02-story">
        <section class="case02-story-beat case02-story-beat-direction">
          <div class="case02-story-copy">
            <p>01</p>
            ${i18n("h2", { zh: "改装方向", en: "THE DIRECTION" })}
            ${i18n("p", {
              zh: "提升响应，同时保留车辆在真实道路中的完整性。刹车、底盘反馈与轮毂数据作为一个系统共同调整。",
              en: "Sharper response without turning the car into a single-purpose machine. Braking, chassis feedback, and wheel fitment are considered as one system.",
            })}
          </div>
          <figure class="case02-story-media"><img src="../../assets/images/shop/brake-kit.webp" loading="lazy" ${i18nAttribute("alt", { zh: "案例 02 刹车系统细节", en: "Case 02 brake system detail" })} /></figure>
        </section>
        <section class="case02-story-beat case02-story-beat-test">
          <figure class="case02-story-media"><img src="../../assets/images/shop/coilover-kit.webp" loading="lazy" ${i18nAttribute("alt", { zh: "案例 02 底盘设定细节", en: "Case 02 chassis setup detail" })} /></figure>
          <div class="case02-story-copy">
            <p>02</p>
            ${i18n("h2", { zh: "测试、调整、再测试", en: "TEST, ADJUST, REPEAT" })}
            ${i18n("p", {
              zh: "每一次变化都通过真实驾驶、轮胎状态与驾驶反馈判断。持续调整，直到整车形成统一响应。",
              en: "Each change is judged through real driving, tire condition, and driver feedback. The setup evolves until the car responds as one complete package.",
            })}
          </div>
        </section>
        <figure class="case02-story-media case02-story-wide"><img src="../../assets/images/shop/forged-wheel.webp" loading="lazy" ${i18nAttribute("alt", { zh: "案例 02 锻造轮毂方向", en: "Case 02 forged wheel direction" })} /></figure>
      </div>
      <section class="detail-contact">
        ${i18n("h2", { zh: "讨论你的下一台车", en: "DISCUSS YOUR NEXT BUILD" })}
        ${i18n("a", { zh: "开始咨询 →", en: "START AN INQUIRY →" }, ' href="../contact.html?service=Custom%20Vehicle%20Builds&amp;vehicle=2024%20BMW%20G80%20M3&amp;message=Case%2002%20road%20and%20track%20direction."')}
      </section>
      <nav class="detail-pagination" ${i18nAttribute("aria-label", { zh: "案例分页", en: "Case pagination" })}>
        ${i18n("a", { zh: `← 上一案例 ${record.previous}`, en: `← CASE ${record.previous}` }, ` href="./case-${record.previous}.html"`)}
        ${i18n("a", { zh: `下一案例 ${record.next} →`, en: `CASE ${record.next} →` }, ` href="./case-${record.next}.html"`)}
      </nav>
      ${globalFooter()}
    </main>
    <script src="../../content-pages.js?v=three-page-expansion-20260726"></script>
    <script src="../../case-02.js?v=three-page-expansion-20260726"></script>
  </body>
</html>
`;

export const renderCasePage = (record) =>
  record.id === "02" ? renderCase02Page(record) : renderGenericCasePage(record);

export const renderServicePage = (record) => {
  const projectHref = record.id === "build"
    ? "../project.html"
    : "../contact.html";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeAttribute(record.meta)}" />
    <title>${record.label} | LONMA DYNAMIC</title>
    <link rel="stylesheet" href="../../styles.css?v=three-page-expansion-20260726" />
    <link rel="stylesheet" href="../../layout-canvas.css?v=three-page-expansion-20260726" />
    <link rel="stylesheet" href="../../service-detail.css?v=mobile-spacing-20260722" />
  </head>
  <body data-section="services">
    <main class="site-shell service-detail-page" data-detail-page>
      ${header("services")}
      <section class="detail-hero">
        <div class="detail-copy">
          ${i18n("a", { zh: "← 返回业务", en: "← BACK TO SERVICES" }, ' class="detail-back" href="../services.html"')}
          <p class="detail-index">${record.number} · ${record.label}</p>
          ${i18n("h1", record.title)}
          ${i18n("p", record.intro, ' class="detail-intro"')}
        </div>
        <figure class="detail-hero-media">
          <img src="../../${record.image}" ${i18nAttribute("alt", { zh: `LONMA DYNAMIC ${record.title.zh}`, en: `LONMA DYNAMIC ${record.title.en}` })} />
        </figure>
      </section>
      <section class="detail-story">
        ${i18n("p", record.scope)}
        ${i18n("p", { zh: "沟通目标 · 规划方案 · 执行调整 · 完成复查", en: "ASSESS · PLAN · EXECUTE · VERIFY" }, ' class="detail-process"')}
      </section>
      <section class="detail-contact">
        ${i18n("h2", { zh: "开始你的项目", en: "START YOUR PROJECT" })}
        ${i18n("a", { zh: "提交车辆信息 →", en: "SEND VEHICLE DETAILS →" }, ` href="${projectHref}"`)}
      </section>
      ${globalFooter(projectHref)}
    </main>
    <script src="../../content-pages.js?v=three-page-expansion-20260726"></script>
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
