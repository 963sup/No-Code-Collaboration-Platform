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

const repositoryRoute = 'apps/web/src/app/(repository)/[ownerSlug]/[repositorySlug]';
const repositoryPagesRoute = `${repositoryRoute}/pages`;
const requiredRepositoryFiles = [
  `${repositoryRoute}/layout.tsx`,
  `${repositoryRoute}/page.tsx`,
  `${repositoryRoute}/_components/repository-navigation.tsx`,
  `${repositoryRoute}/_components/repository-shell.tsx`,
  `${repositoryRoute}/_queries/get-accessible-repository-route.ts`,
  `${repositoryPagesRoute}/page.tsx`,
  `${repositoryPagesRoute}/[pageId]/page.tsx`,
  `${repositoryPagesRoute}/actions.ts`,
  `${repositoryRoute}/activity/page.tsx`
];

for (const path of requiredRepositoryFiles) {
  if (!existsSync(resolve(root, path))) {
    failures.push(`${path}: canonical Owner/Repository delivery contract is missing`);
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
    failures.push(
      `${repositoryShellPath}: Owner label must not pretend /app is the Owner destination`
    );
  }
}

const repositoryNavigationPath = `${repositoryRoute}/_components/repository-navigation.tsx`;
if (existsSync(resolve(root, repositoryNavigationPath))) {
  const content = readFileSync(resolve(root, repositoryNavigationPath), 'utf8');
  for (const label of ['Overview', 'Pages', 'Activity']) {
    if (!content.includes(label)) {
      failures.push(`${repositoryNavigationPath}: ${label} Repository navigation is missing`);
    }
  }
  for (const symbol of [
    'repositoryPath',
    'repositoryPagesPath',
    'repositoryActivityPath',
    'usePathname'
  ]) {
    if (!content.includes(symbol)) {
      failures.push(`${repositoryNavigationPath}: ${symbol} navigation boundary is missing`);
    }
  }
}

const repositoryPagesPath = `${repositoryPagesRoute}/page.tsx`;
if (existsSync(resolve(root, repositoryPagesPath))) {
  const content = readFileSync(resolve(root, repositoryPagesPath), 'utf8');
  for (const symbol of ['requireAccessibleRepositoryRoute', 'ListAccessiblePages', 'createPage']) {
    if (!content.includes(symbol)) {
      failures.push(`${repositoryPagesPath}: ${symbol} Page boundary is missing`);
    }
  }
  if (content.includes('RepositoryShell')) {
    failures.push(`${repositoryPagesPath}: shared Repository shell belongs in layout.tsx`);
  }
  if (content.includes('/resources')) {
    failures.push(`${repositoryPagesPath}: Resource abstraction must not leak into product URLs`);
  }
}

const pageDetailPath = `${repositoryPagesRoute}/[pageId]/page.tsx`;
if (existsSync(resolve(root, pageDetailPath))) {
  const content = readFileSync(resolve(root, pageDetailPath), 'utf8');
  for (const symbol of ['requireAccessibleRepositoryRoute', 'GetAccessiblePage', 'updatePage']) {
    if (!content.includes(symbol)) {
      failures.push(`${pageDetailPath}: ${symbol} Page boundary is missing`);
    }
  }
  if (content.includes('RepositoryShell')) {
    failures.push(`${pageDetailPath}: shared Repository shell belongs in layout.tsx`);
  }
}

const pageActionsPath = `${repositoryPagesRoute}/actions.ts`;
if (existsSync(resolve(root, pageActionsPath))) {
  const content = readFileSync(resolve(root, pageActionsPath), 'utf8');
  for (const symbol of ['CreatePage', 'UpdatePage', 'repositoryAccessReader', 'ownerSlug']) {
    if (!content.includes(symbol)) {
      failures.push(`${pageActionsPath}: ${symbol} owner-neutral command boundary is missing`);
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
  if (content.includes('RepositoryShell')) {
    failures.push(`${repositoryActivityPath}: shared Repository shell belongs in layout.tsx`);
  }
}

const appHomePath = 'apps/web/src/app/(app)/app/page.tsx';
if (existsSync(resolve(root, appHomePath))) {
  const content = readFileSync(resolve(root, appHomePath), 'utf8');
  for (const symbol of ['ListAccessibleRepositoryRoutes', 'repositoryPath']) {
    if (!content.includes(symbol)) {
      failures.push(`${appHomePath}: ${symbol} canonical Repository navigation is missing`);
    }
  }
  if (content.includes('/app/repositories/${repository.id}')) {
    failures.push(`${appHomePath}: stable ID must not remain primary human navigation URL`);
  }
}

const organizationOnlyRepositoryRoute =
  'apps/web/src/app/(app)/app/[organizationSlug]/[repositorySlug]';
if (existsSync(resolve(root, organizationOnlyRepositoryRoute))) {
  failures.push(
    `${organizationOnlyRepositoryRoute}: obsolete Organization-only Repository UI must not coexist with canonical Owner routing`
  );
}

const stableIdCompatibilityRoute = 'apps/web/src/app/(app)/app/repositories/[repositoryId]';
const stableIdCompatibilityPath = `${stableIdCompatibilityRoute}/[[...legacyPath]]/page.tsx`;
if (!existsSync(resolve(root, stableIdCompatibilityPath))) {
  failures.push(
    `${stableIdCompatibilityPath}: stable-ID Repository compatibility redirect is missing`
  );
} else {
  const content = readFileSync(resolve(root, stableIdCompatibilityPath), 'utf8');
  for (const symbol of [
    'GetAccessibleRepositoryRouteById',
    'repositoryPath',
    'repositoryPagesPath',
    'repositoryPagePath',
    'redirect',
    'notFound'
  ]) {
    if (!content.includes(symbol)) {
      failures.push(`${stableIdCompatibilityPath}: ${symbol} compatibility boundary is missing`);
    }
  }
}

const compatibilitySourceFiles = collectSourceFiles(stableIdCompatibilityRoute);
if (
  compatibilitySourceFiles.length !== 1 ||
  compatibilitySourceFiles[0] !== stableIdCompatibilityPath
) {
  failures.push(
    `${stableIdCompatibilityRoute}: compatibility namespace must contain only the access-aware redirect route`
  );
}

const duplicateAuthConfirmPath = 'apps/web/src/app/auth/confirm/route.ts';
if (existsSync(resolve(root, duplicateAuthConfirmPath))) {
  failures.push(`${duplicateAuthConfirmPath}: duplicate auth confirmation handler must be removed`);
}

const canonicalAuthConfirmPath = 'apps/web/src/app/(auth)/auth/confirm/route.ts';
if (!existsSync(resolve(root, canonicalAuthConfirmPath))) {
  failures.push(`${canonicalAuthConfirmPath}: canonical auth confirmation handler is missing`);
}

const obsoleteAuthAliasPath = 'apps/web/src/auth/auth-navigation.ts';
if (existsSync(resolve(root, obsoleteAuthAliasPath))) {
  failures.push(`${obsoleteAuthAliasPath}: obsolete auth routing alias must be removed`);
}

const obsoleteRepositoryRouteReader =
  'packages/infrastructure/supabase/src/repositories/supabase-repository-route-reader.ts';
if (existsSync(resolve(root, obsoleteRepositoryRouteReader))) {
  failures.push(
    `${obsoleteRepositoryRouteReader}: obsolete Repository route reader alias must be removed`
  );
}

const result = {
  ok: failures.length === 0,
  scopes: Object.keys(packageRules).length,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
