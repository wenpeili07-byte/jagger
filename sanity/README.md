# LONMA DYNAMIC Sanity Studio

The Studio manages the six published LONMA DYNAMIC Case documents. The public
website reads published documents only and retains its local static HTML as a
complete fallback whenever CMS data is unavailable or invalid.

- Public Studio: https://lonma-sanity-studio.vercel.app/
- Temporary website: https://jagger-sage.vercel.app/

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
