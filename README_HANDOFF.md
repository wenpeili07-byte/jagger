# LONMA DYNAMIC — UI redesign handoff (2026-11-24)

This document began as the 2026-11-24 redesign handoff. Sections 1–6 describe
that original package; section 7 documents the current product generator.
The original package contains the complete redesigned site plus screenshots for desktop, iPad and phone.
It is the result of a page-by-page redesign of the original upload
`LONMA_DYNAMIC_for_Claude_2026-10-23.zip`.

中文摘要：此包包含已完成第二轮改版的完整网站原始码（`site/`）、相对原版的补丁（`patch/`）、
电脑 / iPad / 手机三端截图（`screenshots/`）和交互动画（`motion/`）。所有页面都已改版，
Sanity CMS 挂钩、中英文切换、表单提交逻辑都保持原样。

---

## 1. Package contents

| Folder | What it is |
|---|---|
| `site/` | Full updated static site (drop-in replacement for the original source). No `node_modules`. |
| `patch/lonma-all-fixes.patch` | Unified diff against the original upload (`diff -ruN original updated`). Verified: applies cleanly with `patch -p1` and reproduces `site/` exactly. |
| `patch/CHANGED_FILES.txt` | List of added / changed files. |
| `screenshots/desktop/` | Full-page screenshots at 1440 px wide, all 20 redesigned pages. |
| `screenshots/ipad/` | Full-page screenshots at 834 px (iPad portrait). |
| `screenshots/phone/` | Phone screens at real iPhone ratio (402 × 874), one file per screen: `<page>__00.jpg`, `__01.jpg`… Overview sheets: `44_phone_screens_main.jpg`, `47_…cases_short.jpg`, `48_…services_short.jpg`. |
| `motion/` | GIFs of the key interactions (home, services tiles, shop feature, product gallery, cases rail, case/service scroll chapters, about scroll, project configurator). |

Screenshot file names map to routes: `index` = home, `cases_case-02` = `/pages/cases/case-02`,
`services_ecu` = `/pages/services/ecu`, `shop_forged-wheel` = `/pages/shop/forged-wheel`.

## 2. Run, build and test

```bash
python3 -m http.server 8080          # run from the site root; the site uses .html paths
node scripts/render-detail-pages.mjs  # regenerates pages/cases/case-0*.html and pages/services/*.html
node scripts/render-shop-page.mjs     # regenerates pages/shop.html and all pages/shop/<id>.html
node scripts/render-seo-files.mjs     # regenerates sitemap.xml and page SEO
node --test                           # all tests must pass
```

Generated pages: **do not hand-edit** `pages/cases/case-0*.html`, `pages/services/*.html`,
`pages/shop.html`, `pages/shop/*.html` — edit the generators
(`scripts/render-detail-pages.mjs`, `scripts/render-shop-page.mjs`) and data
(`detail-pages-data.mjs`, `shop-data.mjs`) and regenerate.

## 3. What changed, page by page (all three clients)

| Page | Design chosen | Key files |
|---|---|---|
| Home `index.html` | Original layout and animation kept; polished (brand line, outlined DYNAMIC, film cards are real links to cases, glass detail panel). Six service tiles: per-tile photo, chips, round ↗ CTA. Phone: original info kept, fits one 17-size screen. | `layout-canvas.css`, `mobile-experience.css`, `styles.css`, `script.js` |
| Shop `pages/shop.html` | Borderless luxury catalogue; featured product stage on top (V3 detail + V4 spotlight); compact vehicle / category band; 4 columns ≥1280 px; calm phone layout. Deep link `shop.html?product=<id>`, `?category=<cat>`. | `shop.css`, `shop.js`, `scripts/render-shop-page.mjs` |
| Product `pages/shop/forged-wheel.html` | Luxury product page; multi-photo gallery with cross-fade (arrows, thumbs, keys, swipe); selection summary; figures band + specs + reference fitment table + ordering steps; "Complete the build" row. | `shop-product.css`, `shop-product.js` |
| Cases index `pages/cases.html` | Editorial archive. Hero rail shows 5 cases; wheel/arrow/swipe steps the active case and changes the background photo. Phone: 2-column archive. | `case-rail.css`, `pages/cases.js` |
| Case details `pages/cases/case-0*.html` | Concept 5 "shop the build" as base + concept 4 process timeline. Full-bleed cover → "shop the build" (car photo with hotspots + part list) → scroll chapters (sticky photo changes per step, every photo carries a shop link) → CTA → pagination → next-case banner. Case 02 keeps its film stage on top. Phone: generic cases skip the repeated part list (chapters already link to shop). | `scripts/render-detail-pages.mjs`, `case-detail.css`, `case-build.css`, `case-build.js` |
| Services index `pages/services.html` | Concept 4: home-style showroom tiles (3 × 2 desktop, 2 × 3 iPad, compact 2-column phone), outlined numbers, chips, related-build count, ↗ CTA. | `pages-2026.css` |
| Service details `pages/services/*.html` | A + B + C: full-bleed cover with hotspots → approach statement → sticky service sheet (focus, method, related builds, CTA) + included items + "pairs well with" shop cards → "builds that used this service" rail → scroll chapters → ivory CTA. Phone: chapters hidden (same on all six pages). | `scripts/render-detail-pages.mjs`, `service-detail.css`, `case-build.css` |
| Contact `pages/contact.html` | Original hero + left copy, merged with stepped form: progress bar, 4 step groups (vehicle → service → goal → you), service chips mirroring the hidden `<select>`, extra entries (planner, cases). Form fields, validation, `/api/contact` submit and prefill are unchanged. | `pages-2026.css`, `contact-steps.js` |
| Project planner `pages/project.html` | Concept 3 configurator: six workstream hotspots on the car (synced with step-3 checkboxes), live summary bar. Original 4-step logic in `project.js` untouched. | `pages-2026.css`, `project-config.js` |
| About `pages/about.html` | Concept 2: hero kept, numbers bar (6 services / 6 cases / 4-step loop), OBSERVE→MODIFY→TEST→REFINE as scroll chapters with a sticky photo. | `pages-2026.css`, `about-chapters.js` |

