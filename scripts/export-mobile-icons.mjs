import { mkdir, writeFile } from "node:fs/promises";

const lucideRoot = "/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/icons";
const icons = ["wrench", "folder", "hexagon", "shopping-cart", "user-round"];

const serializeAttributes = (attributes) => Object.entries(attributes)
  .map(([name, value]) => `${name}="${String(value)}"`)
  .join(" ");

await mkdir(new URL("../assets/icons/mobile/", import.meta.url), { recursive: true });

for (const name of icons) {
  const { default: nodes } = await import(`${lucideRoot}/${name}.js`);
  const children = nodes
    .map(([tag, attributes]) => `  <${tag} ${serializeAttributes(attributes)} />`)
    .join("\n");
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
    children,
    "</svg>",
    "",
  ].join("\n");

  await writeFile(new URL(`../assets/icons/mobile/${name}.svg`, import.meta.url), svg);
}
