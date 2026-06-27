#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const essayPath = 'src/content/essays/my-summer-schools-in-2026-overview.md';
const deployDir = '/Users/zephyrsui/Developer/aliyun-root-login';
const commitMessage = process.env.ESSAY_COMMIT_MESSAGE ?? 'Refresh summer schools essay';

function run(command, args, cwd = repoRoot) {
  console.log(`\n$ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function output(command, args, cwd = repoRoot) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) process.exit(result.status ?? 1);
  return result.stdout.trim();
}

run('node', ['scripts/sync-summer-schools-essay.mjs']);

rmSync(resolve(repoRoot, '.astro'), { recursive: true, force: true });
rmSync(resolve(repoRoot, 'dist'), { recursive: true, force: true });
run('npm', ['run', 'build']);

const status = output('git', ['status', '--short', '--', essayPath]);
if (!status) {
  console.log('\nNo essay changes to commit. Skipping push and deploy.');
  process.exit(0);
}

run('git', ['add', essayPath]);
const hasCachedDiff = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: repoRoot }).status !== 0;
if (!hasCachedDiff) {
  console.log('\nNo staged essay changes. Skipping push and deploy.');
  process.exit(0);
}

run('git', ['commit', '-m', commitMessage]);
run('git', ['push', 'origin', 'main']);

if (process.env.SKIP_DEPLOY === '1') {
  console.log('\nSKIP_DEPLOY=1, not deploying to Aliyun.');
} else {
  run('./deploy-siteweb.sh', [], deployDir);
}

console.log('\nDone.');
