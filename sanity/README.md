# LONMA DYNAMIC Sanity Studio

The Studio manages the six published LONMA DYNAMIC Case documents. The public
website reads published documents only and retains its local static HTML as a
complete fallback whenever CMS data is unavailable or invalid.

- Public Studio: https://lonma-sanity-studio.vercel.app/
- Temporary website: https://jagger-sage.vercel.app/

## What It Edits

- Case number, route slug, display order, brand, and featured state
- Vehicle make, model, year, chassis, and specification
- English and Chinese title, subtitle, hero description, and opening narrative
- Cover image source and bilingual alt text
- Optional video poster, uploaded MP4, or external HTTPS MP4 URL
- Ordered photo-story sections with image, bilingual copy, and layout
- Localized SEO page title, description, and social image

## Edit And Import

From the repository root, work in the Studio directory. Its committed
`package-lock.json` provides the versioned dependency tree used by this
workflow.

```bash
cd sanity
npm install
npm run dev
npx sanity login
npx sanity dataset import seed/case-pages.ndjson production --replace
```

The local Studio runs at:

```text
http://127.0.0.1:3333/
```

The seed contains six published `casePage` documents with deterministic IDs.
Reimporting with `--replace` updates the same deterministic IDs rather than
creating another set of cases. Do not run the import against production until
the records have been reviewed.

## Security

Never commit secrets, tokens, or `.env.local` files. The website uses only the
public published-content API and does not contain Sanity write credentials.
