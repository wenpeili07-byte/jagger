# Mobile Services Compact Rows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the mobile Services rail narrower and more compact so it matches the approved Option 3 reference without changing its images, links, or interaction model.

**Architecture:** Keep the existing Services HTML and controller intact. Add regression assertions to the shared mobile stylesheet test, then make a page-scoped change inside the existing `@media (max-width: 767px)` block in `mobile-experience.css`.

**Tech Stack:** Static HTML, CSS media queries, Node.js built-in test runner.

## Global Constraints

- Only `pages/services.html` below `768px` changes visually.
- Inset the service rail by `16px` on both sides.
- Keep the existing `62% / 38%` copy-to-image split.
- Use a `140px` row minimum height and do not exceed `148px` at `390px` width.
- Use `18px` titles, `13px` descriptions, two description lines, a `9px` category label, and an `18px` service number.
- Preserve right-side imagery, links, active/focus states, and the desktop-only hover preview.
- Do not change JavaScript or stage the existing untracked `audit/` directory.

---

### Task 1: Compact the Mobile Services Rail

**Files:**
- Modify: `mobile-experience.test.mjs:190-234`
- Modify: `mobile-experience.css:429-498`

**Interfaces:**
- Consumes: the existing `@media (max-width: 767px)` Services rules and the `mediaBlock()` test helper.
- Produces: a `16px` inset mobile rail with stable compact row and typography values.

- [ ] **Step 1: Write the failing regression assertions**

Replace the current row, copy, and description assertions in
`mobile-experience.test.mjs` with:

```js
assert.match(
  mobile,
  /\.service-process-rail\s*\{[^}]*margin-inline:\s*16px/s,
  "service rail should use the approved inset mobile width",
);
assert.match(
  mobile,
  /\.service-process-row\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*62%\)\s+minmax\(0,\s*38%\)[^}]*min-height:\s*140px[^}]*aspect-ratio:\s*auto/s,
  "service rows should keep compact copy and image columns",
);
assert.match(
  mobile,
  /\.service-process-copy\s*\{[^}]*padding:\s*28px 24px 16px 52px[^}]*background:\s*#111315/s,
  "service copy should fit the compact row without covering the image",
);
assert.match(
  mobile,
  /\.service-process-copy h2\s*\{[^}]*font-size:\s*18px/s,
  "service titles should match the compact reference scale",
);
assert.match(
  mobile,
  /\.service-process-copy p\s*\{[^}]*font-size:\s*13px[^}]*-webkit-line-clamp:\s*2/s,
  "service descriptions should use two compact readable lines",
);
assert.match(
  mobile,
  /\.service-process-label\s*\{[^}]*font-size:\s*9px/s,
  "service labels should use the compact reference scale",
);
assert.match(
  mobile,
  /\.service-process-number\s*\{[^}]*font-size:\s*18px/s,
  "service numbers should remain visible without dominating the row",
);
```

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test mobile-experience.test.mjs
```

Expected: FAIL because the current rail has no `margin-inline`, rows use
`156px`, titles use `21px`, and descriptions use `16px`.

- [ ] **Step 3: Implement the minimal mobile CSS change**

Update the Services rules in `mobile-experience.css`:

```css
.service-process-rail {
  display: block;
  margin-inline: 16px;
}

.service-process-row {
  grid-template-columns: minmax(0, 62%) minmax(0, 38%);
  min-height: 140px;
  aspect-ratio: auto;
  overflow: hidden;
  border-top: 1px solid var(--line);
}

.service-process-copy {
  grid-row: 1;
  padding: 28px 24px 16px 52px;
  background: #111315;
}

.service-process-copy h2 {
  margin: 6px 0;
  font-size: 18px;
}

.service-process-copy p {
  display: -webkit-box;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.service-process-label {
  font-size: 9px;
}

.service-process-number {
  top: 18px;
  left: 16px;
  font-size: 18px;
}

.service-process-arrow {
  top: 18px;
  right: calc(38% + 10px);
  left: auto;
  font-size: 20px;
  transform: none;
}
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test mobile-experience.test.mjs
```

Expected: all tests in `mobile-experience.test.mjs` pass.

- [ ] **Step 5: Run the full automated suite**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test
```

Expected: zero failed tests.

- [ ] **Step 6: Commit the tested change**

```bash
git add mobile-experience.test.mjs mobile-experience.css
git commit -m "Compact mobile service rows"
```

### Task 2: Verify the Mobile Visual Result

**Files:**
- Inspect: `pages/services.html`
- Inspect: `audit/mobile-option3/services-source.png`
- Create locally only: `audit/mobile-services-compact/services-390x844.png`
- Create locally only: `audit/mobile-services-compact/services-426x922.png`

**Interfaces:**
- Consumes: the compact CSS result from Task 1.
- Produces: visual evidence that the approved proportions work at both target phone widths.

- [ ] **Step 1: Capture both mobile sizes**

Open `pages/services.html` at `390 x 844` and `426 x 922`, English by default,
with the page at the top. Save full-page screenshots under
`audit/mobile-services-compact/` and do not stage them.

- [ ] **Step 2: Inspect the result**

Confirm:

- Rail edges sit `16px` inside the viewport.
- All six rows use the same height, with no row above `148px` at `390px`.
- English and Chinese titles stay inside the copy column.
- Descriptions show at most two lines without entering the image column.
- Images remain undistorted and retain the `38%` column.
- Fixed bottom navigation does not cover the final row or footer.
- There is no horizontal overflow.

- [ ] **Step 3: Re-run the focused test after visual verification**

Run:

```bash
/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test mobile-experience.test.mjs
```

Expected: all focused tests pass after visual verification.
