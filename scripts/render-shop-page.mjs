import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { srcsetFor } from "../image-performance.mjs";
import { caseBuildTags } from "../detail-pages-data.mjs";
import { shopProducts, shopVehicles, shopCategoryDefaults } from "../shop-data.mjs";
import { renderSeoMeta, seoForRoute, seoForProduct } from "../seo-data.mjs";

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

const categoryLabels = Object.fromEntries(Object.entries(shopCategoryDefaults).map(([id, entry]) => [id, entry.label]));
const managedProductCategories = [...Object.keys(categoryLabels), "ecu"];
const fitmentUnknown = { en: "FITMENT NOT CONFIRMED", zh: "适配尚未确认" };
const inquirySubjectFor = (product) => product.inquirySubject ?? {
  en: `${product.title.en} INQUIRY`, zh: `${product.title.zh}咨询`,
};
const referenceForCategory = (category) => {
  const existing = shopProducts.find((product) => product.category === category && product.inquiry?.reference)?.inquiry.reference;
  if (existing) return existing;
  const caseId = Object.entries(caseBuildTags).find(([, tags]) => tags.some(({ key }) => key === category))?.[0];
  return caseId ? {
    caseId,
    image: `assets/images/generated/case-${caseId}/case-${caseId}-960w.webp`,
    label: { en: `ON A BUILD · CASE ${caseId} REFERENCE`, zh: `装车参考 · 案例 ${caseId}` },
    alt: { en: `Category reference from Case ${caseId}`, zh: `案例 ${caseId} 的分类参考照片` },
  } : null;
};
const inquiryFor = (product) => ({
  kicker: product.inquiry?.kicker ?? categoryLabels[product.category],
  confirm: product.inquiry?.confirm ?? shopCategoryDefaults[product.category]?.confirm ?? [],
  reference: product.inquiry?.reference === undefined
    ? referenceForCategory(product.category)
    : product.inquiry.reference,
});

const renderOptions = (values) =>
  values.map((value) => `<option value="${escapeAttribute(value)}">${escapeText(value)}</option>`).join("\n              ");

const serializeJson = (value) =>
  JSON.stringify(value).replaceAll("<", "\\u003c");

const renderFilter = ([category, label]) => `<label class="shop-filter-option">
              <input type="checkbox" value="${escapeAttribute(category)}" data-category-filter />
              <span data-zh="${escapeAttribute(label.zh)}" data-en="${escapeAttribute(label.en)}">${escapeText(label.en)}</span>
            </label>`;

const renderProductCard = (product) => {
  const category = categoryLabels[product.category] || {
    en: String(product.category).toUpperCase(),
    zh: String(product.category),
  };
  const actionCopy = product.detail
    ? { zh: "查看配置 →", en: "CONFIGURE →" }
    : { zh: "查看详情 →", en: "VIEW DETAILS →" };
  const accessibleAction = product.detail
    ? {
        en: `Configure ${product.title.en}`,
        zh: `配置${product.title.zh}`,
      }
    : {
        en: `View details for ${product.title.en}`,
        zh: `查看${product.title.zh}详情`,
      };
  const target = `<a class="shop-product-target"
          href="./shop/${escapeAttribute(product.id)}.html"
          data-product-link="${escapeAttribute(product.id)}"
          ${i18nAttribute("aria-label", accessibleAction)}></a>`;

  return `<article
            class="shop-product-card"
            data-product-card
            data-category="${escapeAttribute(product.category)}"
            data-product-id="${escapeAttribute(product.id)}"
            data-title-en="${escapeAttribute(product.title.en)}"
            data-title-zh="${escapeAttribute(product.title.zh)}"
            data-description-en="${escapeAttribute(product.description.en)}"
            data-description-zh="${escapeAttribute(product.description.zh)}"
            data-compatibility-en="${escapeAttribute((product.compatibility ?? fitmentUnknown).en)}"
            data-compatibility-zh="${escapeAttribute((product.compatibility ?? fitmentUnknown).zh)}"
            data-inquiry-subject-en="${escapeAttribute(inquirySubjectFor(product).en)}"
            data-inquiry-subject-zh="${escapeAttribute(inquirySubjectFor(product).zh)}"
            data-configurable="${Boolean(product.detail)}"
            data-shopify-product-id="${escapeAttribute(product.shopifyProductId ?? "")}"
            data-image="../${escapeAttribute(product.image)}"
            data-alt-en="${escapeAttribute(product.alt.en)}"
            data-alt-zh="${escapeAttribute(product.alt.zh)}"
          >
            <img src="../${escapeAttribute(product.image)}" ${i18nAttribute("alt", product.alt)} />
            <div class="shop-product-copy">
              ${i18n("p", category, ' class="shop-product-category"')}
              ${i18n("h2", product.title)}
              <div class="shop-product-meta">
                ${i18n("span", { zh: "请咨询", en: "INQUIRE" })}
                ${i18n("span", actionCopy, ' class="shop-product-action-copy"')}
              </div>
            </div>
            ${target}
          </article>`;
};

