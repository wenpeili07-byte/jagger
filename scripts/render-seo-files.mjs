import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { publicPages, renderSeoMeta, siteOrigin } from "../seo-data.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const staticFiles = new Set([
  "index.html",
  "pages/about.html",
  "pages/services.html",
  "pages/cases.html",
  "pages/contact.html",
  "pages/project.html",
]);

const seoBlockPattern = /\n    <!-- SEO:START -->[\s\S]*?\n    <!-- SEO:END -->/;

const updateStaticPage = async (page) => {
  const path = resolve(root, page.file);
  const source = await readFile(path, "utf8");
  const block = `\n    <!-- SEO:START -->\n    ${renderSeoMeta(page)}\n    <!-- SEO:END -->`;
  const next = seoBlockPattern.test(source)
    ? source.replace(seoBlockPattern, block)
    : source.replace(/(<title>[^<]+<\/title>)/, `$1${block}`);

  if (next === source && !source.includes("<!-- SEO:START -->")) {
    throw new Error(`Unable to add SEO metadata to ${page.file}`);
  }
  await writeFile(path, next);
};

const renderSitemap = () => {
  const locations = publicPages
    .map(({ route }) => `  <url><loc>${siteOrigin}${route}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locations}\n</urlset>\n`;
};

const renderRobots = () =>
  `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`;

export async function writeSeoFiles() {
  await Promise.all(publicPages.filter(({ file }) => staticFiles.has(file)).map(updateStaticPage));
  await Promise.all([
    writeFile(resolve(root, "sitemap.xml"), renderSitemap()),
    writeFile(resolve(root, "robots.txt"), renderRobots()),
  ]);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await writeSeoFiles();
}
