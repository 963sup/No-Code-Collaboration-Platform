import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';

const root = process.cwd();
const failures = [];
const packagePrefix = '@no-code-collaboration-platform/';
const supabasePackage = `${packagePrefix}supabase`;
const supabaseScope = 'packages/infrastructure/supabase';

const packageRules = {
  'packages/domain': {
    internal: new Set(),
    forbidden: [
      'next',
      'react',
      '@supabase/',
      `${packagePrefix}application`,
      supabasePackage,
      `${packagePrefix}ui`
    ]
  },
  'packages/application': {
    internal: new Set([`${packagePrefix}domain`]),
    forbidden: ['next', 'react', '@supabase/', supabasePackage, `${packagePrefix}ui`]
  },
  [supabaseScope]: {
    internal: new Set([`${packagePrefix}application`, `${packagePrefix}domain`]),
    forbidden: ['next', 'react', `${packagePrefix}ui`]
  },
  'packages/ui': {
    internal: new Set(),
    forbidden: [
      'next',
      '@supabase/',
      `${packagePrefix}application`,
      `${packagePrefix}domain`,
      supabasePackage
    ]
  },
  'apps/web': {
    internal: new Set([`${packagePrefix}application`, supabasePackage, `${packagePrefix}ui`]),
    forbidden: ['@supabase/', `${packagePrefix}domain`]
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
        scope !== supabaseScope &&
        (specifier.includes('database-types') || specifier.includes('generated/database.types'))
      ) {
        failures.push(`${path}: generated database types may only be imported by ${supabaseScope}`);
      }
      if (
        scope === 'apps/web' &&
        specifier === supabasePackage &&
        !path.startsWith('apps/web/src/composition/')
      ) {
        failures.push(`${path}: Supabase adapters may only be wired in apps/web/src/composition`);
      }
    }
  }
}

const repositoryWorkspaceRoute = 'apps/web/src/app/(app)/app/[organizationSlug]/[repositorySlug]';
const repositoryPagesRoute = `${repositoryWorkspaceRoute}/@workspace/pages`;
const persistentParallelRouteDefaults = [
  `${repositoryWorkspaceRoute}/default.tsx`,
  `${repositoryWorkspaceRoute}/@navigation/default.tsx`,
  `${repositoryWorkspaceRoute}/@workspace/default.tsx`,
  `${repositoryWorkspaceRoute}/@context/default.tsx`,
  `${repositoryWorkspaceRoute}/@activity/default.tsx`
];
const requiredParallelRouteFiles = [
  `${repositoryWorkspaceRoute}/layout.tsx`,
  `${repositoryPagesRoute}/page.tsx`,
  `${repositoryPagesRoute}/[pageId]/page.tsx`,
  `${repositoryPagesRoute}/actions.ts`,
  `${repositoryWorkspaceRoute}/@workspace/activity/page.tsx`,
  ...persistentParallelRouteDefaults
];

for (const path of requiredParallelRouteFiles) {
  if (!existsSync(resolve(root, path))) {
    failures.push(`${path}: required Repository Parallel Route contract is missing`);
  }
}

const repositoryLayoutPath = `${repositoryWorkspaceRoute}/layout.tsx`;
if (existsSync(resolve(root, repositoryLayoutPath))) {
  const content = readFileSync(resolve(root, repositoryLayoutPath), 'utf8');
  for (const slot of ['children', 'navigation', 'workspace', 'context', 'activity']) {
    if (!new RegExp(`\\b${slot}\\b`, 'u').test(content)) {
      failures.push(`${repositoryLayoutPath}: layout does not render the ${slot} slot`);
    }
  }
}

for (const path of persistentParallelRouteDefaults) {
  if (!existsSync(resolve(root, path))) continue;
  const content = readFileSync(resolve(root, path), 'utf8');
  if (!content.trim()) failures.push(`${path}: persistent slot default is empty`);
  if (/return\s+null/u.test(content)) {
    failures.push(`${path}: persistent slot default may not silently return null`);
  }
}

const repositoryNavigationPath = `${repositoryWorkspaceRoute}/@navigation/page.tsx`;
if (existsSync(resolve(root, repositoryNavigationPath))) {
  const content = readFileSync(resolve(root, repositoryNavigationPath), 'utf8');
  for (const symbol of ['repositoryPagesPath', 'repositoryActivityPath']) {
    if (!content.includes(symbol)) {
      failures.push(`${repositoryNavigationPath}: ${symbol} semantic route link is missing`);
    }
  }
  if (content.includes('/resources')) {
    failures.push(
      `${repositoryNavigationPath}: Resource abstraction must not leak into navigation URLs`
    );
  }
}

