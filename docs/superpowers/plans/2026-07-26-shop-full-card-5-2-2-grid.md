# Shop Full-Card 5/2/2 Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every Shop product card fully interactive and display products in an R44-inspired five/two/two responsive grid with larger, readable card typography.

**Architecture:** Keep `shop-data.mjs` as the source of truth and `scripts/render-shop-page.mjs` as the only owner of checked-in Shop markup. Each generated card receives one transparent full-card link or button target, while `shop.js` continues to synchronize the forged-wheel URL and open dialogs for the remaining products. `shop.css` owns the five/two/two breakpoints, wrapping, hover, and focus presentation.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node.js built-in test runner, existing Shop page renderer.

## Global Constraints

- Wide desktop, `1400px` and above: five products per row.
- Tablet and narrower desktop, `741px` through `1399px`: two products per row.
- Mobile, `740px` and below: two products per row.
- The forged-wheel card enters its existing product-detail page.
- The other five cards open their existing detail dialogs.
- Each card has one primary interactive target with visible keyboard focus.
- Category, availability, and CTA copy use `11px` to `12px`; titles remain between `17px` and `21px`.
- Existing filters, sorting, bilingual copy, product data, and vehicle query parameters do not change.
- Do not stage or modify the unrelated untracked `audit/` directory.

---

### Task 1: Make Each Product Card One Full-Card Target

**Files:**
- Modify: `shop.test.mjs`
- Modify: `scripts/render-shop-page.mjs`
- Modify: `pages/shop.html` through the renderer
- Verify: `shop.js`

**Interfaces:**
- Consumes: `shopProducts`, `i18n()`, `i18nAttribute()`, and the existing `data-product-link` / `data-product-open` controller selectors.
- Produces: `.shop-product-target` as the sole interactive element in each `.shop-product-card`; exactly one `data-product-link` and five `data-product-open` targets.

- [ ] **Step 1: Write the failing renderer test**

Add these assertions beside the existing deep-link test in `shop.test.mjs`:

```js
test("every shop card exposes one full-card primary target", () => {
  assert.equal((html.match(/class="shop-product-target"/g) || []).length, 6);
  assert.equal((html.match(/data-product-link=/g) || []).length, 1);
  assert.equal((html.match(/data-product-open/g) || []).length, 5);
  assert.equal((html.match(/class="shop-product-action-copy"/g) || []).length, 6);
  assert.doesNotMatch(
    html,
    /class="shop-product-meta"[\s\S]*<(?:a|button)[^>]*(?:data-product-link|data-product-open)/,
  );
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test shop.test.mjs
```

Expected: FAIL because `.shop-product-target` and `.shop-product-action-copy` are not rendered.

- [ ] **Step 3: Render one overlay target per card**

In `renderProductCard()` inside `scripts/render-shop-page.mjs`, replace the current footer action with non-interactive visible copy:

```js
const actionCopy = product.id === "forged-wheel"
  ? { zh: "查看配置 →", en: "CONFIGURE →" }
  : { zh: "查看详情 →", en: "VIEW DETAILS →" };
```

Render it inside `.shop-product-meta`:

```js
${i18n("span", actionCopy, ' class="shop-product-action-copy"')}
```

After `.shop-product-copy`, render the only interactive target:

```js
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
```

Append `${target}` as the final child of the article. Keep the existing controller selectors so `syncProductLinks()` and `openProductDialog()` require no behavioral rewrite.

