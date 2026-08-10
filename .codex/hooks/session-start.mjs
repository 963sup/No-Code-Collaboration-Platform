import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const hookDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(hookDirectory, '..', '..');
const hasLockfile = existsSync(resolve(repositoryRoot, 'pnpm-lock.yaml'));
const hasDependencies = existsSync(resolve(repositoryRoot, 'node_modules'));
const hasTurbo = existsSync(resolve(repositoryRoot, 'turbo.json'));

const runGit = (args) => {
  const result = spawnSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    timeout: 1500,
    windowsHide: true
  });
  return result.status === 0 ? result.stdout.trim() : '';
};

const collectWorkspacePackages = () => {
  const packages = [];
  for (const parent of ['apps', 'packages']) {
    const parentPath = resolve(repositoryRoot, parent);
    if (!existsSync(parentPath)) continue;
    for (const entry of readdirSync(parentPath, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const relativePath = `${parent}/${entry.name}`;
      const manifestPath = resolve(repositoryRoot, relativePath, 'package.json');
      if (!existsSync(manifestPath)) continue;
      try {
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
        packages.push({ name: manifest.name ?? relativePath, path: relativePath });
      } catch {
        packages.push({ name: relativePath, path: relativePath });
      }
    }
  }
  return packages.toSorted((left, right) => left.path.localeCompare(right.path)).slice(0, 12);
};

const workspacePackages = collectWorkspacePackages();
const packageSummary = workspacePackages.length
  ? workspacePackages.map(({ name, path }) => `${name} [${path}]`).join(', ')
  : 'none';
const branch = runGit(['branch', '--show-current']) || 'detached-or-unknown';
const status = runGit(['status', '--porcelain=v1', '--untracked-files=normal']);
const changedPaths = status ? status.split(/\r?\n/u).length : 0;

const context = [
  'Read the applicable AGENTS.md chain before editing; nearer scoped instructions override broader guidance.',
  'The project root is anchored by pnpm-workspace.yaml, turbo.json, and .git, including when Codex starts inside a package.',
  `Workspace packages (${workspacePackages.length}): ${packageSummary}.`,
  hasTurbo
    ? 'Turbo is present; package manifests own dependency edges and turbo.json owns task relationships. Use the workspace-impact-analysis skill before cross-package changes.'
    : 'Turbo is absent; do not claim workspace task-graph verification.',
  hasLockfile
    ? 'pnpm-lock.yaml is present; preserve it as dependency-resolution evidence.'
    : 'pnpm-lock.yaml is absent; do not claim deterministic dependency installation until pnpm install creates it.',
  hasDependencies
    ? 'node_modules is present; package-based checks may be available.'
    : 'node_modules is absent; do not claim package-based verification ran.',
  `Git branch: ${branch}; changed paths: ${changedPaths}.`,
  'Reference context: use OpenAI Developer Docs for OpenAI/Codex, Context7 for version-sensitive dependencies, and Supabase Docs for official Supabase behavior. The committed Supabase MCP is documentation-only; project-linked access remains machine-local.',
  'Use pnpm codex:check for Codex contracts, pnpm verify:fast after normal changes, and the narrowest package or domain-specific check that can falsify the change.'
].join(' ');

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: context
    }
  })
);
