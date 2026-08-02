# Task 6 Report: Deterministic Sanity Case Seed

## Scope

Implemented only the deterministic six-document `casePage` seed, its checked-in
NDJSON output and coverage, and the Sanity/root editor workflow documentation.
No production Sanity import was run.

## RED Evidence

1. Added `sanity-seed.test.mjs` and replaced the comparison-only Studio README
   assertion before adding the generator or updated documentation.
2. Ran the seed and Studio tests with the repository Node runtime because `node`
   is not on the shell `PATH`:

   ```sh
   env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test sanity-seed.test.mjs sanity.test.mjs
   ```

   Result: failed as expected with `ERR_MODULE_NOT_FOUND` for
   `scripts/build-sanity-seed.mjs` and a failed real-workflow README assertion.
3. During final review, the new import-safety test failed with
   `ERR_INVALID_ARG_TYPE` because `process.argv[1]` is absent under `node -e`.

## GREEN Evidence

1. `scripts/build-sanity-seed.mjs` now maps the unmodified `caseDetails` copy
   into six published `casePage` documents with stable IDs, case-route slugs,
   orders, brands, required vehicle placeholders, UTF-8-compatible cover paths,
   and English SEO derived from existing page metadata.
2. Case 02 alone contains the verified three-section story, with deterministic
   keys, approved layouts, and current bilingual page copy. Other cases have no
   media sections.
3. Running the command generates six newline-terminated NDJSON records and
   creates `sanity/seed/` when needed. Importing the module does not write files
   or require a script path.
4. Documentation now gives the versioned `sanity/package-lock.json` workflow,
   working-directory context, Studio and temporary-site URLs, published-only
   behavior, static fallback, deterministic reimport behavior, and the
   no-secrets rule.

## Verification

```sh
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node scripts/build-sanity-seed.mjs
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test sanity.test.mjs sanity-seed.test.mjs contact-readme.test.mjs
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test
```

Results: requested group passed 7/7 tests; full suite passed 240/240 tests.

## Review Fix Round

### RED Evidence

Added semantic assertions for every named Sanity object in the seed, Case 02
media item keys/types, derived cover and social-image alts, normalizer output,
and unsupported Studio capability claims. Before implementation, the focused
test command failed because `slug._type` and `mediaSection._type` were missing,
and `sanity.test.mjs` still found `Build scope` and `CTA copy and link` in the
Studio README.

### GREEN Evidence

The generator now emits `_type: 'slug'`, `localizedString`, `localizedText`,
`caseImage`, and `mediaSection` exactly where the current schema defines named
object types. Inline `vehicle` and `seo` containers remain inline objects.
Every cover and social image now has the current generated-page bilingual alt:
`LONMA DYNAMIC` followed by the existing localized case title. Case 02 retains
all three existing story sections with deterministic `_key` and `_type` values.
The Studio capability list now reflects only fields in `casePage`.

No production Sanity import was run in this review-fix round.

### Review Fix Verification

```sh
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node scripts/build-sanity-seed.mjs
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test sanity.test.mjs sanity-seed.test.mjs sanity-schema.test.mjs sanity-case-data.test.mjs contact-readme.test.mjs
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test
```

Results: requested documentation, seed, schema, and normalizer tests passed
27/27; the full Node suite passed 240/240.
