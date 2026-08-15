import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';

const root = process.cwd();
const domainRoot = '@no-code-collaboration-platform/domain';
const scopes = ['packages/application/src', 'packages/infrastructure/supabase/src'];
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

function importSpecifiers(content) {
  return [...content.matchAll(/(?:from\s+|import\s*\()(['"])([^'"]+)\1/gu)].map(
    (match) => match[2]
  );
}

for (const scope of scopes) {
  for (const path of collectTypeScriptFiles(scope)) {
    if (path.includes('/generated/')) continue;
    const content = readFileSync(resolve(root, path), 'utf8');
    for (const specifier of importSpecifiers(content)) {
      if (specifier === domainRoot) {
        failures.push(
          `${path}: import a semantic Domain subpath instead of the root barrel (${domainRoot}/access|activity|organization|repository|resource)`
        );
      }
    }
  }
}

process.stdout.write(`${JSON.stringify({ ok: failures.length === 0, scopes, failures })}\n`);
if (failures.length > 0) process.exitCode = 1;