const header = `<header class="topbar">
        <a class="brand" href="../index.html" ${i18nAttribute("aria-label", { zh: "回到首页", en: "Back to home" })}>LONMA DYNAMIC</a>
        <nav class="nav" ${i18nAttribute("aria-label", { zh: "主导航", en: "Main navigation" })}>
          <a href="./about.html">ABOUT</a>
          <a href="./services.html">SERVICES</a>
          <a href="./cases.html">CASES</a>
          <a href="./contact.html">CONTACT</a>
          <a href="./shop.html" aria-current="page">SHOP</a>
        </nav>
        <div class="top-actions">
          <a class="project-entry" href="./project.html">
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

const footer = `<footer class="content-footer">
        <span>LONMA DYNAMIC</span>
        <span data-zh="龙马态度 · 2026" data-en="AUTOMOTIVE ATTITUDE · 2026">AUTOMOTIVE ATTITUDE · 2026</span>
        <a href="./contact.html" data-zh="开始你的项目 →" data-en="START YOUR PROJECT →">START YOUR PROJECT →</a>
      </footer>`;

const renderProductOptions = (name, options, selected, { finish = false } = {}) =>
  options.map((option) => {
    const checked = option.id === selected ? " checked" : "";
    const swatch = finish
      ? `<span class="finish-swatch finish-swatch-${escapeAttribute(option.swatch)}" aria-hidden="true"></span>`
      : "";
    return `<label><input type="radio" name="${escapeAttribute(name)}" value="${escapeAttribute(option.id)}"${checked} />${swatch}${i18n("span", option.label)}</label>`;
  }).join("\n              ");

const galleryViewsFor = (product) => product.detail.gallery?.length
  ? product.detail.gallery
  : [{ label: product.title, zoom: 1, origin: "50% 50%" }];

const galleryStyle = (view) => `--view-zoom: ${Number(view.zoom) || 1}; --view-origin: ${escapeAttribute(view.origin ?? "50% 50%")};`;

const renderGalleryViews = (product) =>
  galleryViewsFor(product)
    .map((view, index) => {
      const image = view.image ?? product.image;
      const alt = view.alt ?? product.alt;
      return `            <figure class="product-view${view.scene ? " is-scene" : ""}${index === 0 ? " is-active" : ""}" data-gallery-view data-label-en="${escapeAttribute(view.label.en)}" data-label-zh="${escapeAttribute(view.label.zh)}" style="${galleryStyle(view)}"${index === 0 ? "" : ' aria-hidden="true"'}>
              <img src="../../${escapeAttribute(image)}" ${i18nAttribute("alt", alt)}${index === 0 ? "" : ' loading="lazy"'} />
            </figure>`;
    })
    .join("\n");

const renderGalleryThumbs = (product) =>
  galleryViewsFor(product)
    .map(
      (view, index) =>
        `            <button type="button" data-gallery-thumb="${index}"${index === 0 ? ' aria-current="true"' : ""} ${i18nAttribute("aria-label", view.label)} style="${galleryStyle(view)}"><img src="../../${escapeAttribute(view.image ?? product.image)}" alt="" loading="lazy" /></button>`
    )
    .join("\n");

const renderProductInfo = (product, finishSpecification) => {
  const { detail } = product;
  const join = (list, separator) => ({
    en: list.map(({ label }) => label.en).join(separator.en),
    zh: list.map(({ label }) => label.zh).join(separator.zh),
  });
  const diameters = join(detail.options.diameter, { en: " / ", zh: " / " });
  const widths = join(detail.options.width, { en: " · ", zh: " · " });
  const finishCount = String(detail.options.finish.length).padStart(2, "0");
  const optionLabel = (group, id) => detail.options[group].find((option) => option.id === id)?.label ?? { en: id, zh: id };

  const figures = [
    { label: { en: "CONSTRUCTION", zh: "结构" }, value: detail.specifications.construction },
    { label: { en: "DIAMETER", zh: "直径" }, value: diameters },
    { label: { en: "FINISHES", zh: "颜色" }, value: { en: `${finishCount} OPTIONS`, zh: `${finishCount} 种` } },
    { label: { en: "REFERENCE SET", zh: "参考套装" }, value: { en: `× ${detail.defaults.quantity}`, zh: `× ${detail.defaults.quantity}` } },
  ];

  const specRows = [
    [{ en: "CONSTRUCTION", zh: "结构" }, detail.specifications.construction],
    [{ en: "APPLICATION", zh: "用途" }, detail.specifications.application],
    [{ en: "DIAMETER", zh: "直径" }, diameters],
    [{ en: "WIDTH", zh: "宽度" }, widths],
    [{ en: "FINISH", zh: "颜色" }, finishSpecification],
    [{ en: "FITMENT", zh: "适配" }, detail.specifications.fitment],
  ];

  const fitmentRows = detail.fitments
    .flatMap((vehicle) =>
      vehicle.combinations.map(
        (combo) => `
                <tr>
                  <td>${escapeText(`${vehicle.make} ${vehicle.model}`)}</td>
                  <td>${escapeText(`${vehicle.year} · ${vehicle.chassis}`)}</td>
                  <td>${i18n("span", optionLabel("diameter", combo.diameter))}</td>
                  <td>${i18n("span", optionLabel("width", combo.width))}</td>
                </tr>`
      )
    )
    .join("");

  const steps = [
    {
      title: { en: "CONFIGURE", zh: "选择配置" },
      copy: { en: "Choose your vehicle, diameter, width, finish and quantity above.", zh: "在上方选择车型、直径、宽度、颜色与数量。" },
    },
    {
      title: { en: "FITMENT CHECK", zh: "适配确认" },
      copy: { en: "Request a fitment check so LONMA DYNAMIC can verify clearance on your car.", zh: "提交适配确认，由 LONMA DYNAMIC 核对你车辆的安装空间。" },
    },
    {
      title: { en: "CONFIRMED QUOTE", zh: "确认报价" },
      copy: detail.referencePrice?.note ?? { en: "Quoted after fitment confirmation.", zh: "确认车型适配后报价。" },
    },
  ];

  return `      <section class="product-info" aria-labelledby="product-info-title">
        <div class="product-info-figures">${figures
          .map(
            (figure) => `
          <div>${i18n("span", figure.label)}${i18n("strong", figure.value)}</div>`
          )
          .join("")}
        </div>
        <div class="product-info-body">
          <div class="product-info-intro">
            ${i18n("p", { en: "PRODUCT DETAILS", zh: "产品详情" }, ' class="product-kicker"')}
            ${i18n("h2", detail.displayName, ' id="product-info-title"')}
            ${i18n("p", detail.summary, ' class="product-info-summary"')}
            ${i18n("a", { en: "TALK TO LONMA DYNAMIC →", zh: "联系 LONMA DYNAMIC →" }, ' class="product-info-contact" href="../contact.html"')}
          </div>
          <div class="product-info-sections">
            <section class="product-info-item is-open" data-product-disclosure data-desktop-open="true">
              <button class="product-info-toggle" type="button" aria-controls="product-specifications-panel" aria-expanded="true"><span>01</span>${i18n("span", { en: "SPECIFICATIONS", zh: "规格" })}</button>
              <div class="product-info-panel" id="product-specifications-panel">
                <dl class="product-info-specs">${specRows
                .map(([label, value]) => `
                <div>${i18n("dt", label)}${i18n("dd", value)}</div>`)
                .join("")}
                </dl>
              </div>
            </section>
            <section class="product-info-item is-open" data-product-disclosure data-desktop-open="true">
              <button class="product-info-toggle" type="button" aria-controls="product-fitment-panel" aria-expanded="true"><span>02</span>${i18n("span", { en: "REFERENCE FITMENT", zh: "参考适配" })}</button>
              <div class="product-info-panel" id="product-fitment-panel">
                <table class="product-info-fitment">
                <thead>
                  <tr>${i18n("th", { en: "VEHICLE", zh: "车型" })}${i18n("th", { en: "YEAR · CHASSIS", zh: "年份 · 底盘" })}${i18n("th", { en: "DIAMETER", zh: "直径" })}${i18n("th", { en: "WIDTH", zh: "宽度" })}</tr>
                </thead>
                <tbody>${fitmentRows}
                </tbody>
                </table>
                ${i18n("p", detail.fitmentCopy.supported, ' class="product-info-note"')}
                ${i18n("p", { en: `Other vehicles: ${detail.fitmentCopy.unsupported.en.toLowerCase()}.`, zh: `其他车型：${detail.fitmentCopy.unsupported.zh}。` }, ' class="product-info-note"')}
              </div>
            </section>
            <section class="product-info-item" data-product-disclosure data-desktop-open="false">
              <button class="product-info-toggle" type="button" aria-controls="product-ordering-panel" aria-expanded="false"><span>03</span>${i18n("span", { en: "ORDERING & FITMENT CHECK", zh: "下单与适配流程" })}</button>
              <div class="product-info-panel" id="product-ordering-panel" hidden>
                <ol class="product-info-steps">${steps
                .map(
                  (step, index) => `
                <li><b>${String(index + 1).padStart(2, "0")}</b>${i18n("strong", step.title)}${i18n("span", step.copy)}</li>`
                )
                .join("")}
                </ol>
              </div>
            </section>
          </div>
        </div>
      </section>
