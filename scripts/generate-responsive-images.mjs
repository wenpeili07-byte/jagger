import { mkdir, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildDerivativePlan, responsiveImages } from "../image-performance.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const generatedRoot = resolve(root, "assets/images/generated");
const require = createRequire(import.meta.url);

const insideGeneratedRoot = (path) =>
  path === generatedRoot || path.startsWith(`${generatedRoot}${sep}`);

const loadSharp = () => {
  try {
    return require("sharp");
  } catch {
    throw new Error(
      "Image generation requires Sharp. Run with the bundled NODE_PATH or install Sharp locally.",
    );
  }
};

const formatBytes = (bytes) => `${Math.round(bytes / 1024)} KB`;

export const generateResponsiveImages = async ({ sharp = loadSharp(), write = false } = {}) => {
  const results = [];

  for (const record of responsiveImages) {
    const source = resolve(root, record.source);
    const sourceStats = await stat(source);

    for (const derivative of buildDerivativePlan(record)) {
      const destination = resolve(root, derivative.destination);
      if (!insideGeneratedRoot(destination)) {
        throw new Error(`Refusing to write outside assets/images/generated: ${destination}`);
      }

      if (!write) {
        results.push({
          source: record.source,
          destination: derivative.destination,
          width: derivative.width,
          sourceBytes: sourceStats.size,
          outputBytes: 0,
        });
        continue;
      }

      await mkdir(dirname(destination), { recursive: true });
      await sharp(source)
        .rotate()
        .resize({ width: derivative.width, withoutEnlargement: true })
        .webp({ quality: record.quality, smartSubsample: true })
        .toFile(destination);

      const outputStats = await stat(destination);
      results.push({
        source: record.source,
        destination: derivative.destination,
        width: derivative.width,
        sourceBytes: sourceStats.size,
        outputBytes: outputStats.size,
      });
    }
  }

  return results;
};

const run = async () => {
  const write = process.argv.slice(2).includes("--write");
  const results = await generateResponsiveImages({ write });

  if (!write) process.stdout.write("DRY RUN: no files written. Add --write to generate derivatives.\n");
  for (const result of results) {
    const size = write
      ? `${formatBytes(result.sourceBytes)} -> ${formatBytes(result.outputBytes)}`
      : formatBytes(result.sourceBytes);
    process.stdout.write(`${result.width}w ${result.destination} (${size})\n`);
  }
};

const isDirectRun = process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isDirectRun) {
  run().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
