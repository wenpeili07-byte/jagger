# LONMA DYNAMIC Global Responsive Proportions

## Goal

Unify every public page around one desktop canvas and one responsive system. The
site must preserve its current automotive editorial design while removing the
mixed 1728px and 1900px layout rules.

## Scope

This pass covers:

- Homepage
- Services index
- Cases index
- Case detail
- About
- Contact
- Six service-detail shells

This pass changes layout proportions only. It does not change copy, imagery,
colors, typography, animations, links, CMS behavior, or page content.

## Canvas System

- Desktop design reference: 1900 x 1050.
- Public page shells use `max-width: 1900px`, `width: 100%`, and horizontal
  auto margins.
- Viewports wider than 1900px show equal outer margins. Page content does not
  continue stretching.
- The desktop header remains 77px tall.
- Full first-screen experiences may use up to 973px below the header, matching
  the 1050px reference height.
- Tall browser windows reveal more content below the first screen instead of
  stretching the first screen.
- The site must not use `transform: scale()` for global page sizing.

## Responsive Ranges

### Wide desktop: 1900px and above

- Content remains 1900px wide and centered.
- Homepage and cases first screens stop growing at 973px below the header.
- Internal grids use their established desktop ratios.

### Standard desktop: 1181px to 1899px

- The shell fills the available viewport width.
- Spacing and text sizes continue using the existing `clamp()` rules.
- Two-column hero, case, and service layouts remain active.

### Compact desktop: 900px to 1180px

- Two-column layouts remain, but minimum column widths are reduced.
- Gaps and horizontal padding become tighter.
- Media columns may shrink without forcing document overflow.

### Split screen: 768px to 899px

- The page must remain exactly within the viewport width.
- The services showcase changes from its wide two-column composition to a
  proportion suitable for a 790px MacBook split-screen viewport.
- Text, arrows, and images must not create a fixed 800px minimum width.
- Page headers use the compact navigation treatment already present in the
  project.

### Mobile: below 768px

- Major content layouts become one column.
- The header is compressed so it does not consume 176-193px unless navigation
  wrapping genuinely requires that height.
- Media uses stable aspect ratios and `object-fit: cover`.
- Text and controls must fit within 390px without horizontal scrolling.

## Page Rules

### Homepage

- Preserve the existing left editorial introduction and right six-case module.
- Keep the first screen capped to the desktop reference height.
- Preserve the service section below the first screen.

### Services

- Preserve the current editorial hero, six-service index, preview media, and
  method section.
- Remove the 790px split-screen overflow.
- Keep desktop image-to-copy proportions unchanged at 1900px.

### Cases

- Preserve the current vertical image-rail behavior and archive layout.
- Use the same 1900px shell as the homepage.
- Mobile may use the existing simplified vertical list.

### Case Detail

- Use the deployed editorial page proportions as the visual baseline.
- Long-form sections remain content-driven and are not forced into 1050px.
- Media and copy pairs use the shared canvas gutters.

### About And Contact

- Preserve their current hero and content section proportions.
- Align shell width, header behavior, section gutters, and footer width with the
  rest of the site.

### Service Details

- Apply the shared shell and header proportions even while their page bodies are
  still incomplete.

## CSS Architecture

- `layout-canvas.css` becomes the single source of truth for:
  - 1900px shell width
  - 77px desktop header height
  - 973px capped first-screen height
  - shared horizontal gutters
  - common responsive breakpoints
- `styles.css`, `content-pages.css`, `case-rail.css`, and `case-detail.css`
  continue to own page-specific internal layouts.
- Existing page-specific rules that contradict the shared canvas are removed or
  changed to reference shared custom properties.
- No unrelated refactoring is included.

## Verification

Check every page class at:

- 2560 x 1440
- 1900 x 1050
- 790 x 1204
- 390 x 844

Acceptance criteria:

- No horizontal overflow.
- The visible shell never exceeds 1900px.
- Wide screens show equal outer margins.
- First-screen layouts do not stretch beyond their desktop design height.
- Mobile headers and content do not overlap.
- Images remain correctly cropped and are not distorted.
- Existing animations and interactions still work.
- Existing automated tests pass, with focused layout tests added for the shared
  canvas and split-screen overflow.

## Non-Goals

- Completing Case 02-06
- Completing the six service-detail pages
- Replacing Case 01 media
- Deciding whether the local video variant goes online
- Reworking translation, SEO, form submission, or CMS behavior
- Publishing or deploying the changes
