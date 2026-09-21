#!/usr/bin/env node

import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const personalOnly = process.env.SITEWEB_PERSONAL_ONLY === '1';

// These are independent, zhaoyang.fr-only pages rather than part of the
// trilingual personal site. Keep this list explicit so the zhauyoung.com
// release cannot accidentally start mirroring a newly discovered directory.
export const zhaoyangOnlyRoutes = [
  'francophone-sport-careers',
  'guides',
  'logic-agents',
  'man-city-ucl-away-guide-2026-27',
  'medvedin',
  'musee-prague',
  'randonnee',
  'recruit',
  'toulouse-bars',
  'toulouse-events',
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
  console.log('Kept zhaoyang.fr-only routes in the primary site build.');
}
