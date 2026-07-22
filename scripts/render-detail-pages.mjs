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
    </nav>
    <div class="top-actions">
      <button class="lang-toggle" type="button" aria-label="切换到中文">
        <span class="lang-option" data-lang-option="zh">中</span>
        <span class="lang-separator" aria-hidden="true">/</span>
        <span class="lang-option is-current" data-lang-option="en">EN</span>
      </button>
    </div>
  </header>`;

const globalFooter = `<footer class="content-footer">
        <span>LONMA DYNAMIC</span>
        <span data-zh="龙马态度 · 2026" data-en="AUTOMOTIVE ATTITUDE · 2026">AUTOMOTIVE ATTITUDE · 2026</span>
        <a href="../contact.html" data-zh="开始你的项目 →" data-en="START YOUR PROJECT →">START YOUR PROJECT →</a>
      </footer>`;

export const renderCasePage = (record) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeAttribute(record.meta)}" />
    <title>Case ${record.id} | LONMA DYNAMIC</title>
    <link rel="stylesheet" href="../../styles.css?v=global-shell-20260721" />
    <link rel="stylesheet" href="../../layout-canvas.css?v=canvas-20260721-2200" />
    <link rel="stylesheet" href="../../case-detail.css?v=case-detail-link-closure-20260719" />
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
      ${globalFooter}
    </main>
    <script src="../../content-pages.js?v=english-copy-20260721"></script>
  </body>
</html>
`;

export const renderServicePage = (record) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeAttribute(record.meta)}" />
    <title>${record.label} | LONMA DYNAMIC</title>
    <link rel="stylesheet" href="../../styles.css?v=global-shell-20260721" />
    <link rel="stylesheet" href="../../layout-canvas.css?v=canvas-20260721-2200" />
    <link rel="stylesheet" href="../../service-detail.css?v=service-detail-20260719" />
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
        ${i18n("a", { zh: "提交车辆信息 →", en: "SEND VEHICLE DETAILS →" }, ' href="../contact.html"')}
      </section>
      ${globalFooter}
    </main>
    <script src="../../content-pages.js?v=english-copy-20260721"></script>
  </body>
</html>
`;

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