Shared component: `case-build.css` / `case-build.js` (hotspots, build rows/cards, photo shop tags,
scroll chapters) are used by both case and service detail pages.

## 4. Rules to keep (the tests enforce most of these)

- **Sanity CMS hooks** must stay: `data-cms="caseNumber|title|subtitle|lede|story|cover|vehicleModel|vehicleYear"`,
  `data-cms-media-sections`, `data-cms-pagination`, `data-case-slug`, `.mwg_effect060 .slides`, `.archive-grid`.
- **i18n**: every visible text node needs `data-zh` + `data-en` (or an entry in the neutral-copy registry in
  `english-copy.test.mjs`). Attributes use `data-zh-aria-label` / `data-en-aria-label`, `data-zh-alt` / `data-en-alt`.
- `mobile-experience.css` must be the **last** stylesheet on every page; new page styles
  (`pages-2026.css`) load before it and win by selector specificity.
- In shop / product CSS use the `scale:` / `translate:` properties, not `transform: scale()`; no `width: 100vw`.
- `.detail-copy h1` font-size must not use `vw` (use `cqw`). `pages/cases.js` must not use `requestAnimationFrame`.
- Services page keeps its original DOM contract (`services-workspace`, `service-process-rail`, six `data-service-row`,
  ECU row `data-active`, media + preview figures); the new look is CSS-only on top of it.
- About keeps exactly four `class="process-step"` articles in order OBSERVE, MODIFY, TEST, REFINE.

## 5. Content honesty — open items for the owner

These were deliberately **not** invented; they need real data:

1. "Shop the build" tags on case pages are **category references** derived from each case's own text, labelled
   "category reference; exact specification confirmed after assessment". Hotspot positions on photos were placed by eye.
   Replace with real per-car parts lists and positions when available (`caseBuildTags` in `detail-pages-data.mjs`).
2. Short category notes, the four generic process step descriptions on service pages, and the service
   "focus / method" lines were written from each service's existing intro / scope copy — owner should confirm wording.
3. Related cases per service come from the same category mapping (e.g. ECU → cases 02, 04, 06; photography → case 05 only).
4. Case 03 is labelled Mercedes-Benz and case 05 Audi in the archive, but the photos look like BMWs — confirm.
5. Product price US$3,200 and the sample products in `shop-data.mjs` are placeholders.
6. Canonical / domain: SEO data points at `jagger-sage.vercel.app` while the brand domain is LonmaDynamic.com — confirm.
7. Several sections reuse case photos as illustration (service chapters, about chapters, product "on car" view).
   Real workshop / testing / install photography would improve them a lot.
8. Project planner hotspot positions on the car are UI placement only, not claims about where work is done.

## 6. Suggested next steps

- Replace placeholder data above, then regenerate pages and re-run `node --test`.
- Add a "related part" field per media section in Sanity so CMS-added case photos can carry shop tags too.
- Product specs / fitment table now start collapsed on phone; keep this behavior when adding a configurable product.

## 7. 如何新增商品

在网站根目录编辑 `shop-data.mjs` 的 `shopProducts` 数组，每件商品至少填写：

| 字段 | 要求 |
|---|---|
| `id` | 唯一的小写英文与连字符，例如 `brake-kit`；决定详情页路径 `pages/shop/<id>.html`。 |
| `category` | 选择 `shopCategoryDefaults` 中已有的分类。 |
| `title.en` / `title.zh` | 英文与中文名称。 |
| `description.en` / `description.zh` | 真实、可核实的双语说明。 |
| `image` | 网站根目录下已存在的图片路径。商品图片建议放在 `assets/images/shop/`。 |
| `alt.en` / `alt.zh` | 图片的双语替代文字。 |

只填写上述字段时，生成器会创建询价详情页，按分类显示待确认清单；会从
`detail-pages-data.mjs` 的 `caseBuildTags` 找同分类案例作参考，没有对应案例就不显示。
可以在商品的 `inquiry` 中自行填写 `kicker`、`confirm` 和 `reference`；`reference: null`
表示明确不展示参考案例。`compatibility`、`inquirySubject` 可选，省略时使用中性默认文案。
这些默认值是咨询问题，不是商品规格或适配承诺。

如果已有**经确认**的可配置资料，填写 `detail`：双语标题、说明、规格、配置选项、
默认选项、适配资料和 `gallery`。图库每张可填双语 `label`、`alt`、图片路径及取景参数；
省略 `gallery` 时只展示商品主图。只有 `detail.referencePrice` 有经确认的资料时才显示价格；
其他商品统一显示「按车型报价 / ON REQUEST」。勿自行添加价格、型号或案例细节。

保存后执行：

```bash
node scripts/render-shop-page.mjs
node scripts/render-seo-files.mjs
node --test
```

这会自动生成商店卡片、顶部推荐入口、商品详情页、相关商品链接及 sitemap 条目。
生成的 HTML 不要手改。新增或调整分类时，同步维护 `shopCategoryDefaults` 的双语名称
和待确认清单，并核对参考案例是否真实对应。