const repositoryPagesPath = `${repositoryPagesRoute}/page.tsx`;
if (existsSync(resolve(root, repositoryPagesPath))) {
  const content = readFileSync(resolve(root, repositoryPagesPath), 'utf8');
  if (!content.includes('requireAccessibleRepositoryRoute')) {
    failures.push(
      `${repositoryPagesPath}: nested workspace route must use the access-aware Repository route projection`
    );
  }
  if (!content.includes('ListAccessiblePages')) {
    failures.push(`${repositoryPagesPath}: Page Resource read model is missing`);
  }
  if (content.includes('/resources')) {
    failures.push(`${repositoryPagesPath}: concrete Page surface must not emit Resource URLs`);
  }
}

const pageDetailPath = `${repositoryPagesRoute}/[pageId]/page.tsx`;
if (existsSync(resolve(root, pageDetailPath))) {
  const content = readFileSync(resolve(root, pageDetailPath), 'utf8');
  if (!content.includes('requireAccessibleRepositoryRoute')) {
    failures.push(`${pageDetailPath}: Page route must resolve its Repository namespace`);
  }
  if (!content.includes('GetAccessiblePage')) {
    failures.push(`${pageDetailPath}: Page route must use the authorization-aware Page query`);
  }
  if (!content.includes('updatePage')) {
    failures.push(`${pageDetailPath}: Page route must submit through the Page update action`);
  }
}

const pageActionsPath = `${repositoryPagesRoute}/actions.ts`;
if (existsSync(resolve(root, pageActionsPath))) {
  const content = readFileSync(resolve(root, pageActionsPath), 'utf8');
  for (const symbol of ['CreatePage', 'UpdatePage', 'revalidatePath']) {
    if (!content.includes(symbol)) {
      failures.push(`${pageActionsPath}: ${symbol} boundary is missing`);
    }
  }
}

for (const activityPath of [
  `${repositoryWorkspaceRoute}/@activity/page.tsx`,
  `${repositoryWorkspaceRoute}/@workspace/activity/page.tsx`
]) {
  if (!existsSync(resolve(root, activityPath))) continue;
  const content = readFileSync(resolve(root, activityPath), 'utf8');
  if (!content.includes('ListRepositoryActivity')) {
    failures.push(`${activityPath}: Activity must project immutable Repository facts`);
  }
}

const appHomePath = 'apps/web/src/app/(app)/app/page.tsx';
if (existsSync(resolve(root, appHomePath))) {
  const content = readFileSync(resolve(root, appHomePath), 'utf8');
  if (!content.includes('ListAccessibleRepositoryRoutes')) {
    failures.push(`${appHomePath}: Repository list must project canonical semantic routes`);
  }
  if (content.includes('/app/repositories/${repository.id}')) {
    failures.push(`${appHomePath}: Repository UUID must not remain the primary navigation URL`);
  }
}

const legacyRepositoryRoute = 'apps/web/src/app/(app)/app/repositories/[repositoryId]';
const legacyCompatibilityPath = `${legacyRepositoryRoute}/[[...legacyPath]]/page.tsx`;
if (!existsSync(resolve(root, legacyCompatibilityPath))) {
  failures.push(
    `${legacyCompatibilityPath}: legacy Repository namespace must be one access-aware compatibility redirect`
  );
} else {
  const content = readFileSync(resolve(root, legacyCompatibilityPath), 'utf8');
  for (const symbol of [
    'GetAccessibleRepositoryRouteById',
    'repositoryPath',
    'repositoryPagesPath',
    'repositoryPagePath',
    'redirect',
    'notFound'
  ]) {
    if (!content.includes(symbol)) {
      failures.push(`${legacyCompatibilityPath}: ${symbol} compatibility boundary is missing`);
    }
  }
}

const legacySourceFiles = collectSourceFiles(legacyRepositoryRoute);
if (legacySourceFiles.length !== 1 || legacySourceFiles[0] !== legacyCompatibilityPath) {
  failures.push(
    `${legacyRepositoryRoute}: legacy Repository namespace must contain only the compatibility route`
  );
}

for (const forbidden of [
  'AGENTS.md',
  'layout.tsx',
  'default.tsx',
  'not-found.tsx',
  '_queries',
  '@activity',
  '@context',
  '@navigation',
  '@workspace'
]) {
  if (existsSync(resolve(root, legacyRepositoryRoute, forbidden))) {
    failures.push(
      `${legacyRepositoryRoute}/${forbidden}: legacy Repository namespace is redirect-only and must not own presentation or query state`
    );
  }
}

const speculativeResourceGridPath = `${repositoryWorkspaceRoute}/_components/repository-resource-kind-grid.tsx`;
if (existsSync(resolve(root, speculativeResourceGridPath))) {
  failures.push(`${speculativeResourceGridPath}: speculative Resource kind grid must be removed`);
}

const result = {
  ok: failures.length === 0,
  scopes: Object.keys(packageRules).length,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
