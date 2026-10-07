# Java revision guide

The user-provided `java-revision-site` is published at
`https://zhaoyang.fr/guides/java/`. The English, French and Chinese Guides
directories link to this single Chinese/French study site in their learning
materials section. The `from` query parameter selects the return-directory
language. The index now contains 13 guides across six categories.

This guide lives under `/guides/`, so the existing personal-only build filter
excludes it from zhauyoung.com. Publish with the inventory-backed
`zhao-zenbook/siteweb-zenbook` deployer.

## Source and regeneration

The imported content, examples and original validation reports are retained in
`resources/java-revision-site/`. Course data and the three Java examples are
byte-identical to the supplied files. Only the application shell, navigation,
responsive styles and builder destination were adapted.

From the repository root:

```sh
python3 resources/java-revision-site/source/build.py
npm run build
```

The Python builder produces the committed self-contained
`public/guides/java/index.html`. Astro copies it into the release and includes
its canonical URL in the sitemap. It requires no Java, server API or external
asset to read the study content. Learning records remain in browser localStorage;
the existing JSON export/import supports transferring records between devices.

## Mobile behavior

Below 761px, chapters use one column, statistics use two columns, primary
controls have 44px touch targets, form inputs use 16px text, and code/table
scrolling stays inside its container. The header exposes a return link, search,
text size and theme controls. The sidebar has a close button, backdrop,
Escape handling and focus trap; closed navigation and the background of an
open drawer are inert. Search fields stack to fit narrow viewports.

## Validation

- `node scripts/tests/guides-content.mjs`: 39 existing localized content pages,
  all static links (including the new Java cards), translation invariants and
  canonical metadata.
- `scripts/tests/java-guide.mjs`, using Playwright Chrome: 397 study routes at
  320, 390, 760, 768, 844 and 1440px, including landscape; 2,382 layout checks
  without page overflow or empty content. Screenshots were visually reviewed.
  Interaction checks cover the three directory entries and return links,
  touch/keyboard navigation, search results, saved notes and learned status,
  answer grading, mock timing/submission, record export/import, theme persistence
  and study navigation with the network disabled after initial loading.
- `npm run build`: full Astro production build and canonical sitemap generation;
  the built Java HTML matches the generated public HTML byte for byte.

Run the browser gate against a static server serving `public`:

```sh
python3 -m http.server 4332 --bind 127.0.0.1 --directory public
GUIDE_PLAYWRIGHT_MODULE=<playwright-module> node scripts/tests/java-guide.mjs
```

`GUIDE_URL` selects a different origin, `GUIDE_ARTIFACTS` selects the evidence
directory, and `JAVA_SKIP_LAYOUTS=1` runs only the interaction checks. These are
browser emulation checks; no physical-phone certification is claimed. The
original Java compilation reports are retained as provenance, not rerun claims.

## Production receipt

Released on zhao-zenbook as `20261007T075246Z` from clean commit `bbf20f3`.
The inventory deployer's public smoke checks passed. The Java page and all
three Guides index pages were fetched over HTTPS and matched the validated
local files byte for byte. The six browser interaction groups also passed
against `https://zhaoyang.fr`, with no script or HTTP errors.
