import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { caseDetails } from "./detail-pages-data.mjs";
import { renderCasePage } from "./scripts/render-detail-pages.mjs";

const case02 = caseDetails.find((record) => record.id === "02");
const html = readFileSync(new URL("./pages/cases/case-02.html", import.meta.url), "utf8");

test("Case 02 owns four category-level parts references", () => {
  assert.equal(case02.partsUsed.length, 4);
  assert.deepEqual(case02.partsUsed.map((part) => part.category), ["brakes", "suspension", "wheels", "ecu"]);
});

test("Case 02 uses the approved special layout and real hero", () => {
  assert.match(html, /class="case02-showcase"/);
  assert.match(html, /optimized\/case-02\.jpg/);
  assert.equal((html.match(/data-case-marker/g) || []).length, 4);
  assert.equal((html.match(/data-case-part/g) || []).length, 4);
  assert.match(html, /PARTS USED/);
  assert.match(html, /href="\.\.\/shop\.html\?category=brakes"/);
  assert.doesNotMatch(html, /\$\s?\d|IN STOCK|data-price/i);
});

test("other cases retain the generic template", () => {
  for (const record of caseDetails.filter((item) => item.id !== "02")) {
    const output = renderCasePage(record);
    assert.match(output, /class="detail-hero"/);
    assert.doesNotMatch(output, /case02-showcase|data-case-marker|data-case-part/);
  }
});
