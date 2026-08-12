import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const mode = process.argv[2];
const outputPath = resolve(
  process.cwd(),
  'packages/infrastructure/supabase/src/generated/database.types.ts'
);

if (!['check', 'write'].includes(mode)) {
  throw new Error('Usage: node tooling/database-types.mjs <check|write>');
}

const status = spawnSync('pnpm', ['exec', 'supabase', 'status', '-o', 'env'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  timeout: 30_000,
  windowsHide: true
});

if (status.status !== 0) {
  process.stderr.write(status.stderr || status.stdout);
  process.exit(status.status ?? 1);
}

const dbUrlLine = status.stdout
  .split(/\r?\n/u)
  .map((line) => line.trim())
  .find((line) => line.startsWith('DB_URL='));

if (!dbUrlLine) {
  throw new Error('Supabase status did not expose DB_URL for the running local database.');
}

const dbUrl = dbUrlLine.slice('DB_URL='.length).replace(/^"|"$/gu, '');
const result = spawnSync(
  'pnpm',
  ['exec', 'supabase', 'gen', 'types', 'typescript', '--db-url', dbUrl],
  {
    cwd: process.cwd(),
    encoding: 'utf8',
    timeout: 120_000,
    windowsHide: true
  }
);

if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

const generated = result.stdout.replaceAll('\r\n', '\n');

if (mode === 'write') {
  writeFileSync(outputPath, generated);
  process.stdout.write(`${outputPath}\n`);
  process.exit(0);
}

const current = readFileSync(outputPath, 'utf8').replaceAll('\r\n', '\n');
if (current !== generated) {
  process.stderr.write(
    'Generated database types are stale. Run `pnpm supabase:types:local` and commit the result.\n'
  );
  process.exit(1);
}

process.stdout.write('{"ok":true,"databaseTypes":"current"}\n');
