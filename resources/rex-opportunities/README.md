# REX opportunity guide

Public route: `https://zhaoyang.fr/guides/rex-opportunities/`.
The Chinese guide is linked from the Chinese, English and French guide indexes.
It belongs to the zhaoyang.fr-only `/guides/` subtree.

## Content and generation

Edit `public/guides/rex-opportunities/events.json` and `prompt.txt`, then run:

```sh
node resources/rex-opportunities/build.mjs
node scripts/tests/rex-opportunities.mjs
node scripts/tests/guides-content.mjs
```

The generator writes `index.html` and the downloadable `report.md`. The HTML,
report and prompt include the same activity records, deadline notices and
research scope. Before replacing a dated snapshot, retain its events, report
and prompt under `archive/YYYY-MM-DD/`.

The 2026-11-16 snapshot combines the supplied initial report, local additions
and expanded European coverage: 46 opportunities, including 24 additions,
and 14 application/opening notices. It preserves the 2026-11-15 snapshot.
Country, sector, activity dates and application deadlines are separate fields.
An unknown event date remains unknown, including World FIRA.

The current prompt removes the 300 km limit, preserves actual eligibility
boundaries, and records the existing Monday 08:00 Europe/Paris research plan.
This static page does not create or execute a scheduler. Publishing the prompt
does not change the original automation. No registration, purchase or organiser
contact is performed by this guide.

Official FRAMES, local organiser, SIVAL, FRUIT LOGISTICA, ISE and Advanced
Factories pages were opened during this update. Each activity records its own
source/check scope; the whole dataset is not presented as newly verified.
ISE uses the technology-provider deadline 2027-02-02, not the generic page
header 2027-02-11. Existing-company, student, supplier and co-founder eligibility
remain distinct. Prices and availability are dated information, not live feeds.

## Interface and acceptance

The static HTML remains readable without JavaScript. `app.js` adds combined
search, country/sector/goal/city/month/priority filters, date/deadline sorting,
URL query persistence, browser-local favourites, anchor reveal, deadline ranges,
theme switching, printing and clipboard selection fallback. No dependency or
third-party client request is added. Reduced-motion preferences disable
animated expansion and smooth scrolling.

`scripts/tests/rex-opportunities-browser.js` is an async browser-context test
function. Evaluate its source in a fresh preview tab (for example through the
Chrome DevTools evaluate-script tool). It exercises 24 behaviours, including
filter combinations, accent-insensitive lookup, favourites, filtered deep links,
expansion, deadline ranges, exact prompt downloads, denied-clipboard fallback,
print-state restoration and horizontal overflow. It clears its own favourite
and filter state afterwards; run in an isolated browser context.

On 2026-11-16 the focused browser checks passed at 390 px; layouts were visually
reviewed at 320, 390, 768 and 1440 px, with light/dark themes. Opening every event
at 320 px produced no horizontal overflow. Reduced-motion scrolling was verified.
The 46-record data/anchor/eligibility check and 39-page static guide check passed.
The optional all-guides Playwright suite was unavailable in the local checkout
because Playwright is not installed; focused Chrome checks cover this update.

Publish after committing and pushing through the inventory-backed
`siteweb-rex` deployer from the Zenbook checkout, followed by public content
checks and required rex-ovh cleanup. This standalone change does not require a
second personal-site origin release or a business-service restart.
