# LONMA DYNAMIC Sanity Case CMS Design

## Objective

Connect the existing Sanity Studio to the six published LONMA DYNAMIC case studies without redesigning the website. Editors should be able to update bilingual case copy, covers, photo stories, video, metadata, and display order. The public site must remain usable if Sanity is empty, slow, or unavailable.

## Scope

### Included

- Sanity documents for Case 01 through Case 06.
- English and Chinese content for each editable text field.
- Cover and hero images, a flexible photo-story sequence, video poster and source, SEO fields, vehicle metadata, brand, and order.
- Content updates on `pages/cases.html` and the six pages in `pages/cases/`.
- Existing static HTML as a complete fallback.
- One-time seed data based on the currently published case pages.
- A separately deployed Sanity Studio for editing and publishing.

### Excluded

- Homepage, Services, Shop, About, Contact, and Project Planner content.
- A Next.js migration, Visual Editing, draft previews inside the public site, ecommerce data, user accounts, or role automation.
- Replacing the approved page layout, typography, animation, navigation, or responsive behavior.
- Automatic deletion or migration of the current local image files.

## Selected Approach

Use progressive enhancement against Sanity's public read API.

The browser first renders the complete static page already committed to the repository. A small shared client then requests published Sanity content and replaces only known content slots after validating the response. This gives editors immediate published updates without requiring a Vercel rebuild and keeps the current website available during a CMS outage.

This is preferred over build-time generation for the first release because the repository is a static HTML site with six individually designed case pages. It is also preferred over a Next.js migration because that would expand the work into a full-site rebuild.

## Content Model

Create reusable localized field types with `en` and `zh` values. English is required because it is the site's default language. Chinese remains optional while content is being prepared; when missing, the renderer uses English and then the static page value.

Each `casePage` document contains:

- `caseNumber`: stable label such as `CASE 01`.
- `slug`: stable route key such as `case-01`.
- `order`: integer used for the Cases rail, archive, and previous/next relationships.
- `brand`: one of BMW, Audi, or Mercedes-Benz for the existing filter.
- `vehicle`: make, model, year, chassis, and optional specification line.
- `title`: localized primary title.
- `subtitle`: localized supporting title.
- `lede`: localized hero description.
- `story`: localized opening narrative.
- `cover`: Sanity image or existing public-site image path, with localized alt text and hotspot support.
- `video`: optional poster, uploaded video file, or external MP4 URL. An uploaded file takes precedence over the external URL.
- `mediaSections`: ordered photo-story items. Each item contains an image or existing public-site image path, localized alt text, optional localized heading and body, and one layout choice: full width, text left, or text right.
- `seo`: localized page title and description plus an optional social image.
- `featured`: boolean reserved for Cases-page emphasis; it does not change the homepage in this release.

Sanity draft and published document states provide the publishing workflow. No separate custom status field is needed.

## Editing Experience

The Studio list is ordered by `order`, then `caseNumber`. Its document preview shows the case number, English title, brand, and cover image. Fields are grouped into Overview, Vehicle, Media, SEO, and Publishing sections so the editor does not face one long undifferentiated form.

Validation prevents duplicate slugs and display orders, requires English title and cover data, limits the active collection to Case 01 through Case 06, and accepts only HTTPS external media URLs or known site-local asset paths. Media section previews show their image and heading.

The first release seeds six editable documents from the current site. Existing images remain in the repository and are referenced by path; newly uploaded images and optional video files are served by Sanity's CDN. This avoids duplicating the current library while allowing future uploads from the Studio.

## Public-Site Architecture

Add one shared, dependency-free client module responsible for:

1. Reading the public Sanity project ID, dataset, and API version from a committed non-secret configuration file.
2. Querying only published `casePage` documents with one GROQ request per page.
3. Normalizing localized fields, image sources, video sources, and optional values.
4. Rejecting malformed records before they reach the DOM.
5. Updating elements explicitly marked with CMS data attributes.
6. Rendering photo-story sections into one dedicated unframed container.
7. Leaving the original static DOM untouched when loading or validation fails.

