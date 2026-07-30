**Design QA: Mobile Home Direction C Fidelity**

**Source Visual Truth**
- Selected concept: `/Users/wenpeili/.codex/generated_images/019edc34-b0b1-7e33-adc9-d777315e90eb/call_qPxCwnQGcAYnqB1DZPwvqeif.png`
- Source dimensions: `853 x 1844` px.
- The source was normalized to `390 x 844` px for a same-size comparison.

**Implementation Evidence**
- Final browser capture: `audit/mobile-home-cinematic-20260730/home-c-390x844-typography-final.png`
- Final side-by-side comparison: `audit/mobile-home-cinematic-20260730/source-vs-home-c-390x844-typography-final.png`
- Mobile viewport: `390 x 844` CSS px, device scale factor `1`.
- Implementation capture: `390 x 844` px.
- State: English default, page at top, no hover state.

**Full-View Comparison**
- Both views now fit the complete composition in one phone viewport: compact header, `290px` hero, `124px` build dossier, three `86px` image bands, `48px` project CTA, and `80px` bottom navigation.
- The black single-car workshop hero, overlay copy placement, parameter rail, image-dominant destination bands, blue CTA, and five-action navigation follow the selected Direction C hierarchy.
- The final implementation document measures exactly `390 x 844`, with no horizontal overflow.

**Focused Region Comparison**
- Hero: the generated standalone `1170 x 870` WebP preserves the source's whole-car workshop composition without embedded UI text.
- Featured build: image/copy row is `82px`; specifications and `VIEW CASE` share one `42px` four-column rail.
- Destination bands: copy occupies `40%` and imagery occupies the remaining visible area.
- Navigation: all five destinations remain visible, fixed, and separated into equal columns.

**Required Fidelity Surfaces**
- Typography: the `30px` hero title renders at `156px` text width against the source's approximately `159px`; the tracked kicker renders at `140px`; destination titles render at `21px` with `65px` text width for `SERVICES`.
- Header: the mobile wordmark renders at `13px`, `0.18em` tracking, and `132px` text width inside a `41px` header, matching the normalized source.
- Spacing: major section heights and horizontal copy proportions match the normalized source.
- Colors: neutral black/gray surfaces, white copy, muted metadata, and restricted BMW-inspired blue accents match the source.
- Images: the hero is a clean standalone raster asset; Services, Cases, Shop, and featured-build media use project-owned images without placeholders.
- Copy: approved bilingual LONMA text and route labels are preserved.

**Findings**
- No remaining P0, P1, or P2 findings.
- [P3] The featured-build thumbnail uses an authentic crop from LONMA's group photograph instead of the concept's isolated turquoise-car render.
- [P3] The CTA uses the existing approved wrench icon rather than introducing a new gear asset.

**Comparison History**
- Iteration 1 finding: the implementation was approximately `1013px` tall at a `390 x 844` viewport, used a bright group-car hero, placed `VIEW CASE` in the copy area, and gave destination copy `62%` of each band. These were P1/P2 composition mismatches.
- Iteration 2 fix: section heights were reduced to the normalized Direction C measurements, copy width changed to `40%`, and `VIEW CASE` moved to a four-column specification rail.
- Iteration 3 fix: a text-free black-car workshop hero was generated as a dedicated raster asset and the featured build received a focused owned-photo crop.
- Iteration 4 fix: the wordmark, hero display title, tracked kicker, destination numbers/titles, CTA alignment, and bottom-navigation labels were recalibrated from the same-size comparison.
- Post-fix evidence: `source-vs-home-c-390x844-typography-final.png`; no actionable P0/P1/P2 differences remain.

**Interaction And Responsive Evidence**
- English and Chinese states both measure `390 x 844` with no horizontal overflow or clipped destination copy.
- Every mobile image loads with nonzero natural dimensions.
- Browser console: `0` errors.
- Desktop at `1440 x 900`: mobile journal is hidden, approved desktop cover remains `grid`, and no horizontal overflow is present.
- JavaScript syntax check passed.
- Automated suite: `184/184` passed.

final result: passed
