# Guide translation and navigation release

The guide index and all eleven standalone guides now have English, French and
Simplified Chinese paths. The Toulouse bars bibliography is translated as well:
39 content pages in total. Legacy root URLs resolve to the corresponding locale
and retain explicit language, query parameters and section anchors.

Every guide includes a same-language return link to `/guides/`, language controls
and a light/dark mode button. The initial theme follows the device preference;
an explicit choice is stored across guide pages, languages and refreshes. The
theme is applied in the document head before rendering. Blocked storage still
allows switching on the current page.

The shared language-navigation handler only touches language controls. Ordinary
section links keep their destinations, including the sports directory's four
sections and the Prague document's three tabs. Prague table cards also use the
available mobile width.

Translated data retain source identifiers, URLs, numbers and dates: 375 events,
26 bars, three Pyrenees routes and 24 school programmes. The source snapshots
were translated, not refreshed as a new check of availability or opening hours.
Search and filter state, bookmarks, expanded school cards and football calculator
selections survive language navigation. Calendar exports use the selected language.

Validation:

- `node scripts/tests/guides-content.mjs`: local links, canonical/alternate paths,
  theme wiring, locale coverage and source-data invariants.
- `GUIDE_PLAYWRIGHT_MODULE=<playwright module> node scripts/tests/guides-i18n.mjs`:
  36 main pages and three bibliographies; mobile and desktop rendering;
  all index/return links; actual sports/museum tab clicks; search, filters,
  bookmarks, calendar export, calculator and both theme overrides/persistence.
- `npm run build`: Astro build, sport locale parity and canonical sitemap.

Production is the inventory-backed `rex/siteweb` target at `zhaoyang.fr`.
Standalone guides are excluded from the personal-site mirror.

Released 2026-09-24 as `guides-theme-20260924T171800Z` using
`serverctl deploy --yes rex siteweb`. The atomic deploy and public smoke checks
succeeded. The complete browser gate also passed against `https://zhaoyang.fr`,
including all section tabs and both theme overrides. All 39 public content pages
and five shared navigation/theme assets match the validated local files byte for
byte. Desktop sports tabs and the light-mode control received an additional live
click check.
