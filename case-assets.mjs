export const imagePresets = Object.freeze({
  cover: {
    width: 2400,
    height: 1600,
    aspectRatio: "3:2",
    fit: "cover",
  },
  videoPoster: {
    width: 2560,
    height: 1440,
    aspectRatio: "16:9",
    fit: "cover",
  },
  detailLandscape: {
    width: 2400,
    height: null,
    aspectRatio: "source",
    fit: "inside",
  },
  detailPortrait: {
    width: 1600,
    height: 2400,
    aspectRatio: "2:3",
    fit: "cover",
  },
});

const records = [
  ["01", "STREET WIDEBODY", "首页背景.jpg"],
  ["02", "ROAD & TRACK SETUP", "DSC00889.jpg"],
  ["03", "LOW STANCE", "DSC00702.jpg"],
  ["04", "TURBO TUNING", "DSC00969.jpg"],
  ["05", "AUTOMOTIVE MEDIA FEATURE", "DSC00552.jpg"],
  ["06", "BLUE PERFORMANCE BUILD", "WechatIMG2477.jpg"],
];

export const caseAssets = Object.freeze(
  records.map(([id, title, sourceName], index) => ({
    id,
    title,
    source: `assets/images/网页/案例${index + 1}/${sourceName}`,
    cover: `assets/images/网页/optimized/case-${id}.jpg`,
    library: `assets/images/cases/case-${id}`,
    required: Object.freeze({
      cover: `assets/images/cases/case-${id}/cover`,
      gallery: `assets/images/cases/case-${id}/gallery`,
      video: `assets/images/cases/case-${id}/video`,
      poster: `assets/images/cases/case-${id}/poster`,
    }),
  })),
);
