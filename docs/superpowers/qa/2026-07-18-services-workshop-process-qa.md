# Services Workshop Process QA

- Source target: `call_EYiEgDevLPftYPjI4dbu35el.png`
- Accent: Services scopes `--accent-bright` to `#3788c8`; automated contrast ratios are `4.89:1` on `#111315` and `4.59:1` on `#171a1d`.
- `1900 x 1050`: viewport width `1900`, workspace `1898 x 974`, six equal `162.164px` to `162.172px` rows, no horizontal overflow.
- `1440 x 900`: viewport width `1440`, workspace `1438 x 824`, six equal `137.164px` to `137.172px` rows, no horizontal overflow.
- `980 x 900` English: header `152px`; all six rows `162px`; copy and media contained; no text or horizontal overflow.
- `900 x 900` English: all six rows `162px`; no text or horizontal overflow.
- `768 x 900` English: tablet split retained; natural row heights `177px` to `202px`; all copy and media contained; no text or horizontal overflow.
- `767 x 900` English: stacked into one `765px` column; all six rows `360px`; copy and media contained; no text or horizontal overflow.
- `390 x 844` English: `scrollWidth === clientWidth === 390`; all six rows remain `360px` with current copy, media is `359px` to `360px`, and copy and arrows are contained. The final `height: auto`, `min-height: 360px`, and absolute-media rules allow future longer or resized text to grow without intrinsic-image expansion. No text or horizontal overflow.
- Language toggle: `zh -> en -> zh` updates navigation, intro title, and all six service titles and descriptions; English service copy has no text overflow.
- Interaction: runtime activation and focus of row 02 leaves exactly row 02 active with neutral surface `rgb(23, 26, 29)`, label `rgb(55, 136, 200)`, and a matching `2px solid` focus outline. Reload restores row 04 as the sole default active row.
- Hover: fine-pointer hover styling is CSS-gated by the automated contract. The in-app browser does not expose reliable hover emulation, so runtime hover emulation is not claimed.
- Console errors: none.
- Comparison: the final `1900` screenshot and combined comparison were refreshed; no P0 or P1 mismatch; approved Chinese title hierarchy and existing case photography retained.
- Regression: `node --test *.test.mjs` passed `8/8`; `git diff --check` clean.
- Local QA artifacts: `outputs/services-workshop-process-1900.png`, `outputs/services-workshop-process-1440.png`, `outputs/services-workshop-process-mobile.png`, `outputs/services-workshop-process-english-1900.png`, and `outputs/services-workshop-process-comparison.png`. These files are local only and are not committed.
- Result: passed.
