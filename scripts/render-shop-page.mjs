import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { shopProducts, shopVehicles } from "../shop-data.mjs";

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

const categoryLabels = {
  wheels: { en: "WHEELS", zh: "轮毂" },
  intake: { en: "INTAKE", zh: "进气" },
  suspension: { en: "SUSPENSION", zh: "悬挂" },
  brakes: { en: "BRAKES", zh: "刹车" },
  aero: { en: "AERO", zh: "空气动力" },
  exhaust: { en: "EXHAUST", zh: "排气" },
};
const managedProductCategories = [...Object.keys(categoryLabels), "ecu"];

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
  const actionCopy = product.id === "forged-wheel"
    ? { zh: "查看配置 →", en: "CONFIGURE →" }
    : { zh: "查看详情 →", en: "VIEW DETAILS →" };
  const accessibleAction = product.id === "forged-wheel"
    ? {
        en: `Configure ${product.title.en}`,
        zh: `配置${product.title.zh}`,
      }
    : {
        en: `View details for ${product.title.en}`,
        zh: `查看${product.title.zh}详情`,
      };
  const target = product.id === "forged-wheel"
    ? `<a class="shop-product-target"
          href="./shop/forged-wheel.html"
          data-product-link="forged-wheel"
          ${i18nAttribute("aria-label", accessibleAction)}></a>`
    : `<button class="shop-product-target"
             type="button"
             data-product-open
             data-product-id="${escapeAttribute(product.id)}"
             ${i18nAttribute("aria-label", accessibleAction)}></button>`;

  return `<article
            class="shop-product-card"
            data-product-card
            data-category="${escapeAttribute(product.category)}"
            data-product-id="${escapeAttribute(product.id)}"
            data-title-en="${escapeAttribute(product.title.en)}"
            data-title-zh="${escapeAttribute(product.title.zh)}"
            data-description-en="${escapeAttribute(product.description.en)}"
            data-description-zh="${escapeAttribute(product.description.zh)}"
            data-compatibility-en="${escapeAttribute(product.compatibility.en)}"
            data-compatibility-zh="${escapeAttribute(product.compatibility.zh)}"
            data-inquiry-subject-en="${escapeAttribute(product.inquirySubject.en)}"
            data-inquiry-subject-zh="${escapeAttribute(product.inquirySubject.zh)}"
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

export const renderForgedWheelPage = (
  product = shopProducts.find(({ id }) => id === "forged-wheel"),
) => {
  if (!product?.detail) {
    throw new Error("forged-wheel detail data is required");
  }

  const { detail } = product;
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

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Configure a forged wheel direction and request final fitment verification from LONMA DYNAMIC." />
    <title>Monoblock Forged Wheel | LONMA DYNAMIC</title>
    <link rel="stylesheet" href="../../styles.css?v=three-page-expansion-20260726" />
    <link rel="stylesheet" href="../../layout-canvas.css?v=three-page-expansion-20260726" />
    <link rel="stylesheet" href="../../shop-product.css?v=three-page-expansion-20260726" />
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
          <div class="product-stage-main">
            <img src="../../${escapeAttribute(product.image)}" ${i18nAttribute("alt", {
              en: "Forged performance wheel in satin black",
              zh: "缎面黑锻造性能轮毂",
            })} />
          </div>
          <div class="product-thumbnails" ${i18nAttribute("aria-label", { en: "Product views", zh: "产品视图" })}>
            <button type="button" aria-current="true" ${i18nAttribute("aria-label", { en: "Front wheel view", zh: "轮毂正面视图" })}><img src="../../${escapeAttribute(product.image)}" alt="" /></button>
          </div>
        </div>

        <div class="product-config">
          ${i18n("p", detail.kicker, ' class="product-kicker"')}
          ${i18n("h1", detail.title, ' id="product-title"')}
          ${i18n("p", detail.summary, ' class="product-summary"')}
          <p class="product-reference-price">
            ${i18n("span", { en: "REFERENCE PACKAGE", zh: "参考套装" })}
            <strong>${escapeText(detail.referencePrice.display)}</strong>
            ${i18n("small", detail.referencePrice.note)}
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
            <span class="product-action-price">${i18n("small", { en: "REFERENCE PACKAGE", zh: "参考套装" })}<strong>${escapeText(detail.referencePrice.display)}</strong></span>
            ${i18n("a", { en: "ADD TO BUILD", zh: "加入项目" }, " data-add-to-build")}
            ${i18n("a", { en: "REQUEST FITMENT CHECK", zh: "申请适配确认" }, " data-fitment-inquiry")}
          </div>
        </div>
      </section>

      <section class="product-specifications" aria-labelledby="product-specifications-title">
        ${i18n("p", { en: "PRODUCT DIRECTION", zh: "产品方向" }, ' class="product-kicker"')}
        ${i18n("h2", { en: "SPECIFICATIONS", zh: "规格" }, ' id="product-specifications-title"')}
        <dl>
          <div>${i18n("dt", { en: "CONSTRUCTION", zh: "结构" })}${i18n("dd", detail.specifications.construction)}</div>
          <div>${i18n("dt", { en: "APPLICATION", zh: "用途" })}${i18n("dd", detail.specifications.application)}</div>
          <div>${i18n("dt", { en: "FINISH", zh: "颜色" })}${i18n("dd", finishSpecification)}</div>
          <div>${i18n("dt", { en: "FITMENT", zh: "适配" })}${i18n("dd", detail.specifications.fitment)}</div>
        </dl>
      </section>

      <footer class="content-footer">
        <span>LONMA DYNAMIC</span>
        <span data-zh="龙马态度 · 2026" data-en="AUTOMOTIVE ATTITUDE · 2026">AUTOMOTIVE ATTITUDE · 2026</span>
        <a href="../contact.html" data-zh="直接联系 →" data-en="CONTACT DIRECTLY →">CONTACT DIRECTLY →</a>
      </footer>
    </main>
    <script type="application/json" data-product-config>${serializeJson(productConfig)}</script>
    <script src="../../content-pages.js?v=three-page-expansion-20260726"></script>
    <script src="../../shop-product.js?v=three-page-expansion-20260726"></script>
  </body>
</html>
`;
};

