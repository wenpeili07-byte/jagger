# Services Workshop Process QA

- Source target: `call_EYiEgDevLPftYPjI4dbu35el.png`
- `1900 x 1050`: viewport width `1900`, workspace `1898 x 974`, six equal `162.164px` to `162.172px` rows, no horizontal overflow.
- `1440 x 900`: viewport width `1440`, workspace `1438 x 824`, six equal `137.164px` to `137.172px` rows, no horizontal overflow.
- `980 x 900` English: header `152px`; all six rows `162px`; copy and media contained; no text or horizontal overflow.
- `900 x 900` English: all six rows `162px`; no text or horizontal overflow.
- `768 x 900` English: natural row heights `177px` to `202px`; all copy and media contained; `PERFORMANCE PARTS` and `ECU CALIBRATION` fit; no text or horizontal overflow.
- `390 x 844` English: `scrollWidth === clientWidth === 390`; all six rows remain `360px` with current copy, media is `359px` to `360px`, and copy and arrows are contained. The final `height: auto`, `min-height: 360px`, and absolute-media rules allow future longer or resized text to grow without intrinsic-image expansion. No text or horizontal overflow.
- Language toggle: `zh -> en -> zh` updates navigation, intro title, and all six service titles and descriptions; English service copy has no text overflow.
- Interaction: row 04 initializes active; focusing row 01 leaves exactly row 01 active with computed outline `rgb(46, 125, 189) solid 2px`; row 02 pointer activation navigates to `pages/services/parts.html`; language toggle behavior is verified.
- Console errors: none.
- Comparison: the final `1900` screenshot and combined comparison were refreshed; no P0 or P1 mismatch; approved Chinese title hierarchy and existing case photography retained.
- Regression: `node --test *.test.mjs` passed `6/6`; `git diff --check 91300c9..HEAD` clean.
- Local QA artifacts: `outputs/services-workshop-process-1900.png`, `outputs/services-workshop-process-1440.png`, `outputs/services-workshop-process-mobile.png`, `outputs/services-workshop-process-english-1900.png`, and `outputs/services-workshop-process-comparison.png`. These files are local only and are not committed.
- Result: passed.
