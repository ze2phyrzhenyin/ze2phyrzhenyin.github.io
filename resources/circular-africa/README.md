# /guides/circular-africa/

Manna AI study "Circular consumption in Africa" as a website: report, source directory and research prompt, in English (source), Spanish and Chinese. Live at https://zhaoyang.fr/guides/circular-africa/ (noindex).

## Files

- `source/` — the two English Word documents (`.docx`), their pandoc exports (`report.en.md`, `directory.en.md`) and the research prompt (`prompt.en.md`). English is the source of truth.
- `parse.mjs` — reads `source/*.md` into `content/structure.json` and the English string table `content/strings.en.json` (strings keyed by a hash of the English text).
- `translate/` — `glossary.md`, `split.mjs` (cuts the string table into `chunks/`), `check.mjs` (checks a translated chunk: ids, URLs, figures, bold markers, left-over English), the translations `zh/*.json` and `es/*.json`, and `overrides.json` for hand fixes.
- `ui.mjs` — the site's own wording in three languages, chapter grouping, version number and upload time.
- `build.mjs` — writes `public/guides/circular-africa/` (9 pages, entry redirects, downloads in `files/`, assets).
- `assets/` — `styles.css`, `app.js`, `map.json` (Natural Earth outlines via world-atlas 2.0.2, projected once).
- `browser-check.mjs` — 13 browser checks (load, overflow, language leaks, sidebar state, URL filters, calculators, deep links, theme).

## Change something

1. Text change in the report or directory: edit `source/*.md`, run `node parse.mjs`, then `node translate/split.mjs` and translate the new or changed strings in `translate/zh|es/*.json` (`node translate/check.mjs zh --all`).
2. `node build.mjs --merge` (merges translations into `content/strings.<lang>.json`, then builds). Without `--merge` it builds from the merged files.
3. Serve `public/` (`python3 -m http.server 4391 --directory public`) and run `GUIDE_URL=http://127.0.0.1:4391 node browser-check.mjs` (set `GUIDE_PLAYWRIGHT_MODULE` if Playwright is not installed in the repo).
4. New upload: raise `version.n`, set `version.iso` to the release time and add a line to `historyItems` in `ui.mjs`. File names carry `-v<n>`.
5. Deploy: commit, push, then `cd ~/Developer/server-ops && ./serverctl deploy --yes rex siteweb-rex -- --project-dir ~/Developer/siteweb`.
