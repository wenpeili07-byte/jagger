import { access, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { caseAssets, imagePresets } from "../case-assets.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

const usage = `Prepare LONMA case images without changing source files.

Dry run:
  node scripts/prepare-case-images.mjs --case 01 --preset cover

Create the standard folders:
  node scripts/prepare-case-images.mjs --scaffold

Generate JPEG and WebP derivatives:
  node scripts/prepare-case-images.mjs --case 01 --preset cover --write

Options:
  --case 01|all
  --preset cover|videoPoster|detailLandscape|detailPortrait
  --formats jpeg,webp
  --input path/to/image.jpg
  --output-dir path/to/directory
  --scaffold
  --write
  --help`;

export const parseArguments = (argv) => {
  const options = {
    caseId: "all",
    preset: "cover",
    formats: ["jpeg", "webp"],
    input: "",
    outputDir: "",
    scaffold: false,
    write: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--case") options.caseId = argv[++index] ?? "";
    else if (argument === "--preset") options.preset = argv[++index] ?? "";
    else if (argument === "--formats") options.formats = (argv[++index] ?? "").split(",").filter(Boolean);
    else if (argument === "--input") options.input = argv[++index] ?? "";
    else if (argument === "--output-dir") options.outputDir = argv[++index] ?? "";
    else if (argument === "--scaffold") options.scaffold = true;
    else if (argument === "--write") options.write = true;
    else if (argument === "--help" || argument === "-h") options.help = true;
    else throw new Error(`Unknown option: ${argument}`);
  }

  if (options.caseId !== "all" && !caseAssets.some(({ id }) => id === options.caseId)) {
    throw new Error(`Unknown case: ${options.caseId}`);
  }
  if (!imagePresets[options.preset]) throw new Error(`Unknown preset: ${options.preset}`);
  if (!options.formats.length || options.formats.some((format) => !["jpeg", "webp"].includes(format))) {
    throw new Error("Formats must be jpeg, webp, or both.");
  }
  if (options.input && options.caseId === "all") {
    throw new Error("--input requires one --case.");
  }

  return options;
};

const outputName = (presetName, preset, format) => {
  const dimensions = preset.height ? `${preset.width}x${preset.height}` : `${preset.width}w`;
  const extension = format === "jpeg" ? ".jpg" : ".webp";
  return `${presetName}-${dimensions}${extension}`;
};

export const buildPlan = (options) => {
  const records = options.caseId === "all"
    ? caseAssets
    : caseAssets.filter(({ id }) => id === options.caseId);
  const preset = imagePresets[options.preset];

  return records.flatMap((record) => {
    const source = resolve(root, options.input || record.source);
    const outputDirectory = resolve(root, options.outputDir || `${record.library}/derived`);
    return options.formats.map((format) => ({
      caseId: record.id,
      source,
      destination: resolve(outputDirectory, outputName(options.preset, preset, format)),
      format,
      preset,
    }));
  });
};

const loadSharp = async () => {
  try {
    return require("sharp");
  } catch {
    throw new Error(
      "Image writing needs the optional sharp package. Run `npm install --no-save sharp`, then repeat the command. Dry-run and scaffold modes do not need it.",
    );
  }
};

const scaffold = async () => {
  for (const record of caseAssets) {
    await Promise.all(Object.values(record.required).map((path) => mkdir(resolve(root, path), { recursive: true })));
  }
};

const writePlan = async (plan) => {
  const sharp = await loadSharp();

  for (const item of plan) {
    await access(item.source);
    await mkdir(dirname(item.destination), { recursive: true });

    try {
      await access(item.destination);
      process.stdout.write(`SKIP existing ${item.destination}\n`);
      continue;
    } catch {
      // A missing destination is the only state that permits a write.
    }

    const resize = {
      width: item.preset.width,
      fit: item.preset.fit,
      withoutEnlargement: true,
    };
    if (item.preset.height) resize.height = item.preset.height;
    if (item.preset.fit === "cover") resize.position = "attention";

    const pipeline = sharp(item.source).rotate().resize(resize);
    if (item.format === "webp") {
      await pipeline.webp({ quality: 78, smartSubsample: true }).toFile(item.destination);
    } else {
      await pipeline.jpeg({ quality: 84, mozjpeg: true }).toFile(item.destination);
    }
    process.stdout.write(`WROTE ${item.destination}\n`);
  }
};

export const run = async (argv = process.argv.slice(2)) => {
  const options = parseArguments(argv);
  if (options.help) {
    process.stdout.write(`${usage}\n`);
    return;
  }
  if (options.scaffold) await scaffold();

  const plan = buildPlan(options);
  if (!options.write) {
    process.stdout.write("DRY RUN: no image files will be written.\n");
    for (const item of plan) {
      process.stdout.write(
        `CASE ${item.caseId} ${basename(item.source)} -> ${item.destination.replace(`${root}/`, "")}\n`,
      );
    }
    return;
  }

  await writePlan(plan);
};

const isDirectRun = process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isDirectRun) {
  run().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
