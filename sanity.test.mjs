import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const packageJson = JSON.parse(readFileSync(new URL("./sanity/package.json", import.meta.url), "utf8"));
const config = readFileSync(new URL("./sanity/sanity.config.js", import.meta.url), "utf8");
const schemaIndex = readFileSync(new URL("./sanity/schemaTypes/index.js", import.meta.url), "utf8");
const caseSchema = readFileSync(new URL("./sanity/schemaTypes/casePage.js", import.meta.url), "utf8");
const localizedString = readFileSync(new URL("./sanity/schemaTypes/localizedString.js", import.meta.url), "utf8");
const localizedText = readFileSync(new URL("./sanity/schemaTypes/localizedText.js", import.meta.url), "utf8");
const caseImage = readFileSync(new URL("./sanity/schemaTypes/caseImage.js", import.meta.url), "utf8");
const mediaSection = readFileSync(new URL("./sanity/schemaTypes/mediaSection.js", import.meta.url), "utf8");
const structure = readFileSync(new URL("./sanity/structure.js", import.meta.url), "utf8");
const readme = readFileSync(new URL("./sanity/README.md", import.meta.url), "utf8");
const vercelConfigUrl = new URL("./sanity/vercel.json", import.meta.url);
const cliConfigUrl = new URL("./sanity/sanity.cli.ts", import.meta.url);
const sanityDirectory = fileURLToPath(new URL("./sanity/", import.meta.url));

assert.equal(packageJson.name, "lonma-dynamic-sanity-studio", "Sanity Studio should have a dedicated package");
assert.equal(packageJson.type, "module", "Sanity Studio should use ESM config files");
assert.match(packageJson.scripts.dev, /sanity dev --host 127\.0\.0\.1 --port 3333/, "Sanity Studio should run on a predictable local port");
assert.ok(packageJson.dependencies.sanity, "Sanity Studio should depend on Sanity");
assert.ok(packageJson.dependencies["@sanity/vision"], "Sanity Studio should include Vision for content inspection");

assert.match(config, /defineConfig/, "Sanity config should use defineConfig");
assert.match(config, /structureTool\(\{structure: caseStructure\}\)/, "Sanity config should use case-first Studio navigation");
assert.match(config, /apiVersion:\s*'2026-08-01'/, "Sanity config should use the approved API date");
assert.match(config, /projectId:\s*env\.SANITY_STUDIO_PROJECT_ID\s*\|\|\s*'v54qppoy'/, "Sanity config should use the production project id");
assert.match(config, /schema:\s*\{\s*types:\s*schemaTypes/s, "Sanity config should register schema types");

assert.ok(existsSync(cliConfigUrl), "Sanity CLI config should bind project and dataset commands");
const cliConfig = readFileSync(cliConfigUrl, "utf8");
const evaluatedCliConfig = JSON.parse(execFileSync(
  process.execPath,
  ["-e", "require('esbuild-register/dist/node').register({supported: {'dynamic-import': true}}); process.stdout.write(JSON.stringify(require('./sanity.cli.ts').default));"],
  { cwd: sanityDirectory, encoding: "utf8" },
));
assert.deepEqual(evaluatedCliConfig, {
  api: {
    projectId: "v54qppoy",
    dataset: "production",
  },
}, "Sanity CLI config should evaluate to the exact production project and dataset");
assert.match(cliConfig, /import\s+\{defineCliConfig\}\s+from\s+['"]sanity\/cli['"]/);
assert.match(cliConfig, /api:\s*\{\s*projectId:\s*['"]v54qppoy['"],?\s*dataset:\s*['"]production['"],?\s*\}/s);
assert.doesNotMatch(cliConfig, /token|secret/i, "Sanity CLI config must not contain credentials");

assert.match(schemaIndex, /localizedString/, "Sanity schema index should export localized strings");
assert.match(schemaIndex, /localizedText/, "Sanity schema index should export localized text");
assert.match(schemaIndex, /caseImage/, "Sanity schema index should export case images");
assert.match(schemaIndex, /mediaSection/, "Sanity schema index should export media sections");
assert.match(schemaIndex, /casePage/, "Sanity schema index should export the case page schema");
assert.match(localizedString, /name:\s*'localizedString'/);
assert.match(localizedString, /name:\s*'en'[\s\S]*required\(\)/);
assert.match(localizedString, /name:\s*'zh'/);
assert.match(localizedText, /name:\s*'localizedText'/);
assert.match(caseImage, /name:\s*'caseImage'/);
assert.match(caseImage, /name:\s*'imagePath'/);
assert.match(mediaSection, /value:\s*'full'/);
assert.match(mediaSection, /value:\s*'textLeft'/);
assert.match(mediaSection, /value:\s*'textRight'/);
assert.match(caseSchema, /name:\s*'casePage'/, "Case schema should be named casePage");
assert.match(caseSchema, /title:\s*'Case Page'/, "Case schema should be labeled Case Page");
assert.match(caseSchema, /name:\s*'order'/);
assert.match(caseSchema, /name:\s*'brand'/);
assert.match(caseSchema, /name:\s*'vehicle'/);
assert.match(caseSchema, /name:\s*'seo'/);
assert.match(readme, /npm ci[\s\S]*npm run dev[\s\S]*npx sanity login[\s\S]*npx sanity dataset import seed\/case-pages\.ndjson production --replace/i, "Sanity README should document the lockfile-based local editor and import workflow");
assert.match(readme, /https:\/\/lonma-sanity-studio\.vercel\.app\/?/, "Sanity README should link the public Studio");
assert.match(readme, /https:\/\/jagger-sage\.vercel\.app\/?/, "Sanity README should link the temporary website");
assert.match(readme, /published documents only/i, "Sanity README should describe public query behavior");
assert.match(readme, /static HTML[\s\S]*fallback/i, "Sanity README should describe the static fallback");
assert.match(readme, /same deterministic IDs/i, "Sanity README should describe repeatable imports");
assert.match(readme, /never.*commit.*secrets/i, "Sanity README should prohibit committed secrets");
assert.match(readme, /sanity\.cli\.ts[\s\S]*project[\s\S]*dataset/i, "Sanity README should document the checked-in CLI project and dataset config");
assert.doesNotMatch(readme, /Build scope|CTA copy and link/i, "Sanity README should list only fields the current case schema supports");

assert.ok(existsSync(vercelConfigUrl), "Sanity Studio should include a Vercel SPA fallback");
const vercelConfig = JSON.parse(readFileSync(vercelConfigUrl, "utf8"));
assert.deepEqual(
  vercelConfig.rewrites,
  [{ source: "/(.*)", destination: "/index.html" }],
  "Sanity Studio should route direct editor URLs back to index.html",
);
