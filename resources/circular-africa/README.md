# /guides/circular-africa/

Manna AI study "Circular consumption in Africa" as a website: report, source directory and research prompt, in English (source), Spanish and Chinese. Live at https://zhaoyang.fr/guides/circular-africa/ (noindex).

## Files

- `source/` — the two English Word documents (`.docx`), their pandoc exports (`report.en.md`, `directory.en.md`) and the research prompt (`prompt.en.md`). English is the source of truth.
- `parse.mjs` — reads `source/*.md` into `content/structure.json` and the English string table `content/strings.en.json` (strings keyed by a hash of the English text).
- `translate/` — `glossary.md`, `split.mjs` (cuts the string table into `chunks/`), `check.mjs` (checks a translated chunk: ids, URLs, figures, bold markers, left-over English), the translations `zh/*.json` and `es/*.json`, and `overrides.json` for hand fixes.
- `fieldui.mjs` — field kit, search, My list and English-original wording in three languages; the 30-day plan tasks with their targets.
- `assets/field.js` — the field kit (plan with dates, interview cards, case log, day-30 thresholds, export/import). Data stays in localStorage under `circular-africa-field-v1`; My list under `circular-africa-watch-v1`.
- `sw.js` (written by build.mjs) — offline copy: pages network-first, versioned assets from cache.
- `ui.mjs` — the site's own wording in three languages, chapter grouping, version number and upload time.
- `build.mjs` — writes `public/guides/circular-africa/` (9 pages, entry redirects, downloads in `files/`, assets).
- `places.mjs` — the places on the map: names, roles and figures in three languages, which report or directory text each place panel shows, markers and zoom views.
- `assets/` — `styles.css`, `app.js`, `map.json`. `map/gen.mjs` writes `map.json`: Natural Earth outlines via world-atlas 2.0.2 (Ghana 1:10m, neighbours 1:50m, rest 1:110m), lakes and rivers from Natural Earth 5.1.2 GeoJSON, one azimuthal equal-area projection, zoom boxes and km per unit. Run it in a scratch folder with `world-atlas@2.0.2 topojson-client@3.1.0 d3-geo@3.1.1` installed and `ne/ne_50m_lakes.geojson`, `ne/ne_50m_rivers_lake_centerlines.geojson` downloaded.
- `browser-check.mjs` — 24 browser checks (field kit, interview, search, My list, English original, offline registration, map explorer, bale sorting, events axis, directory charts and load, overflow, language leaks, sidebar state, URL filters, calculators, deep links, theme).

## Change something

1. Text change in the report or directory: edit `source/*.md`, run `node parse.mjs`, then `node translate/split.mjs` and translate the new or changed strings in `translate/zh|es/*.json` (`node translate/check.mjs zh --all`).
2. `node build.mjs --merge` (merges translations into `content/strings.<lang>.json`, then builds). Without `--merge` it builds from the merged files.
3. Serve `public/` (`python3 -m http.server 4391 --directory public`) and run `GUIDE_URL=http://127.0.0.1:4391 node browser-check.mjs` (set `GUIDE_PLAYWRIGHT_MODULE` if Playwright is not installed in the repo).
4. New upload: raise `version.n`, set `version.iso` to the release time and add a line to `historyItems` in `ui.mjs`. File names carry `-v<n>`.
5. Deploy: commit, push, then `cd ~/Developer/server-ops && ./serverctl deploy --yes rex siteweb-rex -- --project-dir ~/Developer/siteweb`.
