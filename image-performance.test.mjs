import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDerivativePlan,
  responsiveImages,
  srcsetFor,
} from "./image-performance.mjs";

test("responsive image manifest preserves approved sources and widths", () => {
  assert.deepEqual(
    responsiveImages.map(({ id }) => id),
    ["hero", "case-01", "case-02", "case-03", "case-04", "case-05", "case-06"],
  );

  const hero = responsiveImages[0];
  assert.deepEqual(hero.widths, [960, 1440, 2400]);
  assert.equal(hero.source, "assets/images/网页/首页背景.jpg");
  assert.equal(hero.fallback, hero.source);

  for (const record of responsiveImages) {
    assert.match(record.outputDirectory, /^assets\/images\/generated\//);
    assert.notEqual(record.outputDirectory, record.source);
    assert.equal(record.quality, 80);
  }
});

test("derivative plans never upscale or overwrite a source", () => {
  for (const record of responsiveImages) {
    const plan = buildDerivativePlan(record);
    assert.ok(plan.length > 0, `${record.id} should have at least one derivative`);
    assert.ok(plan.every(({ width }) => width <= record.sourceWidth));
    assert.ok(plan.every(({ destination }) => destination.endsWith(".webp")));
    assert.ok(plan.every(({ destination }) => destination !== record.source));
    assert.equal(new Set(plan.map(({ width }) => width)).size, plan.length);
  }
});

test("srcset output uses generated WebP widths and relative prefixes", () => {
  const srcset = srcsetFor("case-01", "../");
  assert.match(srcset, /\.\.\/assets\/images\/generated\/case-01\/case-01-640w\.webp 640w/);
  assert.match(srcset, /\.\.\/assets\/images\/generated\/case-01\/case-01-1600w\.webp 1600w/);
});