`;
};

const renderRelated = (current) => {
  const others = shopProducts.filter(({ id }) => id !== current.id);
  const items = others
    .map(
      (product) => `
          <a class="product-related-item" href="./${encodeURIComponent(product.id)}.html">
            <img src="../../${escapeAttribute(product.image)}" ${i18nAttribute("alt", product.alt)} loading="lazy" />
            ${i18n("span", categoryLabels[product.category])}
            ${i18n("strong", product.title)}
          </a>`
    )
    .join("");

  return `      <section class="product-related" aria-labelledby="product-related-title">
        <div class="product-related-heading">
          ${i18n("p", { en: "COMPLETE THE BUILD", zh: "搭配你的改装" }, ' class="product-kicker"')}
          ${i18n("h2", { en: "PAIRS WITH THIS SET", zh: "可搭配的部件" }, ' id="product-related-title"')}
          ${i18n("a", { en: "VIEW ALL PARTS →", zh: "查看全部部件 →" }, ' href="../shop.html"')}
        </div>
        <div class="product-related-row">${items}
        </div>
      </section>
`;
};

export const renderConfigurableProductPage = (product) => {
  if (!product?.detail) {
    throw new Error(`${product?.id ?? "product"} detail data is required`);
  }

  const { detail } = product;
  const hasReferencePrice = Boolean(detail.referencePrice?.display && detail.referencePrice?.note?.en && detail.referencePrice?.note?.zh);
  const seo = seoForProduct(product);
  const views = galleryViewsFor(product);
  const defaultVehicle = detail.defaults.vehicle;
  const finishSpecification = {
    en: detail.options.finish.map(({ label }) => label.en).join(" OR "),
    zh: detail.options.finish.map(({ label }) => label.zh).join("或"),
  };
  const productConfig = {
    id: product.id,
    category: product.category,
    categories: managedProductCategories,
    vehicles: shopVehicles.tuples,
    ...detail,
  };
  delete productConfig.gallery;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeAttribute(seo.description)}" />
    <title>${escapeText(seo.title)}</title>
    <!-- SEO:START -->
    ${renderSeoMeta(seo)}
    <!-- SEO:END -->
    <link rel="stylesheet" href="../../styles.css?v=sanity-case-cms-20260801" />
    <link rel="stylesheet" href="../../layout-canvas.css?v=sanity-case-cms-20260801" />
    <link rel="stylesheet" href="../../shop-product.css?v=product-items-20261125" />
    <link rel="stylesheet" href="../../mobile-experience.css?v=mobile-coordination-20260728" />
  </head>
  <body data-section="shop">
    <main class="site-shell forged-wheel-page" data-product-id="${escapeAttribute(product.id)}">
      <header class="topbar">
        <a class="brand" href="../../index.html" ${i18nAttribute("aria-label", { zh: "回到首页", en: "Back to home" })}>LONMA DYNAMIC</a>
        <nav class="nav" ${i18nAttribute("aria-label", { zh: "主导航", en: "Main navigation" })}>
          <a href="../about.html">ABOUT</a>
          <a href="../services.html">SERVICES</a>
          <a href="../cases.html">CASES</a>
          <a href="../contact.html">CONTACT</a>
          <a href="../shop.html" aria-current="page">SHOP</a>
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
      </header>

      <section class="product-detail" aria-labelledby="product-title">
        <div class="product-stage">
          ${i18n("a", { en: "← BACK TO SHOP", zh: "← 返回商店" }, ' class="product-back" href="../shop.html" data-product-back')}
          <span class="product-stage-beam" aria-hidden="true"></span>
          <div class="product-stage-main" data-gallery tabindex="0" ${i18nAttribute("aria-label", { en: "Product gallery", zh: "产品图集" })}>
${renderGalleryViews(product)}
          </div>
          <div class="product-gallery-bar">
            <button class="product-gallery-arrow" type="button" data-gallery-step="-1" ${i18nAttribute("aria-label", { en: "Previous view", zh: "上一张" })}>←</button>
            <p class="product-gallery-caption"><b data-gallery-index>01</b> / ${String(views.length).padStart(2, "0")} ${i18n("span", views[0].label, " data-gallery-label")}</p>
            <button class="product-gallery-arrow" type="button" data-gallery-step="1" ${i18nAttribute("aria-label", { en: "Next view", zh: "下一张" })}>→</button>
          </div>
          <div class="product-thumbnails" ${i18nAttribute("aria-label", { en: "Product views", zh: "产品视图" })}>
${renderGalleryThumbs(product)}
          </div>
          <p class="product-stage-selection" aria-live="polite">
            ${i18n("span", { en: "YOUR CONFIGURATION", zh: "当前配置" })}
            <strong data-selection-summary></strong>
          </p>
        </div>

        <div class="product-config">
          ${i18n("p", detail.kicker, ' class="product-kicker"')}
          ${i18n("h1", detail.title, ' id="product-title"')}
          ${i18n("p", detail.summary, ' class="product-summary"')}
          <p class="product-reference-price">${hasReferencePrice ? `
            ${i18n("span", { en: "REFERENCE PACKAGE", zh: "参考套装" })}
            <strong>${escapeText(detail.referencePrice.display)}</strong>
            ${i18n("small", detail.referencePrice.note)}` : `
            ${i18n("span", { en: "PRICE", zh: "价格" })}
            ${i18n("strong", { en: "ON REQUEST", zh: "按车型报价" })}`}
          </p>

          <fieldset data-product-fitment>
            ${i18n("legend", { en: "VEHICLE FITMENT", zh: "车型适配" })}
            <div class="product-fitment-grid">
              <label>${i18n("span", { en: "MAKE", zh: "品牌" })}<select data-fitment-make maxlength="20">${renderOptions(shopVehicles.makes)}</select></label>
              <label>${i18n("span", { en: "MODEL", zh: "车型" })}<input data-fitment-model value="${escapeAttribute(defaultVehicle.model)}" maxlength="40" /></label>
              <label>${i18n("span", { en: "YEAR", zh: "年份" })}<input data-fitment-year value="${escapeAttribute(defaultVehicle.year)}" maxlength="4" inputmode="numeric" /></label>
              <label>${i18n("span", { en: "CHASSIS", zh: "底盘" })}<input data-fitment-chassis value="${escapeAttribute(defaultVehicle.chassis)}" maxlength="20" /></label>
            </div>
          </fieldset>

          <fieldset data-option-group="diameter">
            ${i18n("legend", { en: "DIAMETER", zh: "直径" })}
            <div class="product-option-row">
              ${renderProductOptions("diameter", detail.options.diameter, detail.defaults.diameter)}
            </div>
          </fieldset>

          <fieldset data-option-group="width">
            ${i18n("legend", { en: "WIDTH", zh: "宽度" })}
            <div class="product-option-row">
              ${renderProductOptions("width", detail.options.width, detail.defaults.width)}
            </div>
          </fieldset>

          <fieldset data-option-group="finish">
            ${i18n("legend", { en: "FINISH", zh: "颜色" })}
            <div class="product-option-row product-finish-row">
              ${renderProductOptions("finish", detail.options.finish, detail.defaults.finish, { finish: true })}
            </div>
          </fieldset>

          <label class="product-quantity">${i18n("span", { en: "QUANTITY", zh: "数量" })}<input data-product-quantity type="number" min="1" max="4" value="${escapeAttribute(detail.defaults.quantity)}" /></label>
          <p class="product-fitment-message" data-fitment-message aria-live="polite"></p>

          <div class="product-actions">
            <span class="product-action-price">${i18n("small", hasReferencePrice ? { en: "REFERENCE PACKAGE", zh: "参考套装" } : { en: "PRICE", zh: "价格" })}${hasReferencePrice ? `<strong>${escapeText(detail.referencePrice.display)}</strong>` : i18n("strong", { en: "ON REQUEST", zh: "按车型报价" })}</span>
            ${i18n("a", { en: "ADD TO BUILD", zh: "加入项目" }, " data-add-to-build")}
            ${i18n("a", { en: "REQUEST FITMENT CHECK", zh: "申请适配确认" }, " data-fitment-inquiry")}
          </div>
        </div>
      </section>

${renderProductInfo(product, finishSpecification)}
${renderRelated(product)}
      <footer class="content-footer">
        <span>LONMA DYNAMIC</span>
        <span data-zh="龙马态度 · 2026" data-en="AUTOMOTIVE ATTITUDE · 2026">AUTOMOTIVE ATTITUDE · 2026</span>
        <a href="../contact.html" data-zh="直接联系 →" data-en="CONTACT DIRECTLY →">CONTACT DIRECTLY →</a>
      </footer>
    </main>
    <script type="application/json" data-product-config>${serializeJson(productConfig)}</script>
    <script src="../../content-pages.js?v=sanity-case-cms-20260801"></script>
    <script src="../../shop-product.js?v=sanity-case-cms-20260801"></script>
    <script src="../../product-info.js?v=product-info-20261124"></script>
  </body>
</html>
`;
};

