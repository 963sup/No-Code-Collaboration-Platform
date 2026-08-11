import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';

const root = process.cwd();
const failures = [];
const packagePrefix = '@no-code-collaboration-platform/';

const packageRules = {
  'packages/domain': {
    internal: new Set(),
    forbidden: ['next', 'react', '@supabase/', `${packagePrefix}application`, `${packagePrefix}supabase`, `${packagePrefix}ui`]
  },
  'packages/application': {
    internal: new Set([`${packagePrefix}domain`]),
    forbidden: ['next', 'react', '@supabase/', `${packagePrefix}supabase`, `${packagePrefix}ui`]
  },
  'packages/supabase': {
    internal: new Set([`${packagePrefix}application`, `${packagePrefix}domain`]),
    forbidden: ['next', 'react', `${packagePrefix}ui`]
  },
  'packages/ui': {
    internal: new Set(),
    forbidden: ['next', '@supabase/', `${packagePrefix}application`, `${packagePrefix}domain`, `${packagePrefix}supabase`]
  },
  'apps/web': {
    internal: new Set([
      `${packagePrefix}application`,
      `${packagePrefix}domain`,
      `${packagePrefix}supabase`,
      `${packagePrefix}ui`
    ]),
    forbidden: []
  }
};

function collectSourceFiles(directory) {
  const absolute = resolve(root, directory);
  if (!existsSync(absolute)) return [];

  const files = [];
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    const relative = `${directory}/${entry.name}`;
    if (entry.isDirectory()) files.push(...collectSourceFiles(relative));
    else if (['.ts', '.tsx'].includes(extname(entry.name))) files.push(relative);
  }
  return files;
}

function importSpecifiers(content) {
  const specifiers = [];
  const pattern = /(?:from\s+|import\s*\()(['"])([^'"]+)\1/gu;
  for (const match of content.matchAll(pattern)) specifiers.push(match[2]);
  return specifiers;
}

for (const [scope, rules] of Object.entries(packageRules)) {
  const manifestPath = resolve(root, scope, 'package.json');
  if (!existsSync(manifestPath)) {
    failures.push(`${scope}: package.json is missing`);
    continue;
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const declared = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
    ...manifest.peerDependencies
  };

  for (const dependency of Object.keys(declared)) {
    if (dependency.startsWith(packagePrefix) && !rules.internal.has(dependency)) {
      failures.push(`${scope}: forbidden workspace dependency ${dependency}`);
    }
  }

  for (const path of collectSourceFiles(scope)) {
    if (path.includes('/generated/')) continue;
    const content = readFileSync(resolve(root, path), 'utf8');
    for (const specifier of importSpecifiers(content)) {
      if (rules.forbidden.some((prefix) => specifier === prefix || specifier.startsWith(prefix))) {
        failures.push(`${path}: forbidden import ${specifier}`);
      }
      if (
        scope !== 'packages/supabase' &&
        (specifier.includes('database-types') || specifier.includes('generated/database.types'))
      ) {
        failures.push(`${path}: generated database types may only be imported by packages/supabase`);
      }
    }
  }
}

const result = {
  ok: failures.length === 0,
  scopes: Object.keys(packageRules).length,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
