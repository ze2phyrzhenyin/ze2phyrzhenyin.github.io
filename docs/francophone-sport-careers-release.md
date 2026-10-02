# Francophone sport careers guide

- Public URL: https://zhaoyang.fr/francophone-sport-careers/
- Directory entry: https://zhaoyang.fr/guides/
- Source: `public/francophone-sport-careers/`
- Original working folder: `/Users/zephyrsui/Downloads/huawei/francophone-sport-careers`
- Research snapshot: 2026-09-13; the interface refactor did not reverify employer vacancies.

The page is a browsing directory with internship, club, other-job, and official-source views. Search and filters are shareable in the URL. Application tracking, private notes, email templates, marketing panels, and storage writes were removed. The original catalog remains intact, including 46 organizations, 25 opportunities, and 67 sources.

On phones, the category navigation stays visible, advanced filters expand on request, and detail content scrolls between a fixed close bar and official links. Inputs use 16px type, and principal touch controls are at least 40–44px high. Closing details preserves the list scroll position.

The initial release uses the existing inventory-backed `rex/siteweb` deployer with release `sport-careers-20260913T2300`. An isolated candidate was assembled from the checksum-verified current production artifact and overlaid with this guide and the updated guide index. Other production files were verified byte-for-byte against the previous release, excluding the generated sitemap and release metadata. Existing unrelated personal-site edits remain in the working tree.

The new route is explicitly excluded by `scripts/filter-personal-site-output.mjs`; a full `SITEWEB_PERSONAL_ONLY=1` build confirmed that the route and sitemap entry are absent from the personal-site mirror.

Validation: Chromium and WebKit, all 46 organization and 25 opportunity details, 67 sources, region/sport/tier/pay filters, query escaping, downloads, hash navigation, scroll restoration, computed expiry, and 320/360/390/430/768/844/1440px viewports. The single-file export was also opened from `file://` in WebKit. These are browser viewport simulations, not physical-device tests. Repeatable test and screenshots are in the original working folder under `tests/`.

Public verification completed after release: all six guide assets match local bytes; the English, Chinese, and French personal homepages match the previous production checksums; the guide index opens the new page; WebKit mobile filtering, details and source navigation pass; the new path returns 404 on zhauyoung.com. All 71 details were additionally checked for internal horizontal overflow at 320px, and landscape detail controls stay in view.

## Trilingual i18next release

The guide now uses self-hosted i18next 26.4.2 with `ui` and `content` namespaces in `locales/fr.json`, `en.json`, and `zh.json`. Each locale has 947 string entries. `scripts/build-sport-locales.mjs` validates key/placeholder parity and creates the offline `locales/resources.js` bundle as part of `npm run build`.

French is the no-preference default, regardless of browser language. An explicit valid `?lang=fr|en|zh` overrides a saved manual choice. The preference is the only value written to browser storage; if storage is denied, the URL still retains the language on refresh. The header and detail dialog both expose language controls.

Switching updates navigation, filters, categories, plural counts, native date formatting, metadata, accessibility attributes, club descriptions, job requirements and source notes. It preserves filter codes, keywords, matched records, the current detail and reading progress. Official names, original job titles, source URLs, IDs, timestamps, pay amounts and machine statuses remain in the immutable original dataset. The JSON download is explicitly labelled as original Chinese research data in its tooltip.

Verification: both Chromium and WebKit passed the trilingual suite, including 213 localized detail views (71 records × 3 languages), all sections, empty/error states, language persistence, disabled storage, source-data immutability, 320–1440px layouts and landscape controls. The existing Chinese browsing regression also passed all 18 groups after adapting its date assertion to the semantic `datetime` value. Catalog checks compare the flattened string leaves because the generic skill checker does not accept structured content arrays; the repository build validates these arrays directly. The runtime literal audit has zero untranslated findings, with native language names explicitly allowed.

Repeat the i18n browser suite with `SPORT_GUIDE_PLAYWRIGHT_MODULE=<path-to-playwright/index.mjs> node scripts/tests/sport-i18n.mjs`. Set `SPORT_GUIDE_ENGINE=chromium` for Chrome, or omit it for WebKit. The original Downloads project contains the same locale resources, runtime and a trilingual portable HTML export; its repeatable suite is `tests/i18n_test.mjs`.

Production release: `sport-i18n-20260913T2330`, using the registered `rex/siteweb` deployer and a candidate assembled from the verified currently running artifact. All other site files remain byte-identical. A personal-only build confirms this guide is excluded from zhauyoung.com.

Public trilingual verification passed after the release: eleven runtime/data/locale files match local checksums; a clean English-language browser opens in French; all three language choices persist across reload; filters and dialog reading progress are retained; club details and all 67 sources render in the selected language; no JavaScript errors were recorded. Personal homepage checksums remain unchanged and the guide still returns 404 on zhauyoung.com.