// Detail pages for catalogue items that do not have configurable product data
// yet. Everything shown comes from shop-data.mjs; price and fitment stay
// "on request" until LONMA DYNAMIC supplies real data.
const itemGalleryViews = (product, inquiry) => [
  { id: "full", label: { en: "FULL VIEW", zh: "整体" }, zoom: 1, origin: "50% 50%" },
  { id: "detail", label: { en: "DETAIL", zh: "细节" }, zoom: 1.9, origin: "50% 45%" },
  { id: "close", label: { en: "CLOSE DETAIL", zh: "近距离细节" }, zoom: 2.5, origin: "30% 62%" },
  ...(inquiry.reference
    ? [{
        id: "on-car",
        label: inquiry.reference.label,
        zoom: 1,
        origin: "50% 50%",
        image: inquiry.reference.image,
        alt: inquiry.reference.alt,
        scene: true,
      }]
    : []),
];

const itemUses = [
  { id: "street", label: { en: "STREET", zh: "街道" } },
  { id: "road-track", label: { en: "ROAD & TRACK", zh: "道路与赛道" } },
  { id: "show", label: { en: "SHOW", zh: "展示" } },
];

export const renderProductItemPage = (product) => {
  const inquiry = inquiryFor(product);
  const views = itemGalleryViews(product, inquiry);
  const category = categoryLabels[product.category];
  const compatibility = product.compatibility ?? fitmentUnknown;
  const seo = seoForProduct(product);
  const defaultVehicle = shopVehicles.tuples[0];
  const confirmCount = String(inquiry.confirm.length).padStart(2, "0");
  const priceCopy = { en: "ON REQUEST", zh: "按车型报价" };
  const priceNote = { en: "Quoted after fitment confirmation.", zh: "确认车型适配后报价。" };
  const itemConfig = {
    id: product.id,
    categories: managedProductCategories,
    inquirySubject: inquirySubjectFor(product),
  };

  const viewMarkup = views
    .map((view, index) => `            <figure class="product-view${view.scene ? " is-scene" : ""}${index === 0 ? " is-active" : ""}" data-gallery-view data-label-en="${escapeAttribute(view.label.en)}" data-label-zh="${escapeAttribute(view.label.zh)}" style="${galleryStyle(view)}"${index === 0 ? "" : ' aria-hidden="true"'}>
              <img src="../../${escapeAttribute(view.image ?? product.image)}" ${i18nAttribute("alt", view.alt ?? product.alt)}${index === 0 ? "" : ' loading="lazy"'} />
            </figure>`)
    .join("\n");
  const thumbMarkup = views
    .map((view, index) => `            <button type="button" data-gallery-thumb="${index}"${index === 0 ? ' aria-current="true"' : ""} ${i18nAttribute("aria-label", view.label)} style="${galleryStyle(view)}"><img src="../../${escapeAttribute(view.image ?? product.image)}" alt="" loading="lazy" /></button>`)
    .join("\n");

  const figures = [
    { label: { en: "CATEGORY", zh: "分类" }, value: category },
    { label: { en: "FITMENT", zh: "适配" }, value: compatibility },
    { label: { en: "PRICE", zh: "价格" }, value: priceCopy },
    { label: { en: "TO CONFIRM", zh: "需确认" }, value: { en: `${confirmCount} ITEMS`, zh: `${confirmCount} 项` } },
  ];
  const steps = [
    { title: { en: "YOUR VEHICLE", zh: "填写车型" }, copy: { en: "Enter your vehicle and how you use it above.", zh: "在上方填写车型与使用场景。" } },
    { title: { en: "FITMENT CHECK", zh: "适配确认" }, copy: { en: "LONMA DYNAMIC confirms the items listed above for your car.", zh: "由 LONMA DYNAMIC 针对你的车辆确认以上项目。" } },
    { title: { en: "CONFIRMED QUOTE", zh: "确认报价" }, copy: priceNote },
  ];
  const reference = inquiry.reference;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeAttribute(seo.description)}" />
    <title>${escapeText(seo.title)}</title>
    <!-- SEO:START -->
    ${renderSeoMeta(seo)}
    <!-- SEO:END -->
    <link rel="stylesheet" href="../../styles.css?v=sanity-case-cms-20260801" />
    <link rel="stylesheet" href="../../layout-canvas.css?v=sanity-case-cms-20260801" />
    <link rel="stylesheet" href="../../shop-product.css?v=product-items-20261125" />
    <link rel="stylesheet" href="../../mobile-experience.css?v=mobile-coordination-20260728" />
  </head>
  <body data-section="shop">
    <main class="site-shell forged-wheel-page product-item-page" data-product-id="${escapeAttribute(product.id)}">
      <header class="topbar">
        <a class="brand" href="../../index.html" ${i18nAttribute("aria-label", { zh: "回到首页", en: "Back to home" })}>LONMA DYNAMIC</a>
        <nav class="nav" ${i18nAttribute("aria-label", { zh: "主导航", en: "Main navigation" })}>
          <a href="../about.html">ABOUT</a>
          <a href="../services.html">SERVICES</a>
          <a href="../cases.html">CASES</a>
          <a href="../contact.html">CONTACT</a>
          <a href="../shop.html" aria-current="page">SHOP</a>
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
      </header>

      <section class="product-detail" aria-labelledby="product-title">
        <div class="product-stage">
          ${i18n("a", { en: "← BACK TO SHOP", zh: "← 返回商店" }, ' class="product-back" href="../shop.html" data-product-back')}
          <span class="product-stage-beam" aria-hidden="true"></span>
          <div class="product-stage-main" data-gallery tabindex="0" ${i18nAttribute("aria-label", { en: "Product gallery", zh: "产品图集" })}>
