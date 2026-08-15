import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';

const root = process.cwd();
const supabaseSource = 'packages/infrastructure/supabase/src';
const globalMapperDirectory = `${supabaseSource}/mappers`;
const failures = [];

function collectTypeScriptFiles(directory) {
  const absolute = resolve(root, directory);
  if (!existsSync(absolute)) return [];

  const files = [];
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    const relative = `${directory}/${entry.name}`;
    if (entry.isDirectory()) files.push(...collectTypeScriptFiles(relative));
    else if (['.ts', '.tsx'].includes(extname(entry.name))) files.push(relative);
  }
  return files;
}

if (existsSync(resolve(root, globalMapperDirectory))) {
  failures.push(
    `${globalMapperDirectory}: provider translation must be colocated with the adapter responsibility it serves`
  );
}

for (const path of collectTypeScriptFiles(supabaseSource)) {
  if (path.includes('/generated/')) continue;
  const content = readFileSync(resolve(root, path), 'utf8');
  if (/from\s+['"][^'"]*\/mappers\//u.test(content)) {
    failures.push(`${path}: global mapper imports are forbidden`);
  }
}

process.stdout.write(
  `${JSON.stringify({ ok: failures.length === 0, globalMapperDirectory, failures })}\n`
);
if (failures.length > 0) process.exitCode = 1;
