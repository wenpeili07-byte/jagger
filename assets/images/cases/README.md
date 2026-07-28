# Case Media Library

The original photography remains in `assets/images/网页/案例1` through
`案例6`. Do not rename, replace, or delete those source files.

Each case receives four future-facing folders:

- `cover/`: approved archive and social-sharing covers
- `gallery/`: detail-page photographs in display order
- `poster/`: 16:9 video posters
- `video/`: approved web video files

Use lowercase ASCII filenames:

- `case-01-cover-2400x1600.webp`
- `case-01-gallery-01-2400w.webp`
- `case-01-poster-2560x1440.webp`
- `case-01-film-1080p.mp4`

The current public covers remain in `assets/images/网页/optimized` until a new
set is reviewed. `case-assets.mjs` records the source-to-case mapping.

Preview an image plan:

```sh
node scripts/prepare-case-images.mjs --case 01 --preset cover
```

The tool is a dry run unless `--write` is supplied. Writing JPEG and WebP files
requires the optional `sharp` package:

```sh
npm install --no-save sharp
node scripts/prepare-case-images.mjs --case 01 --preset cover --write
```