${viewMarkup}
          </div>
          <div class="product-gallery-bar">
            <button class="product-gallery-arrow" type="button" data-gallery-step="-1" ${i18nAttribute("aria-label", { en: "Previous view", zh: "上一张" })}>←</button>
            <p class="product-gallery-caption"><b data-gallery-index>01</b> / ${String(views.length).padStart(2, "0")} ${i18n("span", views[0].label, " data-gallery-label")}</p>
            <button class="product-gallery-arrow" type="button" data-gallery-step="1" ${i18nAttribute("aria-label", { en: "Next view", zh: "下一张" })}>→</button>
          </div>
          <div class="product-thumbnails" ${i18nAttribute("aria-label", { en: "Product views", zh: "产品视图" })}>
${thumbMarkup}
          </div>
          <p class="product-stage-selection" aria-live="polite">
            ${i18n("span", { en: "YOUR REQUEST", zh: "当前需求" })}
            <strong data-item-summary></strong>
          </p>
        </div>

        <div class="product-config">
          ${i18n("p", inquiry.kicker, ' class="product-kicker"')}
          ${i18n("h1", product.title, ' id="product-title"')}
          ${i18n("p", product.description, ' class="product-summary"')}
          <p class="product-reference-price">
            ${i18n("span", { en: "PRICE", zh: "价格" })}
            ${i18n("strong", priceCopy)}
            ${i18n("small", priceNote)}
          </p>

          <fieldset data-product-fitment>
            ${i18n("legend", { en: "VEHICLE FITMENT", zh: "车型适配" })}
            <div class="product-fitment-grid">
              <label>${i18n("span", { en: "MAKE", zh: "品牌" })}<select data-item-make>${renderOptions(shopVehicles.makes)}</select></label>
              <label>${i18n("span", { en: "MODEL", zh: "车型" })}<input data-item-model value="${escapeAttribute(defaultVehicle.model)}" maxlength="40" /></label>
              <label>${i18n("span", { en: "YEAR", zh: "年份" })}<input data-item-year value="${escapeAttribute(defaultVehicle.year)}" maxlength="4" inputmode="numeric" /></label>
              <label>${i18n("span", { en: "CHASSIS", zh: "底盘" })}<input data-item-chassis value="${escapeAttribute(defaultVehicle.chassis)}" maxlength="20" /></label>
            </div>
          </fieldset>

          <fieldset data-option-group="use" data-item-use>
            ${i18n("legend", { en: "INTENDED USE", zh: "使用场景" })}
            <div class="product-option-row">
              ${itemUses.map((use, index) => `<label><input type="radio" name="use" value="${use.id}"${index === 0 ? " checked" : ""} />${i18n("span", use.label)}</label>`).join("\n              ")}
            </div>
          </fieldset>

          ${i18n("p", compatibility, ' class="product-fitment-message" data-fitment-message')}

          <div class="product-actions">
            <span class="product-action-price">${i18n("small", { en: "PRICE", zh: "价格" })}${i18n("strong", priceCopy)}</span>
            ${i18n("a", { en: "ADD TO BUILD", zh: "加入项目" }, ' href="../project.html" data-add-to-build data-item-build')}
            ${i18n("a", { en: "REQUEST FITMENT CHECK", zh: "申请适配确认" }, ' href="../contact.html" data-fitment-inquiry data-item-inquiry')}
          </div>
        </div>
      </section>

      <section class="product-info" aria-labelledby="product-info-title">
        <div class="product-info-figures">${figures.map((figure) => `
          <div>${i18n("span", figure.label)}${i18n("strong", figure.value)}</div>`).join("")}
        </div>
        <div class="product-info-body">
          <div class="product-info-intro">
            ${i18n("p", { en: "PRODUCT DETAILS", zh: "产品详情" }, ' class="product-kicker"')}
            ${i18n("h2", product.title, ' id="product-info-title"')}
            ${i18n("p", { en: "This category is shown for design review. Specification, price and fitment are confirmed for each vehicle.", zh: "此分类用于设计预览。规格、价格与适配都按车辆逐一确认。" }, ' class="product-info-summary"')}
            ${i18n("a", { en: "TALK TO LONMA DYNAMIC →", zh: "联系 LONMA DYNAMIC →" }, ' class="product-info-contact" href="../contact.html"')}
          </div>
          <div class="product-info-sections">
            <section class="product-info-item is-open" data-product-disclosure data-desktop-open="true">
              <button class="product-info-toggle" type="button" aria-controls="product-confirm-panel" aria-expanded="true"><span>01</span>${i18n("span", { en: "WHAT WE CONFIRM", zh: "需要确认的项目" })}</button>
              <div class="product-info-panel" id="product-confirm-panel">
                <dl class="product-info-specs">${inquiry.confirm.map((item, index) => `
                <div>${i18n("dt", { en: String(index + 1).padStart(2, "0"), zh: String(index + 1).padStart(2, "0") })}${i18n("dd", item)}</div>`).join("")}
                </dl>
              </div>
            </section>${reference ? `
            <section class="product-info-item is-open" data-product-disclosure data-desktop-open="true">
              <button class="product-info-toggle" type="button" aria-controls="product-reference-panel" aria-expanded="true"><span>02</span>${i18n("span", { en: "REFERENCE BUILD", zh: "参考案例" })}</button>
              <div class="product-info-panel" id="product-reference-panel">
                <a class="product-info-reference" href="../cases/case-${reference.caseId}.html">
                  <img src="../../${escapeAttribute(reference.image)}" alt="" loading="lazy" />
                  ${i18n("span", { en: `CASE ${reference.caseId} · VIEW BUILD →`, zh: `案例 ${reference.caseId} · 查看案例 →` })}
                </a>
                ${i18n("p", { en: "Reference photo of a build in this category, not this exact part.", zh: "此分类的装车参考照片，并非此款部件本身。" }, ' class="product-info-note"')}
              </div>
            </section>` : ""}
            <section class="product-info-item" data-product-disclosure data-desktop-open="false">
              <button class="product-info-toggle" type="button" aria-controls="product-ordering-panel" aria-expanded="false"><span>${reference ? "03" : "02"}</span>${i18n("span", { en: "ORDERING & FITMENT CHECK", zh: "下单与适配流程" })}</button>
              <div class="product-info-panel" id="product-ordering-panel" hidden>
                <ol class="product-info-steps">${steps.map((step, index) => `
                <li><b>${String(index + 1).padStart(2, "0")}</b>${i18n("strong", step.title)}${i18n("span", step.copy)}</li>`).join("")}
                </ol>
              </div>
            </section>
          </div>
        </div>
      </section>
