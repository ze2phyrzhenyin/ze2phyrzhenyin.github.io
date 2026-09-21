# Personal-site production deployment

The English, Chinese, and French personal site has two production origins:

- `https://zhaoyang.fr/` is deployed as `siteweb` to `rex`.
- `https://zhauyoung.com/` is deployed as `zhauyoung-site` to `zhaoali`.

Publish every personal-site change to both with one command:

```bash
npm run deploy:production
```

The command assigns one release identifier to both deployments and stops with
an error unless both inventory-backed deployment scripts succeed. The canonical
metadata remains on `zhaoyang.fr` so the second origin is an intentional mirror.

The standalone `/francophone-sport-careers/`, `/guides/`, `/logic-agents/`, `/man-city-ucl-away-guide-2026-27/`, `/medvedin/`, `/musee-prague/`,
`/randonnee/`, `/recruit/`, `/toulouse-bars/`, and `/toulouse-events/` pages are not part of the mirrored personal site. The `zhauyoung-site` build
sets `SITEWEB_PERSONAL_ONLY=1`, which removes those routes before creating its
sitemap and release artifact. A change limited to those standalone pages is
deployed only to the `rex` `siteweb` application.
