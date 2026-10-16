# REX work-order quote builder

The supplied `工单平台_勾选自动报价_2026-10-15.html` is rebuilt as a trilingual quote builder under `/guides/work-order-quote/{zh,en,fr}/`. All three Guides directories include it under business tools (14 entries, seven categories). The directory root uses the existing language-entry convention, with English as the default.

The original 30 modules, five default package totals, seven mandatory modules, default service rates and extension dependencies remain intact. Line prices are editable without mutating the source model; rental has its own explicit licence terms. `resources/work-order-quote/source-model.json` retains the full source data; `source.sha256` identifies the supplied HTML. `model.js` is its browser copy and a test requires exact equality. Locale copy, engine, UI and styles are separate files, with no new runtime dependency or remote asset.

The page uses a quiet green/charcoal palette, plain feature summaries and expandable scope. Feature and delivery tabs reduce scrolling between settings. Operations and annual budgets are permanently in the main list, with a direct navigation link. Whole-row checkbox labels, keyboard tab navigation, persistent selection, inline validation, native language links and the existing Guides theme preference are supported. On screens at most 800px wide, a bottom bar shows the current one-time total and jumps directly between options and the quote; there is no long scroll animation. Long French labels wrap. Desktop quotes have a bounded scroll area when expanded content exceeds the viewport.

## Calculation and exports

The compact discount field retains the original percentage convention: 100 means original price; 80 means 20% off. It applies to all our charges: software, setup, migration, extras, source code, annual maintenance, monthly operations and development. VAT is calculated on the discounted amount, rounded to cents. Third-party hosting, backup storage and external-service budgets are unchanged. Rate editors retain undiscounted prices; charged amounts appear in the quote breakdown and exports. First-/three-year estimates use the discounted one-time amount plus one/three years of recurring costs, excluding supplier taxes. A zero value is allowed. Blank, negative and over-limit input is flagged; exporting is disabled while a numeric input is invalid.

Required dependencies are added once and removed when no longer needed, while explicitly selected modules remain selected. Report extensions require inspection/media/report modules; label extensions choose M21 only if neither M21 nor M22 is selected. Migration does not force M23. Choosing a package preserves price overrides, extras, discount and ongoing costs; Reset all restores the whole configuration.

Selections are local to the browser. If storage is blocked, calculation and export work in memory, and language switching passes a sanitized configuration in the URL fragment and immediately removes it after loading (no configuration is put in the HTTP request). Company text is escaped in exports. Markdown and print/PDF contain only chosen modules/services, the original amount, payment percentage, savings, discounted tax, annual budgets and applicable scope/terms.

## Custom prices and monthly subscription

Every module, setup line, migration tier, media/source/training service, extension and maintenance tier has an inline EUR price editor. Zero and cent amounts are accepted, with per-line reset controls. Setup and package previews sum the edited prices. Hosting/external budgets stay editable. Price inputs do not toggle module checkboxes; invalid price drafts survive filtering and selection rerenders and can be revealed from the quote warning. Valid edits persist across reloads and locales, including the no-storage fragment fallback.

The billing selector offers one-time + annual maintenance or monthly rental + operations. Rental defaults to no purchased development hours. Software list rental is software cost / 36, rounded up to €10, then multiplied by the discount. Editable €150 monthly operations receive the same discount. Rounding the list rental before discounting prevents a €10 staircase from masking small discount changes. The 36-month basis is a disclosed pricing assumption, not a lock-in. Setup/extras are separate (upfront or 12/24/36 instalments). The editable €80/hour development rate is discounted and rounded to cents before multiplying by the approved hours. This request is counted once, never repeatedly in annual or three-year budgets. Annual maintenance and source-code purchase are excluded from rental without erasing one-time-plan settings. At cancellation the rental licence ends; remaining setup instalments are payable. Source is available only in the one-time plan.

Default base rental: €280/month service, €60/month external estimate and €2,400 setup. With 12 setup instalments, service is €480/month during that period and €280 after it. Three-year budget is €14,640 either way. Exports include the chosen billing model, setup/payment terms, monthly and initial taxes, development estimate, operating budgets and applicable licence terms. Official benchmarks and assumptions are documented in the pricing review.

## Build and verification

`npm run build` regenerates the three localized HTML shells before the usual Astro build. Standalone Guides content remains excluded by `SITEWEB_PERSONAL_ONLY=1`; no deployment to the personal-site mirror is required.

```sh
node scripts/tests/work-order-quote.mjs
node scripts/tests/guides-content.mjs
GUIDE_PLAYWRIGHT_MODULE=<playwright-module> dev-run node scripts/tests/work-order-quote-browser.mjs
GUIDE_PLAYWRIGHT_MODULE=<playwright-module> dev-run node scripts/tests/work-order-quote-pricing-browser.mjs
```

Browser test origin defaults to `http://127.0.0.1:4336` (serve `public/`). Override `GUIDE_URL` for production and `GUIDE_ARTIFACTS` for screenshots/PDFs/report output.

Verification covers five package totals, full source-model parity, direct/transitive/shared dependencies, manual selection retention, all delivery choices, 80/100/0/fractional percentages, VAT, recurring cost separation, bounds, all locale keys, whole-row clicks, search, selected filter, saved/blocked storage, language switching, Markdown/print exports, keyboard tabs and themes. Layout checks cover Chinese/English/French at 320, 360, 390, 430, 768, 820, 1024 and 1440px across all three panels. These are browser emulation checks, not physical-phone certification.

Official reference pricing and the qualified commercial assessment are in `work-order-quote-pricing-review.md`. The public page keeps this concise, in a closed disclosure with direct official links and the verification date.

Publish via the inventory-backed `serverctl deploy --yes zhao-zenbook siteweb-zenbook -- --project-dir <checkout>` after committing and pushing `origin main`.

The price/rental browser suite covers all three locales, every editable charge category, zero/decimal/invalid prices, individual/global reset, exports, 12/24/36 setup schedules, price/selection persistence, no double maintenance charge, no repeating development estimates and rental layouts from 320 to 1440px.

## Discount scope fix — 2026-10-16

The former formula left operations, annual maintenance and development undiscounted and rounded the software rental after discounting. The current formula applies the payable percentage once to every in-house charge and leaves third-party budgets unchanged. Existing saved rates and selected maintenance tiers require no migration.

At 40% on the base package: software rental €52 + operations €60 = €112/month excluding tax; setup €960; development €32/hour. Hosting remains €60/month. With no development requested, the first year is €3,024 and three years are €7,152 including hosting, excluding tax. At 80%, monthly software and operations are €224. At 0%, in-house charges are zero while supplier costs remain.

Regression coverage includes 0/40/80/100%, custom cent rates, editable original-price preservation, annual maintenance, VAT, supplier separation, 12/24/36-month setup settlement, one-time development, all three UI languages, Markdown exports, print output and mobile layouts.
