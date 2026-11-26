# REX opportunity guide

Public routes: `https://zhaoyang.fr/guides/rex-opportunities/{zh,en,fr}/`.
The former single-page URL `/guides/rex-opportunities/` redirects through the shared
`/guides/entry.js` (English unless `?lang=zh|fr` is given) and keeps the query string
and the anchor. The guide belongs to the zhaoyang.fr-only `/guides/` subtree.

## Content and generation

The Chinese data are the source. Edit, then build and test:

```sh
node resources/rex-opportunities/build.mjs
node scripts/tests/rex-opportunities.mjs
node scripts/tests/guides-content.mjs
```

| Edit | For |
| --- | --- |
| `public/guides/rex-opportunities/events.json` | events, notices, dates, scope (Chinese) |
| `public/guides/rex-opportunities/prompt.txt` | the research prompt the weekly run uses (Chinese) |
| `resources/rex-opportunities/translations.json` | English and French for every Chinese string of `events.json` |
| `resources/rex-opportunities/prompt.en.txt`, `prompt.fr.txt` | translations of the prompt |
| `resources/rex-opportunities/locales.mjs` | interface text (`ui`) and the per-issue editorial text (`issue`) in the three languages |

The generator writes `{zh,en,fr}/index.html`, the root redirect, `report.md` (Chinese),
`report.en.md`, `report.fr.md`, `prompt.en.txt`, `prompt.fr.txt` and `filter-aliases.json`
under `public/guides/rex-opportunities/`. Do not edit those by hand: the test compares
them with a fresh render. `style.css` and `app.js` are hand-written and shared by the
three pages; their cache-busting query is a hash of the file, so rebuild after changing them.

`translations.json` has two parts. `terms` lists the countries, cities, sectors, goals,
update types and notice kinds with a stable `key`: the key is the filter value, the URL
parameter and the `data-*` attribute in all three pages, which is what lets a filtered
view survive a language switch. `strings` pairs each Chinese string (`zh`) with `en` and
`fr`; `at` only records where it first occurs. Strings without Chinese (official event
names, venues, URLs) are used unchanged. The build stops and lists what is missing when
a Chinese string or term has no translation, so a changed fee or deadline cannot ship in
Chinese only. It also stops when `prompt.txt` no longer matches the hash in `sources`:
update both prompt translations, then store the new hash.

French is written with ordinary spaces everywhere. The generator sets the no-break
spaces before `; : ? !`, inside « », in `1 234 €` and before `%`. English and French
pages show dates as `1 Dec 2026` / `1er déc. 2026`; the `datetime`, `data-date` and
`data-deadline` attributes keep the ISO values of `events.json`. English writes prices
as `€330 incl. VAT`, French as `330 € TTC`.

The archive snapshots under `archive/` and `prompt.txt` exist in Chinese only. English
and French pages link to them with an "(in Chinese)" label and offer the translated
prompt for reading and reuse.

Before replacing a dated snapshot, retain its events, report and prompt under
`archive/YYYY-MM-DD/`, then update `issue` in `locales.mjs` (priorities, calendar,
plans, clashes, materials, archive rows) for the three languages.

The 2026-11-16 snapshot, revised on 2026-11-24, combines the supplied initial report,
local additions and expanded European coverage: 46 opportunities, including 24
additions, and 10 application/opening notices from the revision date. It preserves the
2026-11-15 and 2026-11-16 snapshots. Country, sector, activity dates and application
deadlines are separate fields. An unknown event date remains unknown, including World FIRA.

The prompt removes the 300 km limit, preserves actual eligibility boundaries, and
records the existing Monday 08:00 Europe/Paris research plan. This static page does not
create or execute a scheduler. Publishing the prompt does not change the original
automation. No registration, purchase or organiser contact is performed by this guide.

Each activity records its own source/check scope; the whole dataset is not presented as
newly verified. The translations were made from the Chinese snapshot and are not a new
check of prices or availability. ISE uses the technology-provider deadline 2027-02-02,
not the generic page header 2027-02-11. Existing-company, student, supplier and
co-founder eligibility remain distinct. Prices and availability are dated information,
not live feeds.

## Interface and acceptance

The static HTML remains readable without JavaScript, including the language links.
`app.js` adds combined search, country/sector/goal/city/month/priority filters,
date/deadline sorting, URL query persistence, browser-local favourites, anchor reveal,
deadline ranges, theme switching, printing and clipboard selection fallback. No
dependency or third-party client request is added. Reduced-motion preferences disable
animated expansion and smooth scrolling.

A language switch keeps the query string (filters, search text, view, sort, reminder
range), the anchor, the favourites (same `localStorage` key as before), the open events
and the reading position. Search matches the text of the page's language plus the place,
sector and goal names of the other Latin-script language; Chinese search terms only match
on the Chinese page. Links saved before the filters used keys (`?country=德国`) are
resolved through `filter-aliases.json`, fetched only in that case.

```sh
GUIDE_URL=http://127.0.0.1:4328 GUIDE_PLAYWRIGHT_MODULE=<playwright module> \
  node resources/rex-opportunities/browser-check.mjs
```

`browser-check.mjs` opens the three pages at 390 and 1280 px (GUIDE_URL serves
`public/`): overflow with everything collapsed and expanded, theme toggle and
persistence, filters, accent-insensitive search, favourites, reminder ranges, prompt
download equality, language switching with state, the legacy root URL and a no-JavaScript
pass. On 2026-11-26 it passed 141 checks with Playwright 1.65 and Chromium headless shell 1254;
layouts were also reviewed at 320 and 768 px.

`scripts/tests/rex-opportunities-browser.js` is the earlier in-page test function for
the Chinese page (evaluate its source in a preview tab).

Publish after committing and pushing through the inventory-backed `siteweb-rex`
deployer, followed by public content checks and required rex-ovh cleanup. This
standalone change does not require a second personal-site origin release or a
business-service restart.
