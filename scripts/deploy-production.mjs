#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const serverOpsRoot = process.env.SITEWEB_SERVER_OPS_ROOT
  ?? resolve(repoRoot, '..', 'server-ops');
const serverctl = resolve(serverOpsRoot, 'serverctl');
const release = process.env.SITEWEB_RELEASE
  ?? new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

if (!existsSync(serverctl)) {
  console.error(`serverctl not found: ${serverctl}`);
  process.exit(1);
}

function deploy(server, app) {
  console.log(`\nPublishing release ${release} to ${app} on ${server}...`);
  const result = spawnSync(
    serverctl,
    [
      'deploy', '--yes', server, app, '--',
      '--project-dir', repoRoot,
      '--release', release,
    ],
    { cwd: serverOpsRoot, env: process.env, stdio: 'inherit' },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    console.error(`\nRelease ${release} is incomplete: ${app} on ${server} failed.`);
    process.exit(result.status ?? 1);
  }
}

deploy('zhao-zenbook', 'siteweb-zenbook');
deploy('zhaoubuntu', 'zhauyoung-site');

console.log(`\nRelease ${release} is live on zhaoyang.fr and zhauyoung.com.`);
