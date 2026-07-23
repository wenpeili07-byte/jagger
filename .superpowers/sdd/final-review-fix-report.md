# Contact Form Final Review Fix Report

Date: 2026-07-23

## Scope

Final review fixes for the Contact form only. `audit/`, design specifications,
and implementation plans were not modified.

## TDD evidence

New regression tests were added first and run before implementation. The first
focused test run failed on the expected gaps: Content-Length was not enforced,
non-object JSON threw an exception, browser constraints were missing, HTTP 400
used the generic connection error, and Resend onboarding restrictions were not
documented.

## Fixes

- Contact fields now match server validation limits in the browser.
- HTTP 400 displays a bilingual validation message without resetting input.
- The API enforces a 16 KiB limit from `Content-Length` when present, with its
  existing serialized-body fallback when absent.
- `null`, arrays, and primitive JSON submissions return `400 invalid_submission`.
- Resend onboarding sender guidance now documents the Gmail association,
  verified-domain alternative, and `403` to `502` mapping.

## Verification

Commands run from this worktree:

```text
node --test contact-api.test.mjs contact-form.test.mjs content-pages.test.mjs contact-readme.test.mjs
Result: 30 passed, 0 failed

node --test
Result: 112 passed, 0 failed

node --check api/contact.js
node --check contact-form.js
Result: passed

git diff --check
Result: passed
```
