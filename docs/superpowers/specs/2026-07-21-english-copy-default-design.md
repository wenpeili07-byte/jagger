# LONMA DYNAMIC English-First Copy Design

**Date:** 2026-07-21  
**Status:** Approved direction, pending implementation review  
**Scope:** All 17 public pages, shared language controllers, generated detail pages, metadata, and accessibility copy

## Goal

Make English the polished, authoritative first language of the LONMA DYNAMIC website while preserving the complete Chinese experience behind the existing language switch.

The finished site should:

- open in English whenever a visitor starts a new browser tab or session;
- retain a visitor's Chinese selection while they continue navigating in the same tab;
- return to English after the site is closed and opened again;
- use concise, professional American English appropriate for a premium automotive tuning workshop;
- preserve the current layout, images, animation, visual hierarchy, and Chinese copy.

## Voice Direction

The English voice combines three established industry patterns:

1. BMW M's precise language around driving dynamics, model-specific components, and road or track use.
2. Dinan's technical language around engine tuning, calibration, response, integration, and power delivery.
3. IND's restrained enthusiast language around fitment, OEM-level integration, curated parts, and complete builds.

BRABUS provides a reference for confident presentation, but LONMA copy will remain more restrained and technical. The site should sound experienced and deliberate, not exaggerated.

### Style Rules

- Use American English spelling and punctuation.
- Prefer short, direct sentences.
- Describe the customer benefit and the workshop process without unsupported performance claims.
- Use active language where the workshop is the actor.
- Use `build` or `project` in normal prose; reserve `CASE`, `CASES`, and `CASE FILES` for the established editorial interface.
- Use `tuning` for engine/software tuning or a recognized tuning program. Use `ECU calibration` for the LONMA service name.
- Use `fitment` for wheel, tire, and body-clearance relationships.
- Use `alignment`, `ride height`, `chassis setup`, and `road or track use` for chassis work.
- Use `power delivery`, `throttle response`, `data logging`, and `road testing` for calibration work.
- Use `automotive photography` for the service name and `automotive media` only when referring to photography and video together.
- Spell the manufacturer name `Mercedes-Benz`; do not use `BENZ` as a standalone brand label.

## Canonical Service Names

The following English names are the source of truth across the homepage, services page, service detail pages, contact form, metadata, and supporting scripts:

| Code | English service name | Supporting terminology |
| --- | --- | --- |
| BUILD | Custom Vehicle Builds | complete-car direction, exterior, wheels, suspension, brakes |
| PARTS | Performance Parts | curated selection, correct fitment, installation, integration |
| PHOTO | Automotive Photography | still photography, rolling shots, short films, social content |
| ECU | ECU Calibration | data logging, road testing, throttle response, power delivery |
| CHASSIS | Chassis Setup | ride height, wheel fitment, alignment, street or track use |
| EXHAUST | Intake & Exhaust | intake, downpipe, mid-pipe, axle-back, sound, response |

`CORE SERVICES` replaces `BUSINESS MODULES`. The services-page headline becomes `FROM VISION TO COMPLETE BUILD`.

## Case Language

The navigation label `CASES` and the hero title `CASE FILES` remain unchanged because they are part of the site's editorial identity.

In supporting prose:

- `case study` describes a documented finished vehicle;
- `build` describes the vehicle and modification process;
- `project` describes the customer engagement;
- avoid repeated phrases such as `modified-car case`, `case module`, and `case file` when a more natural term is available.

Existing case names may remain concise display labels, but their descriptions will be rewritten for natural American English and accurate automotive meaning.

## English-First Behavior

### Initial HTML

Every public HTML file will ship with:

- `<html lang="en">`;
- English visible text as the initial text content;
- the English option marked as current;
- the language toggle labelled for switching to Chinese;
- English metadata and page descriptions.

This prevents a flash of Chinese content before JavaScript runs and keeps the no-JavaScript version coherent.

### Session Behavior

Language preference will use `sessionStorage`, not `localStorage`.

- New tab or new browser session: English.
- Switch to Chinese: Chinese remains active while navigating in the same tab.
- Close and reopen the site: English.
- Storage unavailable or invalid value: English.

Both language controllers, `script.js` and `content-pages.js`, will follow the same fallback rules.

## Source Ownership

Copy will be updated at its owning source instead of patched only in generated HTML:

- `script.js`: homepage translation dictionary, cards, case summaries, and service summaries.
- `index.html`: English-first homepage markup and accessibility defaults.
- `pages/about.html`, `pages/services.html`, `pages/cases.html`, `pages/contact.html`: page-specific copy and initial English markup.
- `detail-pages-data.mjs`: canonical case and service detail copy.
- `scripts/render-detail-pages.mjs`: English-first detail-page shell and footer defaults.
- generated files under `pages/cases/` and `pages/services/`: regenerated from the canonical data.
- `content-pages.js`: shared session language behavior, form status text, and navigation labels.

## Accessibility And Metadata

The audit includes text that is not always visible:

- document titles and meta descriptions;
- navigation and section `aria-label` values;
- language-toggle accessible names;
- form labels, placeholders, options, and status text;
- meaningful image alternative text where the image conveys content;
- email subject and body labels generated by the contact form.

Decorative images will retain empty alternative text.

## Layout Constraints

This work changes copy and language state only.

- No layout, spacing, typography, image, color, or animation changes.
- English text must not overflow at wide desktop, standard desktop, split-screen laptop, or mobile widths.
- Existing case-mask and services-hover interactions remain unchanged.
- Existing bilingual footer and header structure remain unchanged.

## Verification

A new English-copy regression test will verify:

1. all 17 public pages declare English as the initial language;
2. English is the initial visible copy for bilingual nodes;
3. the English language option is initially active;
4. both controllers default invalid or missing preferences to English;
5. language persistence uses `sessionStorage` and does not use `localStorage`;
6. canonical service names are consistent across all sources;
7. known awkward or inaccurate phrases are absent;
8. generated detail pages match their canonical data source.

The existing full test suite must remain green. Browser verification will cover at least:

- 2200px wide desktop;
- 1440px desktop;
- approximately 1156px split-screen laptop width;
- 390px mobile width;
- English initial load, Chinese switching, same-tab navigation, and English reset in a fresh tab.

## Acceptance Criteria

- A first-time or reopened visitor sees English immediately on every public page.
- Chinese remains fully available and consistent within the active tab.
- All English copy is grammatically correct, natural, and technically appropriate.
- Service and case terminology is consistent across pages, forms, scripts, and metadata.
- No text is clipped or overlaps at the verified widths.
- All automated tests pass with no diff-formatting errors.

## Non-Goals

- Rewriting the approved Chinese copy.
- Adding services, cases, performance claims, pricing, warranties, or legal statements.
- Changing visual design, interaction design, or page structure.
- Adding automatic browser-language or geolocation detection.
