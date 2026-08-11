import { appendFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const result = spawnSync('pnpm', ['exec', 'supabase', 'status', '-o', 'env'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  timeout: 30_000,
  windowsHide: true
});

if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

const values = Object.fromEntries(
  result.stdout
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf('=');
      const key = line.slice(0, separator);
      const rawValue = line.slice(separator + 1);
      return [key, rawValue.replace(/^"|"$/gu, '')];
    })
);

const url = values.API_URL ?? values.SUPABASE_URL;
const publishableKey = values.PUBLISHABLE_KEY ?? values.ANON_KEY;

if (!url || !publishableKey) {
  throw new Error('Supabase status did not expose API_URL and a publishable/anon key.');
}

const output = [
  `NEXT_PUBLIC_SUPABASE_URL=${url}`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishableKey}`
].join('\n');

if (process.env.GITHUB_ENV) {
  appendFileSync(process.env.GITHUB_ENV, `${output}\n`);
} else {
  process.stdout.write(`${output}\n`);
}
