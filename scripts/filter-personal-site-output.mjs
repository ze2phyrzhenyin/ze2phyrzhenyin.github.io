#!/usr/bin/env node

import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const personalOnly = process.env.SITEWEB_PERSONAL_ONLY === '1';

// These are independent, zhaoyang.fr-only pages rather than part of the
// trilingual personal site. Keep this list explicit so the zhauyoung.com
// release cannot accidentally start mirroring a newly discovered directory.
export const zhaoyangOnlyRoutes = [
  'construction-hotel-sql',
  'francophone-sport-careers',
  'guides',
  'logic-agents',
  'man-city-ucl-away-guide-2026-27',
  'medvedin',
  'musee-prague',
  'pyrenees-guide',
  'randonnee',
  'recruit',
  'summer-schools-religion',
  'thesisforma',
  'toulouse-bars',
  'toulouse-events',
];

// The other way round: zhauyoung.com-only pages, removed from the zhaoyang.fr build.
// `intro` is the ThesisForma invitation with the zhauyoung.com contact person; the
// zhaoyang.fr copy stays at /thesisforma/.
export const zhauyoungOnlyRoutes = [
  'intro',
];

if (personalOnly) {
  await Promise.all(zhaoyangOnlyRoutes.map((route) => (
    rm(fileURLToPath(new URL(`../dist/${route}/`, import.meta.url)), {
      recursive: true,
      force: true,
    })
  )));
  console.log(`Excluded ${zhaoyangOnlyRoutes.length} zhaoyang.fr-only routes from the personal-site mirror.`);
} else {
  await Promise.all(zhauyoungOnlyRoutes.map((route) => (
    rm(fileURLToPath(new URL(`../dist/${route}/`, import.meta.url)), {
      recursive: true,
      force: true,
    })
  )));
  console.log(`Kept zhaoyang.fr-only routes and excluded ${zhauyoungOnlyRoutes.length} zhauyoung.com-only route from the primary site build.`);
}
