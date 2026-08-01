# Task 1 Report: Production Case Schema And Studio Structure

## Implementation

Implemented the production Sanity case model and case-first Studio navigation.

- Added reusable bilingual `localizedString` and `localizedText` object types.
- Added `caseImage` for uploaded images or existing `/assets/images/` paths with bilingual alt text.
- Added `mediaSection` with `full`, `textLeft`, and `textRight` layouts.
- Replaced the bootstrap `casePage` schema with the approved Case fields: identity, order, brand, featured state, vehicle metadata, localized editorial content, cover/video/media sections, and localized SEO.
- Registered all five schema types and configured the Studio to use project `v54qppoy`, dataset `production`, and API date `2026-08-01`.
- Added `caseStructure` so Case Pages are the Studio root and ordered by ascending `order`.
- Updated focused schema registration assertions for the production contract.

## Files Changed

- `sanity/schemaTypes/localizedString.js` (new)
- `sanity/schemaTypes/localizedText.js` (new)
- `sanity/schemaTypes/caseImage.js` (new)
- `sanity/schemaTypes/mediaSection.js` (new)
- `sanity/structure.js` (new)
- `sanity/schemaTypes/casePage.js`
- `sanity/schemaTypes/index.js`
- `sanity/sanity.config.js`
- `sanity.test.mjs`

## RED

Command:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test sanity.test.mjs
```

Output summary:

```text
Error: ENOENT: no such file or directory, open '.../sanity/schemaTypes/localizedString.js'
tests 1
pass 0
fail 1
```

Expected reason: the newly required reusable schema files and Studio structure did not exist yet.

The literal `node --test sanity.test.mjs` command initially could not start because `node` was absent from the shell PATH; the bundled project runtime above ran the same command successfully.

## GREEN

Command:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test sanity.test.mjs
```

Output:

```text
pass 1
fail 0
```

## Studio Build

Command (180-second explicit timeout):

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" perl -e 'alarm 180; exec @ARGV' npm run build
```

Result: exit code 0. The command produced no output.

## Self-Review

- Verified the production project ID, dataset, and API date are exact.
- Verified all required schema units are registered and the Studio uses `structureTool({structure: caseStructure})`.
- Verified order validation is required/integer/1 through 36, the only brand values are `bmw`, `audi`, and `mercedes-benz`, external video URLs require HTTPS, and uploaded video accepts `video/mp4`.
- Kept changes scoped to Task 1 schema, Studio configuration, focused test, and this report. No public pages, homepage, or `audit/` files were touched.

## Concerns

- `sanity/package-lock.json` was not created: dependency installation could not be completed because the network-permission request was interrupted. The timeout-wrapped build nevertheless exited 0 with no output, so its process status is recorded but its silent output is a residual verification limitation.

## Review Fix Round

### Findings Addressed

- Added asynchronous custom validators for `slug` and `order`. Each counts matching `casePage` documents while excluding both the current published ID and its `drafts.` counterpart, returning a specific validation error for duplicates.
- Added a cover validator requiring exactly one usable source: a Sanity uploaded image reference or a nonblank existing image path. Empty cover objects and simultaneous upload/path sources are rejected.
- Added `sanity-schema.test.mjs`, which evaluates the actual schema definition objects and validation callbacks instead of only matching source text. It verifies duplicate rejection, draft/published self-exclusion, cover-source validation, and the complete schema registry.

### RED

Command:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test sanity.test.mjs sanity-schema.test.mjs
```

Output summary:

```text
tests 5
pass 2
fail 3
slug should define custom validation
cover should define custom validation
```

Expected reason: the original schema did not contain custom slug/order uniqueness validation or an exactly-one cover-source validation.

### GREEN

Command:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node --test sanity.test.mjs sanity-schema.test.mjs
```

Output:

```text
tests 5
pass 5
fail 0
```

### Dependency And Build Result

Attempted installation with the bundled package manager invoking npm:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" /Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm dlx npm@11.10.0 install
```

Result: failed after retries with:

```text
ERR_PNPM_META_FETCH_FAIL GET https://registry.npmjs.org/npm: fetch failed
```

The actual Studio build command was then run:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node ./node_modules/sanity/bin/sanity.js build
```

Result: failed because `sanity/node_modules/sanity/bin/sanity.js` is absent. The build could not run without dependency installation.

### Fix-Round Self-Review

- The uniqueness validators normalize `drafts.<id>` to `<id>` and explicitly exclude both forms in the GROQ predicate.
- The cover validator observes the stored shape of the nested Sanity image field (`cover.asset.asset._ref`) and permits a trimmed nonblank path as the alternate source.
- Tests execute the schema callbacks through a lightweight Sanity-definition shim and assert validator results, query exclusion syntax, and registered types.
- Scope remains limited to the schema, semantic tests, and Task 1 report; no public pages or `audit/` files changed.

### Remaining Concern

`sanity/package-lock.json` remains absent and Studio build validation remains blocked by DNS/network failure to `registry.npmjs.org`. This review finding cannot be resolved until the registry is reachable or an npm cache/artifact is provided.

### Dependency Retry: 2026-08-01

Two fresh installation attempts were started after registry reachability was reported:

```bash
env PATH="/Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" /Users/wenpeili/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm dlx npm@11.10.0 install
```

Both attempts failed in the Node package-manager process before downloading npm:

```text
[WARN] GET https://registry.npmjs.org/npm error (ENOTFOUND)
[ERR_PNPM_META_FETCH_FAIL] GET https://registry.npmjs.org/npm: fetch failed
```

Each retry was stopped after this repeated DNS failure. No `package-lock.json`, dependency tree, or successful Studio build was produced, so there is no dependency/build fix commit to create.

The focused semantic suite was rerun after the failed retries and passed:

```text
tests 5
pass 5
fail 0
```

### Final Dependency And Build Verification

The controller generated `sanity/package-lock.json` using isolated writable npm caches and installed 1126 packages.

Verified semantic tests:

```text
tests 5
pass 5
fail 0
```

Verified real non-interactive Sanity Studio build:

```bash
XDG_CONFIG_HOME=/tmp/lonma-sanity-config SANITY_CLI_UPDATE_CHECK=false ./node_modules/.bin/sanity build --output-path /tmp/lonma-sanity-studio-build --yes
```

Result: succeeded.
