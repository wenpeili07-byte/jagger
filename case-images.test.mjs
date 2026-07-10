import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "styles.css"), "utf8");

const caseImages = [
  "assets/images/网页/optimized/case-01.jpg",
  "assets/images/网页/optimized/case-02.jpg",
  "assets/images/网页/optimized/case-03.jpg",
  "assets/images/网页/optimized/case-04.jpg",
  "assets/images/网页/optimized/case-05.jpg",
  "assets/images/网页/optimized/case-06.jpg"
];

caseImages.forEach((imagePath, index) => {
  const cardIndex = index;
  const cardRule = new RegExp(`\\.film-card\\[data-index="${cardIndex}"\\][\\s\\S]*?\\n\\}`, "m");
  const match = css.match(cardRule);

  const fullPath = join(here, imagePath);
  assert.ok(existsSync(fullPath), `case ${index + 1} optimized image should exist`);
  assert.ok(statSync(fullPath).size < 700 * 1024, `case ${index + 1} optimized image should stay under 700KB`);

  assert.ok(match, `case ${index + 1} card should have a scene rule`);
  assert.ok(
    match[0].includes(`url("./${imagePath}")`),
    `case ${index + 1} card should link to its optimized image`
  );
});
