# Personal-site production rule

- The trilingual Astro personal site must be released to both production origins for every personal-site update: `https://zhaoyang.fr/` (served from `zhao-zenbook`; `rex` is only the public ingress since 2026-09-28) and `https://zhauyoung.com/` on server `zhaoubuntu`.
- Always run `npm run deploy:production` from this repository for a personal-site release. Do not call only one server's deployer and do not use the legacy `aliyun-root-login` deployment scripts.
- A release is complete only after both inventory-backed deployers and both public smoke checks succeed. If the second deployment fails, report the release as incomplete and retry the missing side before considering the work finished.
- The standalone pages at `/construction-hotel-sql/`, `/francophone-sport-careers/`, `/guides/`, `/logic-agents/`, `/man-city-ucl-away-guide-2026-27/`, `/medvedin/`, `/musee-prague/`, `/randonnee/`, `/recruit/`, `/toulouse-bars/`, and `/toulouse-events/` are `zhaoyang.fr`-only content. They are outside the personal-site parity rule and must not be published on `zhauyoung.com`.
- For a change limited to one of those standalone pages, deploy only the `siteweb-zenbook` application (`./serverctl deploy --yes zhao-zenbook siteweb-zenbook -- --project-dir <this repo>`); the old `rex siteweb` deployer is disabled. For a mixed change that also touches the personal site, use the paired production command.
- Production server inventory and deployment implementations live in the sibling repository `/Users/zephyrsui/Developer/server-ops`; use only its `serverctl` inventory entries.
- Commit and push every change to GitHub (`origin main`) before deploying; run `git fetch` first and merge any remote work.
