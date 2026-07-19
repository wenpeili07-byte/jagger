# LONMA DYNAMIC Link Closure Design

## Goal

Remove the remaining dead-end navigation without redesigning the confirmed
homepage, cases index, or services index.

The finished flow must provide:

- Working Case 01-06 links from the cases archive.
- A real detail page for Case 02-06.
- A useful detail page for each of the six services.
- A clear route from every detail page back to its index and forward to contact.
- The same Chinese/English switch, header, 1900px canvas, and mobile behavior used
  by the confirmed site.

## Scope

### Included

- Update the six archive cards on `pages/cases.html`.
- Preserve the masked vertical image rail as a background-selection control. It
  does not become a page-navigation control.
- Add `case-02.html` through `case-06.html`.
- Keep `case-01.html` as the non-video structural baseline.
- Replace the empty bodies of the six existing service detail pages.
- Add shared detail-page CSS and JavaScript only where it removes duplication.
- Add automated tests for links, shared structure, language switching, and
  responsive constraints.

### Excluded

- The local Case 01 video candidate.
- New photography, video production, or CMS integration.
- A full rewrite of the homepage, cases index, services index, about, or contact
  page.
- Final long-form copywriting or technical specifications for each vehicle.
- Permanent URL changes.

## Approach

Use static HTML pages and shared presentation files. This matches the existing
site, keeps Vercel deployment simple, and avoids introducing a new framework for
eleven small detail pages.

Case pages share the current case-detail visual language. Service pages share a
new lightweight detail stylesheet and the existing content-page language logic.
Each HTML file remains directly editable and can later be generated from CMS
content without changing public URLs.

## Case Detail Pages

### Routes

- `pages/cases/case-01.html`
- `pages/cases/case-02.html`
- `pages/cases/case-03.html`
- `pages/cases/case-04.html`
- `pages/cases/case-05.html`
- `pages/cases/case-06.html`

### Content Mapping

| Case | English title | Chinese title | Existing image |
| --- | --- | --- | --- |
| 01 | Street Widebody | 街道宽体 | `case-01.jpg` |
| 02 | Track Setup | 赛道化升级 | `case-02.jpg` |
| 03 | Low Stance | 姿态低趴 | `case-03.jpg` |
| 04 | Turbo Tune | 涡轮特调 | `case-04.jpg` |
| 05 | Photo Feature | 影像作品车 | `case-05.jpg` |
| 06 | Blue Performance | 蓝色性能车 | `case-06.jpg` |

### Page Structure

Each case page contains:

1. Shared site header.
2. Back link to the cases archive.
3. Case number, English title, Chinese title, and one short introduction.
4. One large hero photograph.
5. A natural image-and-text story section.
6. A contact call to action.
7. Previous and next case links.

The visual direction remains photography-led:

- No video block.
- No dense specification tables.
- No blue module-label rail.
- No image captions or numbering under photographs.
- No heavy card borders or dark bars attached to images.
- Blue is limited to small interactive and focus states.

The initial release may reuse the case cover image within its own detail page.
Replacing it with multiple unique photographs is a later content task.

## Service Detail Pages

### Routes

- `pages/services/build.html`
- `pages/services/parts.html`
- `pages/services/photo.html`
- `pages/services/ecu.html`
- `pages/services/chassis.html`
- `pages/services/exhaust.html`

### Page Structure

Each service page contains:

1. Shared site header with the Services navigation state.
2. Service number, English category, Chinese title, and short description.
3. One full-width service image from the existing service set.
4. A concise service scope expressed as plain editorial text, not boxed cards.
5. A short process line: discuss, plan, execute, review.
6. A link back to the services index.
7. A primary contact call to action.

Service pages use the copy already approved on the homepage and services index.
No prices, guarantees, brands, or technical claims are invented.

### Shared Files

- `service-detail.css` owns the detail layout and responsive behavior.
- `service-detail.js` owns translation state and active navigation only if the
  existing `content-pages.js` cannot be reused cleanly.
- Reuse `styles.css`, `layout-canvas.css`, and existing image assets.

## Link Behavior

- Cases archive cards link to their corresponding case detail page.
- Homepage case modules remain buttons for background selection.
- Services index rows and homepage service modules link to their existing service
  detail routes.
- Every new page has a working back link and contact link.
- Previous/next case navigation wraps from Case 06 to Case 01 and from Case 01 to
  Case 06.
- No public `href="#"` remains for a case archive card.

## Language Behavior

- Chinese is the default language.
- The header navigation, page title, introduction, service scope, calls to
  action, back links, and previous/next labels switch together.
- `html lang` changes between `zh-CN` and `en`.
- The selected language persists through the existing local-storage key.
- The language control keeps a visible keyboard focus indicator.

## Responsive Behavior

- The shared site canvas remains capped at 1900px.
- No page uses `100vw` or whole-page `transform: scale()`.
- At 1900 x 1050, hero content stays within the intended first-screen rhythm.
- At 790px split-screen width, text and imagery stack or shrink without horizontal
  overflow.
- Below 768px, pages become a single-column reading flow.
- Header and language controls follow the shared compact header rules.
- Images use stable aspect ratios and `object-fit: cover`.

## Accessibility And Failure Handling

- All pages have unique document titles and one `h1`.
- Images have useful alt text.
- Links and language controls are keyboard accessible.
- Focus-visible states use the brighter blue accent.
- If an image fails, text and navigation remain usable because image containers
  do not carry essential text.
- Contact links use the existing contact page or approved email address.

## Testing

Automated checks must verify:

- Six case archive cards have non-placeholder detail links.
- Case 01-06 files exist and expose the expected titles and images.
- Six service detail files contain real main content, back links, and contact
  calls to action.
- Shared detail styles avoid permanent blue borders and heavy card framing.
- Language data exists for all visible detail-page copy.
- All pages load the 1900px canvas cache key.
- No tested page contains horizontal-overflow patterns such as `width: 100vw`.

Browser verification must cover:

- Cases archive to Case 02 and back.
- Services index to Build and back.
- Chinese/English switching on one case and one service page.
- Desktop at 1900 x 1050.
- Split-screen at 790 x 900.
- Mobile at 390 x 844.
- Browser console errors and missing local assets.

## Acceptance Criteria

- A visitor can enter every case and every service without reaching an empty page.
- The cases rail behavior remains unchanged.
- Case detail pages remain simple and photography-led.
- Service detail pages feel complete enough to support an inquiry without
  pretending to contain unavailable technical data.
- Desktop, split-screen, and mobile layouts have no horizontal overflow.
- Existing confirmed index-page visuals and animations are unchanged.
