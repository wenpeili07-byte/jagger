# Mobile Home Direction C Fidelity Design

## Goal

Match the approved Direction C mobile homepage at a `390 x 844` reference viewport while preserving the existing desktop homepage, bilingual behavior, routes, and fixed five-action navigation.

## Composition

- Home-only topbar: `44px`.
- Single-car cinematic hero: `290px`.
- Featured build dossier: `124px`, split into an `82px` media/copy row and a `42px` specification/action row.
- Services, Cases, and Shop image bands: `86px` each.
- Project CTA: `48px`.
- Home bottom navigation: `80px`.

The visible composition totals approximately one `390 x 844` viewport before safe-area adjustments. Other routes retain their current mobile proportions.

## Visual Treatment

- Replace the bright group-car hero with the existing Case 05 single-car image.
- Keep imagery dark and restrained so copy sits directly over the photograph without a large opaque caption block.
- Use the existing condensed display and monospaced metadata styles at the smaller optical sizes visible in Direction C.
- Keep neutral rules and use blue only for metadata, arrows, the CTA, and the active navigation state.

## Featured Build

- Keep the Case 01 destination and existing performance figures.
- Place `VIEW CASE` in the specification rail as the fourth cell.
- Keep the image/copy split compact and avoid wrapping the project identifier.

## Destination Bands

- Keep the current Services, Cases, and Shop routes and owned imagery.
- Limit the copy panel to `40%` of the row so photography remains dominant.
- Preserve large full-row tap targets, visible focus states, and bilingual copy.

## Verification

- Compare the approved Direction C image and a new `390 x 844` browser capture side by side.
- Check English and Chinese states, image loading, route navigation, horizontal overflow, and browser console output.
- Confirm desktop at `1440 x 900` remains unchanged.
- Run the complete automated test suite.