- [ ] **Step 4: Regenerate checked-in Shop HTML**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node scripts/render-shop-page.mjs
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test shop.test.mjs
```

Expected: all Shop tests pass, including URL query synchronization, dialog opening, Escape dismissal, and focus restoration.

- [ ] **Step 6: Commit the interaction change**

```bash
git add shop.test.mjs scripts/render-shop-page.mjs pages/shop.html
git commit -m "Expand shop product card targets"
```

---

### Task 2: Apply The 5/2/2 Grid And Larger Typography

**Files:**
- Modify: `shop.test.mjs`
- Modify: `shop.css`

**Interfaces:**
- Consumes: `.shop-product-grid`, `.shop-product-card`, `.shop-product-target`, `.shop-product-category`, `.shop-product-action-copy`, and `.shop-product-meta`.
- Produces: a five-column grid at `1400px+`, two columns below `1400px`, readable wrapping card copy, and full-card hover/focus feedback.

- [ ] **Step 1: Write the failing CSS contract test**

Add this test to `shop.test.mjs`:

```js
test("shop uses the approved five two two grid and readable full-card states", () => {
  assert.match(
    css,
    /\.shop-product-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
  );
  assert.match(
    css,
    /@media \(min-width:\s*1400px\)[\s\S]*?\.shop-product-grid\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/s,
  );
  assert.match(
    css,
    /@media \(max-width:\s*767px\)[\s\S]*?\.shop-product-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
  );
  assert.match(css, /\.shop-product-target\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0/s);
  assert.match(css, /\.shop-product-card:focus-within/);
  assert.match(css, /\.shop-product-category\s*\{[^}]*font-size:\s*11px/s);
  assert.match(css, /\.shop-product-card h2\s*\{[^}]*font-size:\s*clamp\(18px,\s*1\.1vw,\s*21px\)/s);
  assert.match(css, /\.shop-product-meta\s*\{[^}]*font-size:\s*11px/s);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test shop.test.mjs
```

Expected: FAIL because the current grid is three/two/one, card labels are `10px`, and there is no full-card overlay styling.

- [ ] **Step 3: Implement the grid, typography, and card states**

In `shop.css`:

```css
.shop-product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.shop-product-card {
  position: relative;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.shop-product-target {
  position: absolute;
  z-index: 2;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  color: transparent;
  background: transparent;
  cursor: pointer;
}

.shop-product-card:hover,
.shop-product-card:focus-within {
  border-color: var(--accent-bright);
  background: #151a1e;
  box-shadow: 0 0 24px var(--accent-glow);
}

.shop-product-target:focus-visible {
  outline: 2px solid var(--accent-bright);
  outline-offset: -3px;
}

.shop-product-category,
.shop-product-meta {
  font-size: 11px;
}

.shop-product-card h2 {
  font-size: clamp(18px, 1.1vw, 21px);
  overflow-wrap: anywhere;
}

.shop-product-action-copy {
  color: var(--accent-bright);
  font-weight: 700;
}

@media (min-width: 1400px) {
  .shop-product-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (min-width: 768px) and (max-width: 1279px) {
  .shop-product-card h2 {
    font-size: 20px;
  }
}

@media (max-width: 767px) {
  .shop-product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .shop-product-copy {
    min-height: 170px;
    padding: 16px 12px;
  }

  .shop-product-meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }
}
```

Merge these declarations into the existing selectors and media blocks rather than duplicating them. Keep the existing `768px` / `767px` structural breakpoints: the base two-column declaration covers `741px` through `1399px`, and the existing mobile override remains explicitly two columns through `767px`. Only the new `1400px` rule changes the grid to five columns.

- [ ] **Step 4: Run focused layout tests and verify GREEN**

Run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test shop.test.mjs responsive-layout.test.mjs
```

Expected: both suites pass with no overflow or stale one-column mobile assertion.

- [ ] **Step 5: Commit the layout change**

```bash
git add shop.css shop.test.mjs
git commit -m "Use five two two shop grid"
```

---

## Final Verification

- [ ] Run the complete static suite:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test *.test.mjs
```

- [ ] Start the local static preview:

```bash
python3 -m http.server 4205
```

- [ ] Check `/pages/shop.html` at `1728x1050`, `1024x768`, and `390x844`.
- [ ] Confirm visible product columns are `5`, `2`, and `2`.
- [ ] Confirm all English and Chinese titles remain visible without horizontal overflow.
- [ ] Confirm the forged-wheel full card navigates to `/pages/shop/forged-wheel.html` with vehicle query parameters.
- [ ] Confirm each of the other five full cards opens its dialog and closing it restores focus.
- [ ] Confirm reduced-motion and keyboard focus indicators remain present.
- [ ] Confirm `git status --short` contains only intentional Shop changes plus the pre-existing untracked `audit/`.
