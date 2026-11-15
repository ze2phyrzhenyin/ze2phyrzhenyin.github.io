# REX opportunity guide

Public route: `https://zhaoyang.fr/guides/rex-opportunities/`.
This is a Chinese guide linked from all three guide indexes, with the language
explicitly identified on the English and French indexes. It belongs to the
zhaoyang.fr-only `/guides/` subtree.

Edit `public/guides/rex-opportunities/events.json` for the activity snapshot and
`prompt.txt` for the reusable research prompt. Then run:

```sh
node resources/rex-opportunities/build.mjs
node scripts/tests/guides-content.mjs
```

The generator writes `index.html` and the downloadable `report.md`. All event
content and the prompt remain readable without JavaScript. The external script
adds search, combined filters, expansion, anchor reveal, printing and clipboard
copy with a selection/download fallback. It does not register, contact organisers
or create a scheduled task.

The initial 2026-11-15 snapshot preserves the user's supplied report. Selected
official pages and forms were opened before publication, with the scope recorded
per event; other fields are not represented as newly verified. In particular,
ISE's technology-provider deadline is 2027-02-02 despite the generic page header
showing 2027-02-11. The Advanced Factories PDF could not be retrieved by the web
reader; attachment constraints remain attributed to the original report.

Check desktop and mobile layouts, combined search, an empty result, reset,
expand/collapse, a deep link into a filtered-out event, theme switching,
clipboard fallback and downloaded prompt equality. Publish through the
inventory-backed `siteweb-rex` deployer after committing and pushing, then perform
the required rex-ovh cleanup. No second personal-site origin is needed for this
standalone guide.
