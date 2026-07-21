import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const pageGroups = [
  {
    section: "home",
    pages: ["./index.html"],
    currentHref: null,
  },
  {
    section: "about",
    pages: ["./pages/about.html"],
    currentHref: "./about.html",
  },
  {
    section: "services",
    pages: [
      "./pages/services.html",
      "./pages/services/build.html",
      "./pages/services/parts.html",
      "./pages/services/photo.html",
      "./pages/services/ecu.html",
      "./pages/services/chassis.html",
      "./pages/services/exhaust.html",
    ],
    currentHref: (path) => path.includes("/services/") ? "../services.html" : "./services.html",
  },
  {
    section: "cases",
    pages: [
      "./pages/cases.html",
      "./pages/cases/case-01.html",
      "./pages/cases/case-02.html",
      "./pages/cases/case-03.html",
      "./pages/cases/case-04.html",
      "./pages/cases/case-05.html",
      "./pages/cases/case-06.html",
    ],
    currentHref: (path) => path.includes("/cases/") ? "../cases.html" : "./cases.html",
  },
  {
    section: "contact",
    pages: ["./pages/contact.html"],
    currentHref: "./contact.html",
  },
];

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

for (const group of pageGroups) {
  for (const path of group.pages) {
    test(`${path} exposes the shared header and current section`, () => {
      const html = read(path);
      const header = html.match(/<header class="topbar">([\s\S]*?)<\/header>/)?.[1] ?? "";

      assert.match(html, new RegExp(`<body[^>]*data-section="${group.section}"`));
      assert.match(header, /<a class="brand"[^>]*data-zh-aria-label="回到首页"[^>]*data-en-aria-label="Back to home"/);
      assert.match(header, /<nav class="nav"[^>]*data-zh-aria-label="主导航"[^>]*data-en-aria-label="Main navigation"/);
      assert.equal((header.match(/<a href=/g) || []).length, 4);
      assert.match(header, /<button class="lang-toggle"[^>]*aria-label="Switch to English"/);

      const currentHref = typeof group.currentHref === "function"
        ? group.currentHref(path)
        : group.currentHref;

      if (currentHref) {
        const escapedHref = escapeRegExp(currentHref);
        assert.match(header, new RegExp(`<a href="${escapedHref}" aria-current="page">`));
        assert.equal((header.match(/aria-current="page"/g) || []).length, 1);
      } else {
        assert.doesNotMatch(header, /aria-current="page"/);
      }
    });
  }
}

const footerLinks = new Map([
  ["./index.html", "./pages/contact.html"],
  ["./pages/about.html", "./contact.html"],
  ["./pages/services.html", "./contact.html"],
  ["./pages/cases.html", "./contact.html"],
  ["./pages/contact.html", "./cases.html"],
]);

for (const number of ["01", "02", "03", "04", "05", "06"]) {
  footerLinks.set(`./pages/cases/case-${number}.html`, "../contact.html");
}

for (const slug of ["build", "parts", "photo", "ecu", "chassis", "exhaust"]) {
  footerLinks.set(`./pages/services/${slug}.html`, "../contact.html");
}

for (const [path, href] of footerLinks) {
  test(`${path} exposes one bilingual global footer`, () => {
    const html = read(path);
    const footers = [...html.matchAll(/<footer class="content-footer">([\s\S]*?)<\/footer>/g)];

    assert.equal(footers.length, 1);
    assert.match(footers[0][1], /<span>LONMA DYNAMIC<\/span>/);
    assert.match(
      footers[0][1],
      /data-zh="龙马态度 · 2026" data-en="AUTOMOTIVE ATTITUDE · 2026"/
    );
    assert.match(footers[0][1], new RegExp(`<a href="${escapeRegExp(href)}"`));
    assert.match(footers[0][1], /<a [^>]*data-zh="[^"]+ →" data-en="[^"]+ →"/);
  });
}

test("footer styling is global and not duplicated by content pages", () => {
  const sharedCss = read("./styles.css");
  const contentCss = read("./content-pages.css");

  assert.match(sharedCss, /\.content-footer\s*\{[^}]*grid-template-columns:\s*1fr auto 1fr/s);
  assert.match(sharedCss, /\.content-footer a:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent-bright\)/s);
  assert.match(sharedCss, /\.content-footer a:hover\s*\{[^}]*color:\s*var\(--ink\)/s);
  assert.match(sharedCss, /\.content-footer a:focus-visible\s*\{[^}]*color:\s*var\(--ink\)/s);
  assert.doesNotMatch(contentCss, /\.content-footer/);
});
