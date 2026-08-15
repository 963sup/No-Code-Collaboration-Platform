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

const authenticatedRoot = 'apps/web/src/app/(authenticated)';
const ownerRoute = 'apps/web/src/app/(owner)/[ownerSlug]';
const repositoryRoute = `${ownerRoute}/[repositorySlug]`;
const repositoryWikiRoute = `${repositoryRoute}/wiki`;
const surfaceDefinitionsPath = 'apps/web/src/navigation/surface-definitions.ts';

const requiredWebFiles = [
  `${authenticatedRoot}/dashboard/page.tsx`,
  `${authenticatedRoot}/repos/page.tsx`,
  `${authenticatedRoot}/issues/page.tsx`,
  `${authenticatedRoot}/issues/assigned/page.tsx`,
  `${authenticatedRoot}/orgs/[organizationSlug]/dashboard/page.tsx`,
  `${authenticatedRoot}/orgs/[organizationSlug]/people/page.tsx`,
  `${authenticatedRoot}/orgs/[organizationSlug]/teams/page.tsx`,
  `${authenticatedRoot}/organizations/[organizationSlug]/settings/profile/page.tsx`,
  `${ownerRoute}/page.tsx`,
  `${repositoryRoute}/layout.tsx`,
  `${repositoryRoute}/page.tsx`,
  `${repositoryRoute}/_components/repository-navigation.tsx`,
  `${repositoryRoute}/_components/repository-shell.tsx`,
  `${repositoryRoute}/_queries/get-accessible-repository-route.ts`,
  `${repositoryWikiRoute}/page.tsx`,
  `${repositoryWikiRoute}/[pageId]/page.tsx`,
  `${repositoryWikiRoute}/actions.ts`,
  `${repositoryRoute}/activity/page.tsx`,
  surfaceDefinitionsPath,
  'apps/web/src/routing/auth-routes.ts',
  'apps/web/src/routing/owner-routes.ts',
  'apps/web/src/routing/repository-routes.ts'
];

for (const path of requiredWebFiles) {
  if (!existsSync(resolve(root, path))) failures.push(`${path}: canonical Web contract is missing`);
}

for (const obsoletePath of [
  'apps/web/src/app/(app)',
  'apps/web/src/app/(repository)',
  `${authenticatedRoot}/app`,
  `${authenticatedRoot}/repositories`,
  `${repositoryRoute}/pages`,
  'apps/web/src/routing/surface-definitions.ts'
]) {
  if (existsSync(resolve(root, obsoletePath))) {
    failures.push(`${obsoletePath}: superseded URL/delivery vocabulary must not coexist`);
  }
}

const ownerProfilePath = `${ownerRoute}/page.tsx`;
if (existsSync(resolve(root, ownerProfilePath))) {
  const content = readFileSync(resolve(root, ownerProfilePath), 'utf8');
  for (const symbol of [
    'GetOwnerProfile',
    'ListOwnerRepositoryRoutes',
    'normalizeOwnerProfileTab',
    'profile.kind',
    'ownerTabPath'
  ]) {
    if (!content.includes(symbol)) {
      failures.push(`${ownerProfilePath}: ${symbol} shared Owner namespace boundary is missing`);
    }
  }
}

const repositoryLayoutPath = `${repositoryRoute}/layout.tsx`;
if (existsSync(resolve(root, repositoryLayoutPath))) {
  const content = readFileSync(resolve(root, repositoryLayoutPath), 'utf8');
  for (const symbol of ['RepositoryShell', 'requireAccessibleRepositoryRoute']) {
    if (!content.includes(symbol)) {
      failures.push(`${repositoryLayoutPath}: ${symbol} canonical boundary is missing`);
    }
  }
}

const repositoryShellPath = `${repositoryRoute}/_components/repository-shell.tsx`;
if (existsSync(resolve(root, repositoryShellPath))) {
  const content = readFileSync(resolve(root, repositoryShellPath), 'utf8');
  for (const symbol of ['RepositoryNavigation', 'SiteHeader', 'repositoryPath']) {
    if (!content.includes(symbol)) {
      failures.push(`${repositoryShellPath}: ${symbol} shell composition is missing`);
    }
  }
  if (content.includes("href='/app'")) {
    failures.push(`${repositoryShellPath}: obsolete /app destination must not return`);
  }
}

