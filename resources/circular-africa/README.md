# /guides/circular-africa/

Manna AI study "Circular consumption in Africa" as a website: report, source directory and research prompt, in English (source), Spanish and Chinese. Live at https://zhaoyang.fr/guides/circular-africa/ (noindex).

## Files

- `source/` — the two English Word documents (`.docx`), their pandoc exports (`report.en.md`, `directory.en.md`) and the research prompt (`prompt.en.md`). English is the source of truth.
- `parse.mjs` — reads `source/*.md` into `content/structure.json` and the English string table `content/strings.en.json` (strings keyed by a hash of the English text).
- `translate/` — `glossary.md`, `split.mjs` (cuts the string table into `chunks/`), `check.mjs` (checks a translated chunk: ids, URLs, figures, bold markers, left-over English), the translations `zh/*.json` and `es/*.json`, and `overrides.json` for hand fixes.
- `extraui.mjs` — search palette, My list and English-original wording in three languages.
- `sw.js` (written by build.mjs) — removes the offline worker that version 3 installed.
- `ui.mjs` — the site's own wording in three languages, chapter grouping, version number and upload time.
- `build.mjs` — writes `public/guides/circular-africa/` (9 pages, entry redirects, downloads in `files/`, assets).
- `places.mjs` — the places on the map: names, roles and figures in three languages, which report or directory text each place panel shows, markers and zoom views.
- `assets/` — `styles.css`, `app.js`, `map.json` (continent, inlined in the report page) and `map-detail.json` (Ghana regions, roads, water, routes; Accra and Kumasi streets, markets, coast; fetched on first zoom). `map/gen.mjs` writes both; its header lists the inputs: Natural Earth 5.1.2 and world-atlas 2.0.2 outlines, geoBoundaries GHA ADM1, Overpass API extracts of OpenStreetMap (roads, water, markets, suburbs, Accra coastline) and two OSRM driving routes, downloaded on 28 Nov 2026. Credit line is on the map.
- `browser-check.mjs` — 22 browser checks (map fly-to, street detail, drag, wheel, buttons, double click, search, My list, English original, bale sorting, events axis, directory charts and load, overflow, language leaks, sidebar state, URL filters, calculators, deep links, theme).

## Change something

1. Text change in the report or directory: edit `source/*.md`, run `node parse.mjs`, then `node translate/split.mjs` and translate the new or changed strings in `translate/zh|es/*.json` (`node translate/check.mjs zh --all`).
2. `node build.mjs --merge` (merges translations into `content/strings.<lang>.json`, then builds). Without `--merge` it builds from the merged files.
3. Serve `public/` (`python3 -m http.server 4391 --directory public`) and run `GUIDE_URL=http://127.0.0.1:4391 node browser-check.mjs` (set `GUIDE_PLAYWRIGHT_MODULE` if Playwright is not installed in the repo).
4. New upload: raise `version.n`, set `version.iso` to the release time and add a line to `historyItems` in `ui.mjs`. File names carry `-v<n>`.
5. Deploy: commit, push, then `cd ~/Developer/server-ops && ./serverctl deploy --yes rex siteweb-rex -- --project-dir ~/Developer/siteweb`.
