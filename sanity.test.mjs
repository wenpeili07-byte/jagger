import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync(new URL("./sanity/package.json", import.meta.url), "utf8"));
const config = readFileSync(new URL("./sanity/sanity.config.js", import.meta.url), "utf8");
const schemaIndex = readFileSync(new URL("./sanity/schemaTypes/index.js", import.meta.url), "utf8");
const caseSchema = readFileSync(new URL("./sanity/schemaTypes/casePage.js", import.meta.url), "utf8");
const readme = readFileSync(new URL("./sanity/README.md", import.meta.url), "utf8");
const vercelConfigUrl = new URL("./sanity/vercel.json", import.meta.url);

assert.equal(packageJson.name, "lonma-dynamic-sanity-studio", "Sanity Studio should have a dedicated package");
assert.equal(packageJson.type, "module", "Sanity Studio should use ESM config files");
assert.match(packageJson.scripts.dev, /sanity dev --host 127\.0\.0\.1 --port 3333/, "Sanity Studio should run on a predictable local port");
assert.ok(packageJson.dependencies.sanity, "Sanity Studio should depend on Sanity");
assert.ok(packageJson.dependencies["@sanity/vision"], "Sanity Studio should include Vision for content inspection");

assert.match(config, /defineConfig/, "Sanity config should use defineConfig");
assert.match(config, /structureTool\(\)/, "Sanity config should include the structure tool");
assert.match(config, /visionTool\(\{defaultApiVersion: '2026-07-17'\}\)/, "Sanity config should include Vision with a fixed API version");
assert.match(config, /env\.SANITY_STUDIO_PROJECT_ID \|\| 'replace-with-project-id'/, "Sanity config should make the project id explicit");
assert.match(config, /schema:\s*\{\s*types:\s*schemaTypes/s, "Sanity config should register schema types");

assert.match(schemaIndex, /casePage/, "Sanity schema index should export the case page schema");
assert.match(caseSchema, /name:\s*'casePage'/, "Case schema should be named casePage");
assert.match(caseSchema, /title:\s*'Case Page'/, "Case schema should be labeled Case Page");
assert.match(caseSchema, /name:\s*'mediaSections'/, "Case schema should include photo/text sections");
assert.match(caseSchema, /name:\s*'imagePath'/, "Case schema should support existing site image paths for comparison");
assert.match(caseSchema, /name:\s*'video'/, "Case schema should include video fields");
assert.match(caseSchema, /name:\s*'cta'/, "Case schema should include CTA fields");

assert.match(readme, /does not replace the live site or the existing Decap setup yet/i, "Sanity README should state that this is only a comparison setup");

assert.ok(existsSync(vercelConfigUrl), "Sanity Studio should include a Vercel SPA fallback");
const vercelConfig = JSON.parse(readFileSync(vercelConfigUrl, "utf8"));
assert.deepEqual(
  vercelConfig.rewrites,
  [{ source: "/(.*)", destination: "/index.html" }],
  "Sanity Studio should route direct editor URLs back to index.html",
);
