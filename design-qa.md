**Design QA: Mobile Option 3**

**Source Visual Truth**
- Shell: `/Users/wenpeili/.codex/generated_images/019edc34-b0b1-7e33-adc9-d777315e90eb/call_OCXIwzMzpsjjE8ybkn15IxZr.png` (`864 x 1821`)
- Page references: `call_AXibgna0OY403glzhJHmP9C6.png`, `call_pLmRYRoEfAe4aklIsWYyrS4K.png`, `call_wa1K4TzkqaPRO0xCRMUkANrz.png`, `call_mzLApVghLk5IYifKIhErWOEZ.png`, `call_XBb5HjCeDvhqanOp2p8jKsIh.png`, `call_hDJ1M6X8imoE1wQbyUJ6ZJoB.png`, `call_ArxY8zQhbRyMUyJEQQ834CMJ.png`, and `call_BmjTWWqEPoB9KtADrxWaweUV.png` in the same generated-images folder (`852-853 x 1844-1847`).

**Implementation Evidence**
- Browser-rendered captures: `audit/mobile-option3/*-implementation-426x922.png`
- Combined source/implementation inputs:
  - `audit/mobile-option3/comparison-1-final.png`
  - `audit/mobile-option3/comparison-2-final.png`
  - `audit/mobile-option3/comparison-3-final.png`
- Viewport: `426 x 922` CSS px, device scale factor `1`.
- Implementation captures: `426 x 922` px.
- Sources were displayed at `426 x 922` inside the comparison boards. This normalizes the approximately 2x source density; the Home source receives a minimal edge crop because its aspect ratio differs slightly.
- State: English, page scrolled to top, no hover or dialog state.

**Full-View Comparison**
- The fixed five-action navigation, compact topbar, dark automotive palette, white condensed display type, blue selection treatment, photographic hierarchy, and square-edged controls align with the selected Option 3 direction.
- Existing approved LONMA copy, imagery, route structure, bilingual controls, and working controllers were preserved. The source boards are treated as page-composition references rather than replacement content.
- Final comparison shows a consistent shell and responsive hierarchy across Home, Services, Cases, About, Shop, Project, Contact, Case Detail, and Product Detail.

**Focused Region Comparison**
- Header and bottom-navigation regions were checked at native `426px` width in all three comparison boards.
- Above-the-fold title, image crop, first primary action, and first content transition were checked per route at native width. Separate crops were not needed because each source and implementation remains readable at full native width in the combined boards.

**Findings**
- No remaining P0, P1, or P2 visual findings.
- [P3] The source boards fit more information above the fold by using very small body copy. The implementation intentionally keeps body copy near `15-16px` and touch targets at `44px+`, so some secondary content begins lower.
- [P3] Home keeps the approved group-car hero and direct project CTA instead of reproducing the source board's engine image and duplicate quick-link list.
- [P3] Product Detail gives the wheel image more inspection space than the concept board, matching the approved request for a larger product-entry area.

**Comparison History**
- Iteration 1: found uneven bottom-navigation columns, a `16px`-high brand link target, `10px` Project overflow at `767px`, and oversized first-screen headings compared with the selected samples.
- Fixes: removed inherited navigation gaps, raised the brand target to `44px`, reset Project action margins, tightened display type and first-screen spacing, and added `aria-pressed` to case filters.
- Iteration 2 evidence: `comparison-1-final.png`, `comparison-2-final.png`, and `comparison-3-final.png`; no actionable P0/P1/P2 findings remain.

**Interaction And Responsive Evidence**
- Bottom navigation successfully opened Shop.
- Language switched to Chinese; a fresh tab opened in English as designed.
- BMW filtering showed four matching cases and exposed `aria-pressed="true"`.
- Project Planner advanced from Vehicle to Goal.
- `36` route/viewport checks at `390`, `767`, `768`, and `1440` px found no horizontal overflow or broken images.
- Browser console: `0` warnings/errors across nine representative routes.
- Automated suite: `179/179` passed.

final result: passed
