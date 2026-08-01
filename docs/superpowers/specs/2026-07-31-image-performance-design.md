# LONMA Image Performance Design

Date: 2026-07-31

## Goal

Reduce image transfer size and decoding work across the public LONMA website
without changing its approved photography, cropping, layout, animation, or
bilingual content.

## Scope

- Optimize the current desktop hero photograph and the six active case covers.
- Keep every original source file unchanged as the visual and archival master.
- Generate WebP derivatives for modern browsers.
- Provide width-based variants where the same image appears across mobile,
  tablet, and desktop layouts.
- Load first-screen imagery eagerly and below-fold imagery lazily.
- Add intrinsic dimensions or aspect-ratio information where it prevents layout
  movement without changing the composition.
- Preserve current Open Graph images as JPEG URLs for broad crawler support.

## Current Baseline

- The desktop hero source is 3601 x 2405 and approximately 9 MB.
- Case 01 is 1920 x 1282 and approximately 559 KB.
- Cases 02-06 are already between approximately 193 KB and 335 KB, but are
  reused in several views and still benefit from responsive derivatives.
- The approved mobile homepage already uses compact WebP assets and must not be
  visually changed.

## Derivative Strategy

Create generated files under `assets/images/generated/` so source images remain
easy to identify and replace.

- Hero: 960, 1440, and 2400 px wide WebP derivatives.
- Case covers: 640, 960, and 1600 px wide WebP derivatives where the source
  permits; omit duplicate widths when the source is smaller.
- WebP quality: 78-82, with metadata removed and orientation normalized.
- Do not upscale an image beyond its source dimensions.

The generator must be deterministic and non-destructive. Existing generated
files may be replaced only when the corresponding source or generation settings
change.

## Markup And CSS

- Use `srcset` and `sizes` on content images so the browser selects an
  appropriate derivative.
- Keep a JPEG `src` fallback for each image.
- Use CSS `image-set()` for page backgrounds and interactive case scenes, with
  the original JPEG as the final fallback.
- Use `fetchpriority="high"` only for the image that defines the current first
  screen.
- Use `loading="lazy"` and `decoding="async"` for images that begin below the
  fold.
- Do not lazy-load images used immediately in the first viewport or hover
  transitions that need instant response.

## Visual Guarantees

- No crop, position, filter, overlay, opacity, transition, or animation changes.
- No typography, spacing, navigation, card, or breakpoint changes.
- Desktop and mobile compositions must match the current approved screenshots.
- Hover background changes must remain instant after the image is available and
  must not flash an empty background.

## Verification

- Run the full automated test suite.
- Confirm all local image references return successfully.
- Compare desktop 1440 x 900 and mobile 390 x 844 screenshots against the
  current approved layout.
- Confirm no horizontal overflow and no new browser console errors.
- Record before/after file sizes for the hero and case derivatives.
- Confirm source JPEG files remain byte-for-byte untouched.

## Out Of Scope

- Replacing sample photographs with new project media.
- Changing the CMS, shop catalog, payment flow, or case data model.
- Changing Open Graph artwork or the final custom domain.
- Deleting large archival source photographs.