`pages/cases.html` requests the published case collection and updates the six existing rail/archive entries by slug. It may change cover, title, brand, and order, but it does not create a new layout or modify the homepage.

Each detail page requests one document based on its `data-case-slug`. Case 01 and Cases 03 through 06 use the shared detail renderer. Case 02 keeps its current video-led hero and uses the shared renderer only for content fields and the photo story below it.

The current language switch remains authoritative. CMS-rendered nodes receive the same `data-en` and `data-zh` attributes used by `content-pages.js`, so switching language continues to work after asynchronous content arrives.

## Media Delivery

Sanity images use CDN transforms and responsive `srcset` values for 640, 960, 1600, and 2400 pixel widths where the source allows it. Images keep explicit dimensions, `object-fit: cover`, asynchronous decoding, and lazy loading below the first viewport. The hero image uses high fetch priority only when the CMS response arrives early enough; the existing static hero remains the initial performance-safe source.

Existing repository images continue using the responsive derivatives introduced in PR #15. The CMS client must not replace a responsive local image with a larger original file.

Videos are not autoplayed. Case 02 keeps poster-first behavior, reduced-motion handling, and its current controls. A missing or invalid video source produces the existing poster-only state.

## Failure And Safety Behavior

- Missing CMS configuration: skip the request and keep static content.
- Network error, timeout, invalid JSON, or query error: keep static content and emit one concise development warning.
- Empty dataset or unpublished document: keep the matching static case.
- Missing Chinese field: use English, then static Chinese content if present.
- Missing image or video: retain the existing media element and poster state.
- A single invalid media item: omit only that item, not the full case document.
- Content is inserted as text or safe attributes; Sanity text is never assigned through `innerHTML`.
- No read/write token is exposed to the browser. The dataset must permit public reads of published content; Studio authentication protects editing.

## Deployment And Configuration

The existing `lonma-sanity-studio` Vercel project remains the editor application. Its production environment receives the Sanity project ID and dataset. The public `jagger` project uses the same public project ID and dataset through committed browser-safe configuration; no secret is required for published reads.

Sanity CORS origins include the production site, the Studio domain, Vercel preview domains where practical, and local development origins. Credentials are enabled only for Studio/preview origins that require authenticated access.

The six seed documents are imported once after authentication. Seeding is idempotent by using deterministic document IDs such as `casePage-case-01`; rerunning it updates the same drafts instead of creating duplicates.

## Verification

Automated checks cover:

- schema registration, localized field requirements, and Studio production build;
- GROQ query shape and deterministic slug mapping;
- normalization and fallback behavior for missing, malformed, and partial data;
- safe text insertion and URL validation;
- Cases-page order/filter updates without changing card count or layout;
- detail-page bilingual switching after CMS content loads;
- Case 02 poster-only and video-ready states;
- no horizontal overflow at 390x844, 768x1024, 1440x900, and 1900x1050;
- no uncaught browser errors when Sanity succeeds, returns no document, or is unreachable.

Manual acceptance verifies that publishing a title, cover, photo-story item, and video change in Studio updates the corresponding public page while the homepage remains unchanged. A forced network failure must show the current static page without broken images or blank regions.

## Release Sequence

1. Finalize the schema and Studio structure.
2. Add the browser-safe Sanity client and content normalization tests.
3. Mark and connect the Cases overview slots.
4. Mark and connect the six detail pages, preserving Case 02's special video structure.
5. Add responsive CMS media rendering and fallback tests.
6. Build the Studio and run the full website test suite.
7. Configure the real Sanity project and CORS origins.
8. Import and publish the six seed documents.
9. Deploy previews, verify desktop and mobile, then merge and release.

## Success Criteria

- An editor can update and publish all six case studies from Sanity without editing HTML.
- Published changes appear on the Cases page and the matching detail page.
- English remains the first-load language and the existing Chinese switch still works.
- The current visual design, responsive behavior, and animations remain intact.
- The public site still displays complete case content when Sanity is unavailable.
- Homepage and all non-case pages remain unchanged.