const repositoryNavigationPath = `${repositoryRoute}/_components/repository-navigation.tsx`;
if (
  existsSync(resolve(root, repositoryNavigationPath)) &&
  existsSync(resolve(root, surfaceDefinitionsPath))
) {
  const content = `${readFileSync(resolve(root, repositoryNavigationPath), 'utf8')}\n${readFileSync(
    resolve(root, surfaceDefinitionsPath),
    'utf8'
  )}`;
  for (const label of ['Overview', 'Wiki', 'Activity']) {
    if (!content.includes(label)) {
      failures.push(`${repositoryNavigationPath}: ${label} Repository navigation is missing`);
    }
  }
  for (const symbol of [
    'repositoryPath',
    'repositoryWikiPath',
    'repositoryActivityPath',
    'repositorySurfaces',
    'usePathname'
  ]) {
    if (!content.includes(symbol)) {
      failures.push(`${repositoryNavigationPath}: ${symbol} navigation boundary is missing`);
    }
  }
}

const repositoryWikiPath = `${repositoryWikiRoute}/page.tsx`;
if (existsSync(resolve(root, repositoryWikiPath))) {
  const content = readFileSync(resolve(root, repositoryWikiPath), 'utf8');
  for (const symbol of ['requireAccessibleRepositoryRoute', 'ListAccessiblePages', 'createPage']) {
    if (!content.includes(symbol)) {
      failures.push(`${repositoryWikiPath}: ${symbol} Page/Knowledge boundary is missing`);
    }
  }
  if (content.includes('/resources') || content.includes('/pages')) {
    failures.push(
      `${repositoryWikiPath}: Domain vocabulary must not leak into the GitHub-aligned Wiki URL`
    );
  }
}

const pageDetailPath = `${repositoryWikiRoute}/[pageId]/page.tsx`;
if (existsSync(resolve(root, pageDetailPath))) {
  const content = readFileSync(resolve(root, pageDetailPath), 'utf8');
  for (const symbol of ['requireAccessibleRepositoryRoute', 'GetAccessiblePage', 'updatePage']) {
    if (!content.includes(symbol)) {
      failures.push(`${pageDetailPath}: ${symbol} Page boundary is missing`);
    }
  }
}

const pageActionsPath = `${repositoryWikiRoute}/actions.ts`;
if (existsSync(resolve(root, pageActionsPath))) {
  const content = readFileSync(resolve(root, pageActionsPath), 'utf8');
  for (const symbol of [
    'CreatePage',
    'UpdatePage',
    'repositoryAccessReader',
    'repositoryWikiPath'
  ]) {
    if (!content.includes(symbol)) {
      failures.push(`${pageActionsPath}: ${symbol} owner-neutral Wiki command boundary is missing`);
    }
  }
  if (content.includes('organizationSlug')) {
    failures.push(`${pageActionsPath}: Organization-only Repository route input must be removed`);
  }
}

const repositoryActivityPath = `${repositoryRoute}/activity/page.tsx`;
if (existsSync(resolve(root, repositoryActivityPath))) {
  const content = readFileSync(resolve(root, repositoryActivityPath), 'utf8');
  if (!content.includes('ListRepositoryActivity')) {
    failures.push(`${repositoryActivityPath}: Activity projection query is missing`);
  }
}

const dashboardPath = `${authenticatedRoot}/dashboard/page.tsx`;
if (existsSync(resolve(root, dashboardPath))) {
  const content = readFileSync(resolve(root, dashboardPath), 'utf8');
  for (const symbol of ['ListAccessibleRepositoryRoutes', 'repositoryPath']) {
    if (!content.includes(symbol)) {
      failures.push(`${dashboardPath}: ${symbol} canonical Repository discovery is missing`);
    }
  }
}

const duplicateAuthConfirmPath = 'apps/web/src/app/auth/confirm/route.ts';
if (existsSync(resolve(root, duplicateAuthConfirmPath))) {
  failures.push(`${duplicateAuthConfirmPath}: duplicate auth confirmation handler must be removed`);
}

const canonicalAuthConfirmPath = 'apps/web/src/app/(auth)/auth/confirm/route.ts';
if (!existsSync(resolve(root, canonicalAuthConfirmPath))) {
  failures.push(`${canonicalAuthConfirmPath}: canonical auth confirmation handler is missing`);
}

for (const obsoletePath of [
  'apps/web/src/auth/auth-navigation.ts',
  'packages/infrastructure/supabase/src/repositories/supabase-repository-route-reader.ts'
]) {
  if (existsSync(resolve(root, obsoletePath))) {
    failures.push(`${obsoletePath}: obsolete compatibility alias must be removed`);
  }
}

const result = {
  ok: failures.length === 0,
  scopes: Object.keys(packageRules).length,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