${renderRelated(product)}
      <footer class="content-footer">
        <span>LONMA DYNAMIC</span>
        <span data-zh="龙马态度 · 2026" data-en="AUTOMOTIVE ATTITUDE · 2026">AUTOMOTIVE ATTITUDE · 2026</span>
        <a href="../contact.html" data-zh="直接联系 →" data-en="CONTACT DIRECTLY →">CONTACT DIRECTLY →</a>
      </footer>
    </main>
    <script type="application/json" data-item-config>${serializeJson(itemConfig)}</script>
    <script src="../../content-pages.js?v=sanity-case-cms-20260801"></script>
    <script src="../../shop-item.js?v=shop-item-20261125"></script>
    <script src="../../product-info.js?v=product-info-20261124"></script>
  </body>
</html>
`;
};

const renderFeatureSpecs = (product, activeId) =>
  Object.entries(product.detail?.options ?? {})
    .map(([key, options]) => {
      const label = product.detail.optionLabels?.[key];
      if (!label || !options.length) return "";
      const values = options.map((option, index) => {
        const tag = index === 0 ? "b" : "i";
        const swatch = /^[a-z-]+$/.test(option.swatch ?? "")
          ? `<em class="is-${escapeAttribute(option.swatch)}" aria-hidden="true"></em>`
          : "";
        return `<${tag}>${swatch}${i18n("span", option.label)}</${tag}>`;
      }).join("");
      return `          <div class="shop-feature-spec" data-feature-specs-for="${escapeAttribute(product.id)}"${product.id === activeId ? "" : " hidden"}>
            ${i18n("small", label)}
            <span>${values}</span>
          </div>`;
    })
    .join("\n");

const renderFeature = (products) => {
  const first = products[0];
  const picks = products
    .map(
      (product, index) => `
            <li><button type="button" data-feature-pick="${escapeAttribute(product.id)}"${index === 0 ? ' aria-current="true"' : ""}><span>${String(index + 1).padStart(2, "0")}</span>${i18n("span", product.title)}</button></li>`
    )
    .join("");
  const strip = products
    .map(
      (product, index) => `
          <button type="button" data-feature-pick="${escapeAttribute(product.id)}"${index === 0 ? ' aria-current="true"' : ""} ${i18nAttribute("aria-label", product.title)}><img src="../${escapeAttribute(product.image)}" alt="" loading="lazy" /></button>`
    )
    .join("");
  const count = String(products.length).padStart(2, "0");

  return `      <section class="shop-feature" aria-labelledby="shop-feature-title" data-shop-feature>
        <div class="shop-feature-stage">
          <span class="shop-feature-beam" aria-hidden="true"></span>
          <div class="shop-feature-index">
            ${i18n("p", { en: `FEATURED · ${count} PIECES`, zh: `推荐产品 · ${count} 件` })}
            <ol>${picks}
            </ol>
          </div>
          <div class="shop-feature-vehicle">
            ${i18n("p", { en: "YOUR VEHICLE", zh: "你的车型" })}
            <strong data-feature-vehicle>BMW G80 M3</strong>
            <span data-feature-vehicle-meta>2024 · G8X</span>
          </div>
          <button class="shop-feature-arrow is-prev" type="button" data-feature-step="-1" ${i18nAttribute("aria-label", { en: "Previous product", zh: "上一件" })}>←</button>
          <img class="shop-feature-image" src="../${escapeAttribute(first.image)}" ${i18nAttribute("alt", first.alt)} data-feature-image />
          <button class="shop-feature-arrow is-next" type="button" data-feature-step="1" ${i18nAttribute("aria-label", { en: "Next product", zh: "下一件" })}>→</button>
          <div class="shop-feature-title">
            ${i18n("p", categoryLabels[first.category], " data-feature-category")}
            ${i18n("h2", first.title, ' id="shop-feature-title" data-feature-name')}
            <span class="shop-feature-count"><b data-feature-number>01</b> / ${count}</span>
          </div>
          <div class="shop-feature-strip">${strip}
          </div>
        </div>
        <div class="shop-feature-config">
          <div class="shop-feature-spec">
            ${i18n("small", { en: "VEHICLE", zh: "车型" })}
            <span><b data-feature-vehicle-line>BMW G80 M3 · 2024</b></span>
          </div>
