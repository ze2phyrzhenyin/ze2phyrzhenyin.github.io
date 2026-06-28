#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, statSync, watch } from 'node:fs';
import { join } from 'node:path';

const repoRoot = '/Users/zephyrsui/Developer/siteweb';
const writingRoot = process.env.SITEWEB_WRITING_ROOT
  ?? '/Users/zephyrsui/Developer/md-writing/personal-site';
const debounceMs = Number.parseInt(process.env.SITEWEB_WATCH_DEBOUNCE_MS ?? '6000', 10);
const watchedCollections = new Set(['blog', 'essays']);

let timer;
let running = false;
let queued = false;
let lastSnapshot = new Map();

function isContentMarkdown(filename) {
  if (!filename) return false;
  const normalized = filename.toString().replaceAll('\\', '/');
  const [collection] = normalized.split('/');
  return watchedCollections.has(collection) && /\.mdx?$/.test(normalized);
}

function snapshotMarkdown() {
  const next = new Map();

  function visit(dir, prefix = '') {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
      const abs = join(dir, entry.name);
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        visit(abs, rel);
      } else if (isContentMarkdown(rel)) {
        const stat = statSync(abs);
        next.set(rel, `${stat.mtimeMs}:${stat.size}`);
      }
    }
  }

  visit(writingRoot);
  return next;
}

function snapshotChanged(next) {
  if (next.size !== lastSnapshot.size) return true;
  for (const [key, value] of next.entries()) {
    if (lastSnapshot.get(key) !== value) return true;
  }
  return false;
}

function runPublish(reason) {
  if (running) {
    queued = true;
    return;
  }

  running = true;
  queued = false;
  console.log(`\nChange detected: ${reason}`);
  console.log('Publishing personal site content...');

  const child = spawn('npm', ['run', 'site:publish'], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  });

  child.on('close', (code) => {
    running = false;
    if (code !== 0) {
      console.error(`Publish failed with exit code ${code}. Watching continues.`);
    }
    if (queued) schedulePublish('queued change');
  });
}

function schedulePublish(reason) {
  clearTimeout(timer);
  timer = setTimeout(() => runPublish(reason), debounceMs);
}

function startPollingFallback() {
  lastSnapshot = snapshotMarkdown();
  setInterval(() => {
    const next = snapshotMarkdown();
    if (snapshotChanged(next)) {
      lastSnapshot = next;
      schedulePublish('markdown snapshot changed');
    }
  }, debounceMs);
}

if (!existsSync(writingRoot)) {
  console.error(`Writing root not found: ${writingRoot}`);
  process.exit(1);
}

console.log(`Watching ${writingRoot}`);
console.log('Tracked folders: blog/, essays/');
console.log('Press Ctrl+C to stop.');

try {
  watch(writingRoot, { recursive: true }, (_eventType, filename) => {
    if (isContentMarkdown(filename)) schedulePublish(filename.toString());
  });
} catch (error) {
  console.warn(`Recursive file watching is unavailable: ${error.message}`);
  console.warn('Falling back to polling.');
  startPollingFallback();
}
