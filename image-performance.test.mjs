import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  buildDerivativePlan,
  responsiveImages,
  srcsetFor,
} from "./image-performance.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const read = (path) => readFile(resolve(root, path), "utf8");

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
    assert.ok(record.sourceWidth > 0 && record.sourceHeight > 0);
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

test("every planned derivative exists and is smaller than its source", async () => {
  for (const record of responsiveImages) {
    const sourceStats = await stat(resolve(root, record.source));

    for (const { destination } of buildDerivativePlan(record)) {
      const target = resolve(root, destination);
      await access(target);
      const generatedStats = await stat(target);
      assert.ok(
        generatedStats.size < sourceStats.size,
        `${destination} should be smaller than ${record.source}`,
      );
    }
  }
});

test("responsive image generator cannot delete or overwrite source files", async () => {
  const source = await readFile(resolve(root, "scripts/generate-responsive-images.mjs"), "utf8");
  assert.match(source, /assets\/images\/generated/);
  assert.match(source, /withoutEnlargement:\s*true/);
  assert.doesNotMatch(source, /\bunlink\b|\brmSync\b|\brename\b|\btruncate\b/);
  assert.doesNotMatch(source, /toFile\(record\.source\)/);
});

test("high-traffic pages advertise responsive WebP sources", async () => {
  const [home, about, services, cases, contact, project, shop] = await Promise.all([
    read("index.html"),
    read("pages/about.html"),
    read("pages/services.html"),
    read("pages/cases.html"),
    read("pages/contact.html"),
    read("pages/project.html"),
    read("pages/shop.html"),
  ]);

  assert.match(home, /srcset="[^"]*hero-960w\.webp 960w[^"]*hero-2400w\.webp 2400w"/);
  assert.match(about, /srcset="[^"]*hero-960w\.webp 960w[^"]*hero-2400w\.webp 2400w"/);
  assert.match(about, /fetchpriority="high"/);
  assert.match(services, /case-01-640w\.webp 640w/);
  assert.match(cases, /case-01-640w\.webp 640w/);
  assert.match(contact, /case-06-640w\.webp 640w/);
  assert.match(project, /case-02-640w\.webp 640w/);
  assert.match(shop, /case-01-640w\.webp 640w/);

  for (const html of [home, about, services, cases, contact, project, shop]) {
    for (const match of html.matchAll(/<img\b[^>]*>/gs)) {
      const tag = match[0];
      assert.ok(
        !(tag.includes('fetchpriority="high"') && tag.includes('loading="lazy"')),
        "a priority image must not be lazy-loaded",
      );
    }
  }
});

test("background scenes use generated WebP with JPEG fallback", async () => {
  const styles = await read("styles.css");
  assert.match(styles, /--active-case-scene:\s*image-set\([^;]*hero-2400w\.webp[^;]*首页背景\.jpg/);
  assert.match(styles, /--scene:\s*image-set\([^;]*case-01-1600w\.webp[^;]*case-01\.jpg/);
  assert.match(styles, /--cases-active-scene:\s*image-set\([^;]*case-01-1600w\.webp[^;]*case-01\.jpg/);
});

test("generated detail pages inherit responsive case markup while social images stay JPEG", async () => {
  const [renderer, casePage, servicePage] = await Promise.all([
    read("scripts/render-detail-pages.mjs"),
    read("pages/cases/case-01.html"),
    read("pages/services/build.html"),
  ]);

  assert.match(renderer, /srcsetFor/);
  assert.match(casePage, /case-01-640w\.webp 640w/);
  assert.match(servicePage, /case-01-640w\.webp 640w/);
  assert.match(casePage, /<meta property="og:image" content="[^"]*case-01\.jpg" \/>/);
  assert.match(servicePage, /<meta property="og:image" content="[^"]*case-01\.jpg" \/>/);
});
