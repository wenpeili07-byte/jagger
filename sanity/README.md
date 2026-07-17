# LONMA DYNAMIC Sanity Studio

This is a separate Sanity Studio test setup for comparing CMS editing experience against Decap CMS.

It does not replace the live site or the existing Decap setup yet.

## What It Edits

- Case slug and case number
- English title and Chinese title
- Hero description
- Meta tags
- Video poster and MP4 path
- Overview copy
- Photo/text sections
- Build scope
- CTA copy and link

## Run Locally

Create or open a Sanity project first, then create `.env.local` in this folder:

```text
SANITY_STUDIO_PROJECT_ID="your-project-id"
SANITY_STUDIO_DATASET="production"
```

Install and run from this folder:

```bash
pnpm install
pnpm dev
```

Then open:

```text
http://127.0.0.1:3333/
```

## Notes

The main website is still static and still reads `content/cases/case-01.json`.
This Sanity Studio is only for comparing the editing experience first.
