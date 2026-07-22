import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { caseDetails, serviceDetails } from "./detail-pages-data.mjs";
import { renderCasePage, renderServicePage } from "./scripts/render-detail-pages.mjs";
import { renderShopPage } from "./scripts/render-shop-page.mjs";

const sharedAssetVersion = "shop-case02-20260722-2";
const publicPages = [
  "./index.html",
  "./pages/about.html",
  "./pages/services.html",
  "./pages/services/build.html",
  "./pages/services/parts.html",
  "./pages/services/photo.html",
  "./pages/services/ecu.html",
  "./pages/services/chassis.html",
  "./pages/services/exhaust.html",
  "./pages/cases.html",
  "./pages/cases/case-01.html",
  "./pages/cases/case-02.html",
  "./pages/cases/case-03.html",
  "./pages/cases/case-04.html",
  "./pages/cases/case-05.html",
  "./pages/cases/case-06.html",
  "./pages/contact.html",
  "./pages/shop.html",
];
const staleWarmCacheKeys = new Set([
  "styles.css?v=global-shell-20260721",
  "styles.css?v=global-shell-20260722",
  "content-pages.js?v=english-copy-20260721",
  "script.js?v=global-shell-20260721-2",
]);
const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

function assetReference(source, asset, label) {
  const match = source.match(new RegExp(`${asset.replace(".", "\\.")}\\?v=([^\"']+)`));
  assert.ok(match, `${label} should reference ${asset} with a cache key`);
  return { asset, key: `${asset}?v=${match[1]}`, version: match[1] };
}

test("all public and generated shared assets use one advanced cache version", () => {
  const references = [];

  for (const path of publicPages) {
    const html = read(path);
    references.push(assetReference(html, "styles.css", path));
    references.push(assetReference(html, path === "./index.html" ? "script.js" : "content-pages.js", path));
  }

  const generatedOutputs = [
    ["generic case renderer", renderCasePage(caseDetails.find((record) => record.id === "01"))],
    ["Case 02 renderer", renderCasePage(caseDetails.find((record) => record.id === "02"))],
    ["service renderer", renderServicePage(serviceDetails[0])],
    ["Shop renderer", renderShopPage()],
  ];

  for (const [label, html] of generatedOutputs) {
    references.push(assetReference(html, "styles.css", label));
    references.push(assetReference(html, "content-pages.js", label));
  }

  assert.deepEqual(
    [...new Set(references.map(({ version }) => version))],
    [sharedAssetVersion],
    "styles.css, script.js, and content-pages.js should advance in lockstep",
  );
});

test("new shared references cannot collide with known warm-cache entries", () => {
  for (const path of publicPages) {
    const html = read(path);
    const assets = ["styles.css", path === "./index.html" ? "script.js" : "content-pages.js"];

    for (const asset of assets) {
      const reference = assetReference(html, asset, path);
      assert.equal(reference.version, sharedAssetVersion);
      assert.equal(staleWarmCacheKeys.has(reference.key), false, `${path} should not reuse ${reference.key}`);
    }
  }
});