export const renderShopPage = (products = shopProducts) => {
  const firstProduct = products[0] || shopProducts[0];

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Browse sample performance-part categories for a selected vehicle and contact LONMA DYNAMIC for fitment and installation details." />
    <title>Shop | LONMA DYNAMIC</title>
    <link rel="stylesheet" href="../styles.css?v=three-page-expansion-20260726" />
    <link rel="stylesheet" href="../layout-canvas.css?v=three-page-expansion-20260726" />
    <link rel="stylesheet" href="../shop.css?v=three-page-expansion-20260726" />
  </head>
  <body data-section="shop">
    <main class="site-shell shop-page" ${i18nAttribute("aria-label", { zh: "LONMA DYNAMIC 商店", en: "LONMA DYNAMIC shop" })}>
      ${header}
      <section class="shop-selector" ${i18nAttribute("aria-label", { zh: "示例车型选择", en: "Sample vehicle selection" })}>
        <div class="shop-selector-heading">
          ${i18n("p", { zh: "示例车型", en: "SAMPLE VEHICLE" })}
          ${i18n("h1", { zh: "选择你的车型", en: "SELECT YOUR VEHICLE" })}
        </div>
        <div class="shop-mobile-vehicle-summary" data-mobile-vehicle-summary>
          <img src="../assets/images/网页/optimized/case-01.jpg" alt="BMW G80 M3 sample vehicle" data-zh-alt="BMW G80 M3 示例车型" data-en-alt="BMW G80 M3 sample vehicle" />
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
              ${i18n("p", { zh: "仅限咨询 · 06 项示例", en: "INQUIRY ONLY · 06 SAMPLES" })}
            </div>
            ${i18n("p", {
              zh: "示例分类仅用于设计预览。车型适配、规格与安装请向 LONMA DYNAMIC 确认。",
              en: "SAMPLE CATEGORIES FOR DESIGN REVIEW. CONFIRM VEHICLE FITMENT, SPECIFICATION, AND INSTALLATION WITH LONMA DYNAMIC.",
            }, ' class="shop-filter-note"')}
          </div>
        </details>

        <div class="shop-products">
          <div class="shop-results-bar">
            ${i18n("p", { zh: "06 项示例结果", en: "06 SAMPLE RESULTS" }, ' data-results-status aria-live="polite"')}
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
            ${i18n("p", firstProduct.compatibility, ' class="shop-dialog-compatibility" data-dialog-compatibility')}
            ${i18n("p", firstProduct.description, ' data-dialog-description')}
          </div>
          <div class="shop-dialog-footer">
            <a data-dialog-inquiry href="${escapeAttribute(`./contact.html?product=${encodeURIComponent(firstProduct.id)}&subject=${encodeURIComponent(firstProduct.inquirySubject.en)}`)}" data-zh="咨询详情 →" data-en="REQUEST DETAILS →">REQUEST DETAILS →</a>
          </div>
        </div>
      </dialog>
      ${footer}
    </main>
    <script type="application/json" data-shop-vehicle-data>${serializeJson(shopVehicles.tuples)}</script>
    <script src="../content-pages.js?v=three-page-expansion-20260726"></script>
    <script src="../shop.js?v=three-page-expansion-20260726"></script>
  </body>
</html>
`;
};

export async function writeShopPage() {
  await mkdir(resolve(root, "pages"), { recursive: true });
  await mkdir(resolve(root, "pages/shop"), { recursive: true });
  await writeFile(resolve(root, "pages/shop.html"), renderShopPage());
  await writeFile(resolve(root, "pages/shop/forged-wheel.html"), renderForgedWheelPage());
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await writeShopPage();
}
