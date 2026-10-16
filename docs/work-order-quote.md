# REX work-order quote builder

The supplied `工单平台_勾选自动报价_2026-10-15.html` is rebuilt as a trilingual quote builder under `/guides/work-order-quote/{zh,en,fr}/`. All three Guides directories include it under business tools (14 entries, seven categories). The directory root uses the existing language-entry convention, with English as the default.

The original 30 modules, five package totals, seven mandatory modules, service rates, extension dependencies and licensing boundaries remain intact. `resources/work-order-quote/source-model.json` retains the full source data; `source.sha256` identifies the supplied HTML. `model.js` is its browser copy and a test requires exact equality. Locale copy, engine, UI and styles are separate files, with no new runtime dependency or remote asset.

The page uses a quiet green/charcoal palette, plain feature summaries and expandable scope. Feature, delivery and running-cost tabs reduce scrolling between settings. Whole-row checkbox labels, keyboard tab navigation, persistent selection, inline validation, native language links and the existing Guides theme preference are supported. On screens at most 800px wide, a bottom bar shows the current one-time total and jumps directly between options and the quote; there is no long scroll animation. Long French labels wrap. Desktop quotes have a bounded scroll area when expanded content exceeds the viewport.

## Calculation and exports

The payment percentage is explicit: 100 means original price; 80 means 20% off. It applies to all one-time line items, including setup, migration, extras and source code. VAT is calculated on the discounted amount, rounded to cents. Maintenance and supplier budgets stay separate and undiscounted. First-/three-year estimates use the discounted one-time amount plus one/three years of recurring costs, excluding supplier taxes. A zero value is allowed. Blank, negative and over-limit input is flagged; exporting is disabled while a numeric input is invalid.

Required dependencies are added once and removed when no longer needed, while explicitly selected modules remain selected. Report extensions require inspection/media/report modules; label extensions choose M21 only if neither M21 nor M22 is selected. Migration does not force M23. Choosing a package preserves extras, discount and ongoing costs; Reset all restores the whole configuration.

Selections are local to the browser. If storage is blocked, calculation and export work in memory, and language switching passes a sanitized configuration in the URL fragment and immediately removes it after loading (no configuration is put in the HTTP request). Company text is escaped in exports. Markdown and print/PDF contain only chosen modules/services, the original amount, payment percentage, savings, discounted tax, annual budgets and applicable scope/terms.

## Build and verification

`npm run build` regenerates the three localized HTML shells before the usual Astro build. Standalone Guides content remains excluded by `SITEWEB_PERSONAL_ONLY=1`; no deployment to the personal-site mirror is required.

```sh
node scripts/tests/work-order-quote.mjs
node scripts/tests/guides-content.mjs
GUIDE_PLAYWRIGHT_MODULE=<playwright-module> dev-run node scripts/tests/work-order-quote-browser.mjs
```

Browser test origin defaults to `http://127.0.0.1:4336` (serve `public/`). Override `GUIDE_URL` for production and `GUIDE_ARTIFACTS` for screenshots/PDFs/report output.

Verification covers five package totals, full source-model parity, direct/transitive/shared dependencies, manual selection retention, all delivery choices, 80/100/0/fractional percentages, VAT, recurring cost separation, bounds, all locale keys, whole-row clicks, search, selected filter, saved/blocked storage, language switching, Markdown/print exports, keyboard tabs and themes. Layout checks cover Chinese/English/French at 320, 360, 390, 430, 768, 820, 1024 and 1440px across all three panels. These are browser emulation checks, not physical-phone certification.

Official reference pricing and the qualified commercial assessment are in `work-order-quote-pricing-review.md`. The public page keeps this concise, in a closed disclosure with direct official links and the verification date.

Publish via the inventory-backed `serverctl deploy --yes zhao-zenbook siteweb-zenbook -- --project-dir <checkout>` after committing and pushing `origin main`.