${products.filter((product) => product.detail).map((product) => renderFeatureSpecs(product, first.id)).join("\n")}
          <div class="shop-feature-spec shop-feature-description" data-feature-other${first.detail ? " hidden" : ""}>
            ${i18n("small", { en: "NOTE", zh: "说明" })}
            ${i18n("span", first.description, " data-feature-description")}
          </div>
          <div class="shop-feature-spec" data-feature-other${first.detail ? " hidden" : ""}>
            ${i18n("small", { en: "FITMENT", zh: "适配" })}
            <span>${i18n("b", first.compatibility ?? fitmentUnknown, " data-feature-compatibility")}</span>
          </div>
          <div class="shop-feature-actions">
            ${i18n("a", first.detail ? { en: "CONFIGURE", zh: "配置此产品" } : { en: "VIEW DETAILS", zh: "查看详情" }, ` class="shop-feature-cta" href="./shop/${escapeAttribute(first.id)}.html" data-feature-cta`)}
            ${i18n("a", { en: "ASK ABOUT FITMENT", zh: "咨询适配" }, ' class="shop-feature-secondary" href="./contact.html"')}
          </div>
        </div>
      </section>
`;
};

export const renderShopPage = (products = shopProducts) => {
  const firstProduct = products[0] || shopProducts[0];
  const productCount = String(products.length).padStart(2, "0");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Browse sample performance-part categories for a selected vehicle and contact LONMA DYNAMIC for fitment and installation details." />
    <title>Shop | LONMA DYNAMIC</title>
    <!-- SEO:START -->
    ${renderSeoMeta(seoForRoute("/pages/shop"))}
    <!-- SEO:END -->
    <link rel="stylesheet" href="../styles.css?v=sanity-case-cms-20260801" />
    <link rel="stylesheet" href="../layout-canvas.css?v=sanity-case-cms-20260801" />
    <link rel="stylesheet" href="../shop.css?v=shop-touch-20261124" />
    <link rel="stylesheet" href="../mobile-experience.css?v=mobile-coordination-20260728" />
  </head>
  <body data-section="shop">
    <main class="site-shell shop-page" ${i18nAttribute("aria-label", { zh: "LONMA DYNAMIC 商店", en: "LONMA DYNAMIC shop" })}>
      ${header}
${renderFeature(products)}      <section class="shop-mobile-intro" aria-labelledby="shop-mobile-title">
        ${i18n("p", { zh: "商店 / 性能配件", en: "SHOP / PERFORMANCE PARTS" })}
        ${i18n("h1", { zh: "适配整车方案的性能部件。", en: "PARTS THAT FIT THE BUILD." }, ' id="shop-mobile-title"')}
        <span aria-hidden="true"></span>
        ${i18n("p", {
          zh: "围绕车型筛选，结合完整改装方向选择。",
          en: "Curated around the platform and the complete build direction.",
        })}
      </section>
      <section class="shop-selector" ${i18nAttribute("aria-label", { zh: "示例车型选择", en: "Sample vehicle selection" })}>
        <div class="shop-selector-heading">
          ${i18n("p", { zh: "示例车型", en: "SAMPLE VEHICLE" })}
          ${i18n("h1", { zh: "选择你的车型", en: "SELECT YOUR VEHICLE" })}
        </div>
        <div class="shop-mobile-vehicle-summary" data-mobile-vehicle-summary>
          <img src="../assets/images/网页/optimized/case-01.jpg" srcset="${srcsetFor("case-01", "../")}" sizes="(max-width: 768px) 96px, 180px" alt="BMW G80 M3 sample vehicle" data-zh-alt="BMW G80 M3 示例车型" data-en-alt="BMW G80 M3 sample vehicle" width="1920" height="1282" decoding="async" />
          <p>
            <strong><span data-mobile-vehicle-make>BMW</span> <span data-mobile-vehicle-model>G80 M3</span></strong>
            <span><span data-mobile-vehicle-year>2024</span> · <span data-mobile-vehicle-chassis>G8X</span></span>
          </p>
          ${i18n("button", { zh: "编辑", en: "EDIT" }, ' type="button" data-mobile-vehicle-edit aria-expanded="false" aria-controls="shop-vehicle-fields"')}
        </div>
        <div class="shop-selector-fields" id="shop-vehicle-fields">
          <label class="shop-field" for="shop-make">
            ${i18n("span", { zh: "品牌", en: "MAKE" })}
            <select id="shop-make" data-shop-make>
                ${renderOptions(shopVehicles.makes)}
            </select>
          </label>
          <label class="shop-field" for="shop-model">
            ${i18n("span", { zh: "车型", en: "MODEL" })}
            <select id="shop-model" data-shop-model>
                ${renderOptions([...new Set(shopVehicles.tuples.map(({ model }) => model))])}
            </select>
          </label>
          <label class="shop-field" for="shop-year">
            ${i18n("span", { zh: "年份", en: "YEAR" })}
            <select id="shop-year" data-shop-year>
                ${renderOptions([...new Set(shopVehicles.tuples.map(({ year }) => year))])}
            </select>
          </label>
          <label class="shop-field" for="shop-chassis">
            ${i18n("span", { zh: "底盘", en: "CHASSIS" })}
            <select id="shop-chassis" data-shop-chassis>
                ${renderOptions([...new Set(shopVehicles.tuples.map(({ chassis }) => chassis))])}
            </select>
          </label>
          ${i18n("button", { zh: "查找部件", en: "FIND PARTS" }, ' class="shop-find-button" type="button" data-find-parts')}
        </div>
      </section>

      <section class="shop-catalog" ${i18nAttribute("aria-label", { zh: "性能部件示例目录", en: "Sample performance parts catalog" })}>
        <details class="shop-filter">
          ${i18n("summary", { zh: "筛选部件", en: "FILTER PARTS" })}
          <div class="shop-filter-body">
            <div class="shop-filter-heading">
              ${i18n("p", { zh: "性能部件", en: "PERFORMANCE PARTS" })}
              <span aria-hidden="true"></span>
            </div>
            <fieldset>
              ${i18n("legend", { zh: "分类", en: "CATEGORY" })}
              ${Object.entries(categoryLabels).map(renderFilter).join("\n              ")}
            </fieldset>
            <div class="shop-availability">
              ${i18n("h2", { zh: "状态", en: "AVAILABILITY" })}
              ${i18n("p", { zh: `仅限咨询 · ${productCount} 项示例`, en: `INQUIRY ONLY · ${productCount} SAMPLES` })}
            </div>
            ${i18n("p", {
              zh: "示例分类仅用于设计预览。车型适配、规格与安装请向 LONMA DYNAMIC 确认。",
              en: "SAMPLE CATEGORIES FOR DESIGN REVIEW. CONFIRM VEHICLE FITMENT, SPECIFICATION, AND INSTALLATION WITH LONMA DYNAMIC.",
            }, ' class="shop-filter-note"')}
          </div>
        </details>

        <div class="shop-products">
          <div class="shop-results-bar">
            ${i18n("p", { zh: `${productCount} 项示例结果`, en: `${productCount} SAMPLE RESULTS` }, ' data-results-status aria-live="polite"')}
            <label class="shop-sort">
              ${i18n("span", { zh: "排序", en: "SORT BY" })}
              <select data-shop-sort>
                <option value="featured" data-zh="推荐顺序" data-en="Featured">Featured</option>
                <option value="category" data-zh="按分类" data-en="Category">Category</option>
              </select>
            </label>
          </div>
          <div class="shop-product-grid">
            ${products.map(renderProductCard).join("\n            ")}
          </div>
          <section class="shop-empty-state" data-results-empty hidden>
            ${i18n("h2", { zh: "未找到示例结果", en: "NO SAMPLE RESULTS" })}
            ${i18n("p", {
              zh: "请调整分类，或联系 LONMA DYNAMIC 确认你的车型需求。",
              en: "ADJUST THE CATEGORY OR CONTACT LONMA DYNAMIC TO CONFIRM YOUR VEHICLE REQUIREMENTS.",
            })}
            <a href="./contact.html" data-zh="联系 LONMA DYNAMIC →" data-en="CONTACT LONMA DYNAMIC →">CONTACT LONMA DYNAMIC →</a>
          </section>
        </div>
      </section>

      <dialog class="shop-dialog" data-product-dialog aria-labelledby="shop-dialog-title">
        <div class="shop-dialog-panel">
          <button type="button" data-dialog-close aria-label="Close product details" data-zh-aria-label="关闭产品详情" data-en-aria-label="Close product details">×</button>
          <img data-dialog-image src="../${escapeAttribute(firstProduct.image)}" ${i18nAttribute("alt", firstProduct.alt)} />
          <div class="shop-dialog-copy">
            ${i18n("p", categoryLabels[firstProduct.category], ' data-dialog-category')}
            ${i18n("h2", firstProduct.title, ' id="shop-dialog-title" data-dialog-title')}
            ${i18n("p", firstProduct.compatibility ?? fitmentUnknown, ' class="shop-dialog-compatibility" data-dialog-compatibility')}
            ${i18n("p", firstProduct.description, ' data-dialog-description')}
          </div>
          <div class="shop-dialog-footer">
            <a data-dialog-inquiry href="${escapeAttribute(`./contact.html?product=${encodeURIComponent(firstProduct.id)}&subject=${encodeURIComponent(inquirySubjectFor(firstProduct).en)}`)}" data-zh="咨询详情 →" data-en="REQUEST DETAILS →">REQUEST DETAILS →</a>
          </div>
        </div>
      </dialog>
      ${footer}
    </main>
    <script type="application/json" data-shop-vehicle-data>${serializeJson(shopVehicles.tuples)}</script>
    <script src="../content-pages.js?v=sanity-case-cms-20260801"></script>
    <script src="../shop.js?v=sanity-case-cms-20260801"></script>
  </body>
</html>
`;
};

export async function writeShopPage() {
  await mkdir(resolve(root, "pages"), { recursive: true });
  await mkdir(resolve(root, "pages/shop"), { recursive: true });
  await writeFile(resolve(root, "pages/shop.html"), renderShopPage());
  for (const product of shopProducts) {
    const render = product.detail ? renderConfigurableProductPage : renderProductItemPage;
    await writeFile(resolve(root, `pages/shop/${product.id}.html`), render(product));
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await writeShopPage();
}
