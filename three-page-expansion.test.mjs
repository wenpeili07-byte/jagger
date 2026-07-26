import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("the three approved customer routes exist", () => {
  for (const path of [
    "./pages/project.html",
    "./pages/shop/forged-wheel.html",
    "./pages/cases/case-02.html",
  ]) {
    assert.equal(existsSync(new URL(path, import.meta.url)), true, path);
  }
});

test("the strongest project calls route to the planner", () => {
  assert.match(read("./index.html"), /href="\.\/pages\/project\.html"[^>]*data-en="START YOUR PROJECT →"/);
  assert.match(read("./pages/services/build.html"), /href="\.\.\/project\.html"[^>]*data-en="START YOUR PROJECT →"/);
});

test("the contact page exposes a bilingual prefill notice", () => {
  const html = read("./pages/contact.html");
  assert.match(html, /data-contact-prefill-status/);
  assert.match(html, /data-en="PROJECT DETAILS ADDED FROM YOUR SELECTIONS\."/);
  assert.match(html, /data-zh="已载入你选择的项目资料。"/);
});

test("the project route loads its planner assets and authentic local image", () => {
  const html = read("./pages/project.html");

  assert.match(html, /href="\.\.\/project\.css\?v=project-planner-20260726"/);
  assert.match(html, /src="\.\.\/project\.js\?v=project-planner-20260726"/);
  assert.match(html, /src="\.\.\/assets\/images\/网页\/optimized\/case-01\.jpg"/);
});
