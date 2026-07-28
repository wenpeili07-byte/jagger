# LONMA Night Maintenance Design

## Goal

Prepare the current public site for easier case-image maintenance, stronger
search and social sharing, and repeatable release checks without changing the
approved visual design or publishing to production.

## Safety Boundaries

- Work only on `agent/night-maintenance-20260728`.
- Do not merge or deploy this branch.
- Do not replace, delete, crop, or relink approved case photography.
- Do not send contact email, bind a domain, configure payments, or change
  external accounts.
- Do not touch the existing untracked `audit/` directory in other worktrees.
- Keep English as the initial language and preserve the current bilingual UI.

## Case Asset System

The existing Chinese source folders remain the source of truth. A new manifest
maps Cases 01-06 to those originals and to their current public covers. The
manifest records:

- stable case ID and public title
- original source image
- current public cover
- required future folders for cover, gallery, video, and poster assets
- recommended target sizes and aspect ratios

The image utility is non-destructive. It writes generated variants to a
separate output directory, never over source files, and supports a dry-run
inventory mode. Web output targets are:

- cover: 2400 x 1600, 3:2
- video poster: 2560 x 1440, 16:9
- landscape detail: 2400 px long edge
- portrait detail: 1600 x 2400, 2:3
- JPEG and WebP at web-ready quality

## SEO Baseline

Until a custom domain is connected, canonical URLs use the current production
origin:

`https://jagger-sage.vercel.app`

Every public HTML page receives:

- one canonical link using the clean Vercel route
- Open Graph title, description, URL, type, and image
- Twitter card, title, description, and image

Global pages use the current homepage image. Case detail pages use their own
current cover. `robots.txt` allows public crawling and points to `sitemap.xml`.
The sitemap lists all public clean URLs. Structured business data is deferred
until the final domain, address, and contact details are confirmed.

## Verification

Automated checks cover:

- all 20 public routes
- unique canonical URLs and complete social metadata
- sitemap and robots consistency
- valid internal links and local asset paths
- case manifest completeness and source-file existence
- mobile overflow guards and existing responsive breakpoints

Browser checks cover desktop, tablet, and phone widths, plus console errors.
The final result is documented in a morning report and published only as a
Draft PR for review.
