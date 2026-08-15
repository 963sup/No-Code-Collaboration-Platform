import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const mode = process.argv[2];
const supabaseCliPath = resolve(process.cwd(), 'node_modules/supabase/dist/supabase.js');
const outputPath = resolve(
  process.cwd(),
  'packages/infrastructure/supabase/src/generated/database.types.ts'
);

if (!['check', 'write'].includes(mode)) {
  throw new Error('Usage: node tooling/database-types.mjs <check|write>');
}

const status = spawnSync(process.execPath, [supabaseCliPath, 'status', '-o', 'env'], {
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
const maxGenerationAttempts = 3;

function generateTypes() {
  for (let attempt = 1; attempt <= maxGenerationAttempts; attempt += 1) {
    const result = spawnSync(
      process.execPath,
      [supabaseCliPath, 'gen', 'types', 'typescript', '--db-url', dbUrl],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 120_000,
        windowsHide: true
      }
    );

    if (result.status === 0) return result.stdout.replaceAll('\r\n', '\n');

    const failure = `${result.stderr ?? ''}\n${result.stdout ?? ''}`;
    const registryRateLimited =
      failure.includes('toomanyrequests') || failure.includes('Rate exceeded');

    if (!registryRateLimited || attempt === maxGenerationAttempts) {
      process.stderr.write(result.stderr || result.stdout);
      process.exit(result.status ?? 1);
    }

    process.stderr.write(
      `Supabase database-type generation hit a container-registry rate limit; retrying (${attempt}/${maxGenerationAttempts}).\n`
    );
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, attempt * 5_000);
  }

  throw new Error('Unreachable database-type generation state.');
}

const generated = generateTypes();

if (mode === 'write') {
  writeFileSync(outputPath, generated);
  process.stdout.write(`${outputPath}\n`);
  process.exit(0);
}

const current = readFileSync(outputPath, 'utf8').replaceAll('\r\n', '\n');
if (current !== generated) {
  const currentLines = current.split('\n');
  const generatedLines = generated.split('\n');
  const sharedLength = Math.min(currentLines.length, generatedLines.length);
  let prefix = 0;
  while (prefix < sharedLength && currentLines[prefix] === generatedLines[prefix]) prefix += 1;

  let suffix = 0;
  while (
    suffix < currentLines.length - prefix &&
    suffix < generatedLines.length - prefix &&
    currentLines[currentLines.length - 1 - suffix] ===
      generatedLines[generatedLines.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const context = 3;
  const maxChangedLines = 120;
  const currentChangedEnd = currentLines.length - suffix;
  const generatedChangedEnd = generatedLines.length - suffix;
  const currentStart = Math.max(0, prefix - context);
  const generatedStart = Math.max(0, prefix - context);
  const currentEnd = Math.min(currentLines.length, currentChangedEnd + context);
  const generatedEnd = Math.min(generatedLines.length, generatedChangedEnd + context);

  function boundedSlice(lines, start, end) {
    const slice = lines.slice(start, end);
    if (slice.length <= maxChangedLines) return slice;
    return [
      ...slice.slice(0, Math.floor(maxChangedLines / 2)),
      `... ${slice.length - maxChangedLines} lines omitted ...`,
      ...slice.slice(-Math.ceil(maxChangedLines / 2))
    ];
  }

  process.stderr.write(
    `${JSON.stringify(
      {
        current: {
          firstLine: currentStart + 1,
          lines: boundedSlice(currentLines, currentStart, currentEnd)
        },
        firstDifferingLine: prefix + 1,
        generated: {
          firstLine: generatedStart + 1,
          lines: boundedSlice(generatedLines, generatedStart, generatedEnd)
        }
      },
      null,
      2
    )}\n`
  );
  process.stderr.write(
    'Generated database types are stale. Run `pnpm supabase:types:local` and commit the result.\n'
  );
  process.exit(1);
}

process.stdout.write('{"ok":true,"databaseTypes":"current"}\n');
