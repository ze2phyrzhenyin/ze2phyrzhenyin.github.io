# France pricing reference

Published routes: `/guides/france-pricing/{zh,en,fr}/`, plus `products/`, `modules/`, `compare/`, `sources/` in each locale. This is a market-reference companion, not another quotation tool. Guides and the existing quote link to it. It remains zhaoyang.fr-only under the repository release rule.

## Plan and implementation

Five pages: overview, six vendor price lists and implementation packs, 30 REX modules with scope and effort estimates, adjustable budget comparison, sources and calculations. Copy is deliberately short. Official prices, REX prices and development estimates are labeled separately. The existing quote supplies visual tokens, the translated module catalog and the calculation engine. All 15 pages have static HTML content, canonical URLs and reciprocal locale links. Search, budget controls, storage, theme, Markdown export and print are client-side enhancements.

Input: `/Users/zephyrsui/Downloads/huawei/rex-pricing-site/data/pricing.json`, preserved without changes in `resources/france-pricing/source-pricing.json`. The original package was bilingual; English was added and all customer-facing copy shortened. Its older quotation engine was not reused.

## Official checks — 2026-10-16

| Source | Confirmed price and billing basis |
|---|---|
| [GoSuivi](https://www.gosuivi.fr/tarifs.php) | Premium €45, Marque Blanche €59, Complète €99 / package / month, HT. Multi-site quote separate. |
| [GLPI](https://www.glpi-project.org/fr/pricing/) | Public €19 per paid user/month, Private €21 with minimum 25; HT. End users are distinct from paid agents. |
| [Freshdesk](https://www.freshworks.com/fr/freshdesk/pricing/) | Growth €17, Pro €52, Enterprise €84 / agent / month on annual billing. VAT basis not confirmed in the captured price section. |
| [Zendesk](https://www.zendesk.fr/pricing/) | Support Team / Suite Team / Suite Professional: annual €19 / 55 / 115, monthly €25 / 69 / 149. VAT basis not confirmed. |
| [DoliCloud](https://www.dolicloud.com/fr/fr-faq-pricing.php) | Basic €14 per active internal user; Premium €30 fixed + €15 per user/month; HT confirmed in footnote. |
| [Synchroteam](https://www.synchroteam.fr/tarif.php) | Standard €39 annual / €49 monthly; Premium €64 annual / €79 monthly per paid user. First administrator free. VAT basis not confirmed. |
| [Falinwa France](https://www.falinwa.com/pricing) | 25 h €2,500; 50 h €4,625; 100 h €10,000; 200 h €17,000. Implied €100 / 92.50 / 100 / 85 per hour, scope varies. VAT basis not confirmed. |
| [Malt fullstack](https://www.malt.fr/t/barometre-tarifs/tech/developpeur-backend/developpeur-fullstack) | €557/day for experienced profiles active in the previous three months. Platform sample, not a national average. |
| [French Ministry of Economy](https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mes-autres-impots-et-taxes/tva-quels-sont-les-taux-de-votre-quotidien) | Mainland standard VAT rate 20%. No blanket 20% applied to vendor prices with unknown tax basis. |

The input marked Synchroteam's billing periods ambiguous. Official HTML resolves this: `pricing-window annual`, `toggle-term` checked, spans `annual` = 39/64 and `monthly` = 49/79. Local verification artifact: `/tmp/rex-market-audit/synchroteam.html`. This correction is in normalized `data.js`; the input snapshot is unchanged.

## Arithmetic and boundaries

- SaaS total = `(fixed monthly + rate × max(paid users, minimum)) × 12 × years + setup + annual extras × years`. Package-based GoSuivi uses a multiplier of 1.
- Annual rates are monthly equivalents requiring annual billing. Unknown VAT stays explicitly unknown. Optional setup/extras default to zero and are excluded until entered.
- REX presets include €1,800 annual maintenance and €60/month third-party budget. Base over three years: purchase €14,510, rental €14,640. Scopes and usage rights differ; no savings percentage or feature-equivalence claim.
- Saved quote loading is read-only and includes custom rates, discount, selected modules, services, development and installments. Existing `compute()` is reused. For partial installment periods only due installments are included, with the full activation amount reconciled at maturity. Once-only development is counted once. Third-party budgets are not discounted.
- REX default prices: 30 modules €25,000, required implementation €2,400. These are not French market averages.
- Original effort assumptions: 102–170 module days + 18–30 shared days = 120–200 days. At the assumed €500–700/day: €60,000–140,000. These are scenario estimates for a new build, not vendor quotes.
- Falinwa hourly rates divide pack cost by hours. Malt €557 / 7 ≈ €80/hour uses an assumed seven-hour day; it is a conversion, not an advertised hourly tariff.

## Validation

- `node scripts/tests/france-pricing.mjs`: unit/period/minimum/fixed pricing, extras, all quote discount/installment combinations including cents, module-day totals and 15 static routes.
- `scripts/tests/france-pricing-browser.mjs`: 3 languages × 5 pages × 5 widths, route/locale links, module filters, budget arithmetic, invalid input, read-only quote import, storage, export, print, light/dark, no-JS content and runtime errors.
- Existing quote tests cover the companion link and all-charge discount fix; Guides i18n tests cover the new directory card.
- Browser artifacts: `/tmp/rex-market-audit/browser/`; quote regression: `/tmp/rex-market-audit/quote-regression/`.

Build: `npm run build` runs both static generators, Astro and sitemap checks. Deploy via the registered `zhao-zenbook siteweb-zenbook` inventory app after committing and pushing main.
