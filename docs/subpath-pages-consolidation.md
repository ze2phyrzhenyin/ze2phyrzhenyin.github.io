# Subpath pages consolidation note

## Date
- 2026-08-07

## Context
- We previously maintained `musee-prague` and `randonee` as independent deployable apps under `inventory/apps`.
- From this point, their pages are consolidated into the main `siteweb` app for easier维护 and统一发布。

## Implemented scope
- Added static pages under `siteweb/public`:
  - `public/musee-prague/index.html`
  - `public/randonnee/index.html`
  - `public/recruit/index.html`
- Added canonical URLs so sitemap generation in `scripts/generate-sitemap.mjs` is valid.
- Cleared old independent app configs:
  - removed `inventory/apps/musee-prague.toml`
  - removed `inventory/apps/randonee.toml`
- Removed old Nginx includes and directories on rex:
  - `/etc/nginx/snippets/randonee.conf`
  - `/etc/nginx/snippets/musee-prague.conf`
  - `/var/www/randonnee`
  - `/var/www/musee-prague`
  - associated `include` directives from `/etc/nginx/sites-available/zhaoyang.fr`

## Public routes now served by siteweb
- `https://zhaoyang.fr/randonnee/`
- `https://zhaoyang.fr/musee-prague/`
- `https://zhaoyang.fr/recruit/`

## Deployment
- Deploy with:
  - `./serverctl deploy --yes rex siteweb -- --project-dir /Users/zephyrsui/Developer/siteweb`
- After deploy, verify with:
  - `curl -I https://zhaoyang.fr/randonnee/`
  - `curl -I https://zhaoyang.fr/musee-prague/`
  - `curl -I https://zhaoyang.fr/recruit/`
