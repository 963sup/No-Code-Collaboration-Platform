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

const result = spawnSync('pnpm', ['exec', 'supabase', 'gen', 'types', 'typescript', '--local'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  timeout: 120_000,
  windowsHide: true
});

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
  let index = 0;
  while (index < current.length && index < generated.length && current[index] === generated[index]) {
    index += 1;
  }
  process.stderr.write(
    `Generated database types are stale: current=${current.length}, generated=${generated.length}, firstDifference=${index}.\n`
  );
  process.stderr.write(`currentContext=${JSON.stringify(current.slice(Math.max(0, index - 80), index + 120))}\n`);
  process.stderr.write(`generatedContext=${JSON.stringify(generated.slice(Math.max(0, index - 80), index + 120))}\n`);
  process.exit(1);
}

process.stdout.write('{"ok":true,"databaseTypes":"current"}\n');
