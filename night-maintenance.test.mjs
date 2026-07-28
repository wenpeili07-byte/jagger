import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { caseAssets, imagePresets } from "./case-assets.mjs";
import { publicPages, siteOrigin } from "./seo-data.mjs";

const root = dirname(fileURLToPath(import.meta.url));

const read = (path) => readFile(resolve(root, path), "utf8");

const decodeEntities = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");

const attributeValue = (html, selector) => {
  const match = html.match(selector);
  return decodeEntities(match?.[1] ?? "");
};

test("case asset manifest covers Cases 01-06 and preserves current sources", async () => {
  assert.deepEqual(caseAssets.map(({ id }) => id), ["01", "02", "03", "04", "05", "06"]);
  assert.deepEqual(Object.keys(imagePresets).sort(), ["cover", "detailLandscape", "detailPortrait", "videoPoster"]);

  for (const record of caseAssets) {
    assert.match(record.source, /^assets\/images\/网页\/案例\d\/.+\.jpg$/i);
    assert.equal(record.cover, `assets/images/网页/optimized/case-${record.id}.jpg`);
    assert.equal(record.library, `assets/images/cases/case-${record.id}`);
    await access(resolve(root, record.source));
    await access(resolve(root, record.cover));
  }
});

test("case image preparation tool is non-destructive by default", async () => {
  const tool = await read("scripts/prepare-case-images.mjs");
  assert.match(tool, /--write/);
  assert.match(tool, /dry.run/i);
  assert.match(tool, /\.webp/);
  assert.doesNotMatch(tool, /rmSync|unlink|renameSync|truncate/);
});

test("every public page exposes canonical and complete social metadata", async () => {
  assert.equal(publicPages.length, 20);
  assert.equal(new Set(publicPages.map(({ route }) => route)).size, publicPages.length);

  for (const page of publicPages) {
    const html = await read(page.file);
    const canonical = attributeValue(html, /<link rel="canonical" href="([^"]+)" \/>/);
    const ogTitle = attributeValue(html, /<meta property="og:title" content="([^"]+)" \/>/);
    const ogDescription = attributeValue(html, /<meta property="og:description" content="([^"]+)" \/>/);
    const ogUrl = attributeValue(html, /<meta property="og:url" content="([^"]+)" \/>/);
    const ogImage = attributeValue(html, /<meta property="og:image" content="([^"]+)" \/>/);
    const twitterCard = attributeValue(html, /<meta name="twitter:card" content="([^"]+)" \/>/);
    const twitterTitle = attributeValue(html, /<meta name="twitter:title" content="([^"]+)" \/>/);
    const twitterDescription = attributeValue(html, /<meta name="twitter:description" content="([^"]+)" \/>/);
    const twitterImage = attributeValue(html, /<meta name="twitter:image" content="([^"]+)" \/>/);
    const favicon = attributeValue(html, /<link rel="icon" href="([^"]+)" type="image\/svg\+xml" \/>/);
    const expectedUrl = `${siteOrigin}${page.route}`;

    assert.equal(favicon, "/assets/favicon.svg", `${page.file} favicon`);
    assert.equal(canonical, expectedUrl, `${page.file} canonical`);
    assert.equal(ogTitle, page.title, `${page.file} og:title`);
    assert.equal(ogDescription, page.description, `${page.file} og:description`);
    assert.equal(ogUrl, expectedUrl, `${page.file} og:url`);
    assert.equal(ogImage, `${siteOrigin}${page.image}`, `${page.file} og:image`);
    assert.equal(twitterCard, "summary_large_image", `${page.file} twitter:card`);
    assert.equal(twitterTitle, page.title, `${page.file} twitter:title`);
    assert.equal(twitterDescription, page.description, `${page.file} twitter:description`);
    assert.equal(twitterImage, `${siteOrigin}${page.image}`, `${page.file} twitter:image`);
  }

  await access(resolve(root, "assets/favicon.svg"));
});

test("sitemap and robots expose every clean public route", async () => {
  const [sitemap, robots] = await Promise.all([read("sitemap.xml"), read("robots.txt")]);
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expected = publicPages.map(({ route }) => `${siteOrigin}${route}`);

  assert.deepEqual(locations, expected);
  assert.match(robots, /^User-agent: \*\nAllow: \/\n\nSitemap: /);
  assert.match(robots, new RegExp(`Sitemap: ${siteOrigin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/sitemap\\.xml`));
});

test("public HTML local links and assets resolve to checked-in files", async () => {
  for (const page of publicPages) {
    const html = await read(page.file);
    const base = dirname(resolve(root, page.file));
    const references = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((reference) =>
        !reference.startsWith("#") &&
        !reference.startsWith("http:") &&
        !reference.startsWith("https:") &&
        !reference.startsWith("mailto:") &&
        !reference.startsWith("data:") &&
        !reference.startsWith("/api/"),
      );

    for (const reference of references) {
      const clean = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
      if (!clean) continue;
      const target = clean.startsWith("/")
        ? resolve(root, `.${clean}`)
        : resolve(base, clean);
      const extension = extname(target);
      if (!extension) continue;
      await assert.doesNotReject(access(target), `${page.file} -> ${reference}`);
    }
  }
});
