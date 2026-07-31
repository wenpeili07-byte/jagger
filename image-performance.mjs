const imageRecord = ({ id, source, sourceWidth, sourceHeight, widths }) => ({
  id,
  source,
  fallback: source,
  sourceWidth,
  sourceHeight,
  widths,
  quality: 80,
  outputDirectory: `assets/images/generated/${id}`,
});

export const responsiveImages = [
  imageRecord({
    id: "hero",
    source: "assets/images/网页/首页背景.jpg",
    sourceWidth: 3601,
    sourceHeight: 2405,
    widths: [960, 1440, 2400],
  }),
  imageRecord({
    id: "case-01",
    source: "assets/images/网页/optimized/case-01.jpg",
    sourceWidth: 1920,
    sourceHeight: 1282,
    widths: [640, 960, 1600],
  }),
  imageRecord({
    id: "case-02",
    source: "assets/images/网页/optimized/case-02.jpg",
    sourceWidth: 1200,
    sourceHeight: 1920,
    widths: [640, 960, 1600],
  }),
  imageRecord({
    id: "case-03",
    source: "assets/images/网页/optimized/case-03.jpg",
    sourceWidth: 1080,
    sourceHeight: 1920,
    widths: [640, 960, 1600],
  }),
  imageRecord({
    id: "case-04",
    source: "assets/images/网页/optimized/case-04.jpg",
    sourceWidth: 1536,
    sourceHeight: 1920,
    widths: [640, 960, 1600],
  }),
  imageRecord({
    id: "case-05",
    source: "assets/images/网页/optimized/case-05.jpg",
    sourceWidth: 1080,
    sourceHeight: 1920,
    widths: [640, 960, 1600],
  }),
  imageRecord({
    id: "case-06",
    source: "assets/images/网页/optimized/case-06.jpg",
    sourceWidth: 1920,
    sourceHeight: 1241,
    widths: [640, 960, 1600],
  }),
];

export const buildDerivativePlan = (record) =>
  [...new Set(record.widths)]
    .filter((width) => width <= record.sourceWidth)
    .sort((a, b) => a - b)
    .map((width) => ({
      width,
      destination: `${record.outputDirectory}/${record.id}-${width}w.webp`,
    }));

export const srcsetFor = (id, prefix = "") => {
  const record = responsiveImages.find((candidate) => candidate.id === id);
  if (!record) throw new Error(`Unknown responsive image: ${id}`);

  return buildDerivativePlan(record)
    .map(({ width, destination }) => `${prefix}${destination} ${width}w`)
    .join(", ");
};
