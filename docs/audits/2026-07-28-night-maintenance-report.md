# LONMA Night Maintenance Report

Date: 2026-07-28

Branch: `agent/night-maintenance-20260728`

Production changed: No

## Completed

- Created a stable Cases 01-06 asset manifest.
- Added standard `cover`, `gallery`, `poster`, and `video` folders for every
  case.
- Added a non-destructive JPEG/WebP preparation tool with dry-run as the
  default.
- Added canonical, Open Graph, and Twitter metadata to all 20 public pages.
- Added `sitemap.xml` and `robots.txt` for Vercel clean URLs.
- Added a LONMA favicon and removed the browser's missing-icon request.
- Added automated checks for asset mappings, metadata, sitemap coverage,
  internal links, and local assets.
- Preserved all approved layouts, copy, images, bilingual behavior, and
  contact behavior.

## Case Media Inventory

| Case | Current cover | Original source | Gallery | Poster | Video | Next media action |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | 1920 x 1282, 548 KB | 3601 x 2405, 8.6 MB | Missing | Missing | Missing | Select detail gallery and optional 16:9 film poster |
| 02 | 1200 x 1920, 192 KB | 2193 x 3508, 2.6 MB | Missing; current story uses labeled catalog references | Cover reused as temporary poster | Missing | Approve a 3:2 cover crop, project gallery, and final video |
| 03 | 1080 x 1920, 236 KB | 4804 x 8541, 22 MB | Missing | Missing | Missing | Approve a 3:2 cover crop and select detail gallery |
| 04 | 1536 x 1920, 328 KB | 2832 x 3540, 3.8 MB | Missing | Missing | Missing | Approve a 3:2 cover crop and select detail gallery |
| 05 | 1080 x 1920, 224 KB | 4804 x 8541, 15 MB | Missing | Missing | Missing | Approve a 3:2 cover crop and select detail gallery |
| 06 | 1920 x 1241, 200 KB | 4112 x 2658, 1.2 MB | Missing | Missing | Missing | Select detail gallery and optional 16:9 film poster |

No source image was replaced, cropped, renamed, or deleted during this work.

## Recommended Media Delivery

- Archive cover: 2400 x 1600, 3:2, JPEG and WebP
- Video poster: 2560 x 1440, 16:9, JPEG and WebP
- Landscape detail image: 2400 px long edge
- Portrait detail image: 1600 x 2400, 2:3
- Web image target: about 300-900 KB where the source permits
- Video: H.264 MP4, 1080p, web-optimized, with a separate poster

## Verification

- Automated tests: 171 passed, 0 failed
- Public routes checked: 20
- Responsive browser scenarios: 60
- Viewports: 1728 x 1050, 1024 x 768, 390 x 844
- Horizontal overflow: none detected
- Broken loaded images: none detected
- Missing canonical metadata: none detected
- Browser warnings and errors: none detected
- Mobile navigation touch target height: 64 px
- Temporary conversion proof: 2400 x 1600 JPEG at 828 KB and WebP at 768 KB

## SEO Notes

Canonical URLs currently use:

`https://jagger-sage.vercel.app`

This is deliberate while the preferred custom domain remains unavailable. When
the final domain is connected, update `siteOrigin` in `seo-data.mjs` and
regenerate the pages, sitemap, and robots file.

Structured organization data is deferred until the final domain, public address,
and business contact details are confirmed.

## Deferred

- Approving photo crops and selecting final galleries
- Uploading case video files
- Replacing Case 02 catalog references with authentic project photographs
- Connecting the final domain
- Sending real contact-form email
- Configuring payments or production shop accounts
- Merging or deploying this branch
