import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const hookDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(hookDirectory, '..', '..');

const hasLockfile = existsSync(resolve(repositoryRoot, 'pnpm-lock.yaml'));
const hasDependencies = existsSync(resolve(repositoryRoot, 'node_modules'));

const context = [
  'Read the applicable AGENTS.md chain before editing; nearer scoped instructions override broader guidance.',
  hasLockfile
    ? 'pnpm-lock.yaml is present; preserve it as dependency-resolution evidence.'
    : 'pnpm-lock.yaml is absent; do not claim deterministic dependency installation until pnpm install creates it.',
  hasDependencies
    ? 'node_modules is present; package-based checks may be available.'
    : 'node_modules is absent; do not claim package-based verification ran.',
  'Use pnpm codex:check for Codex contracts, pnpm verify:fast after normal code changes, and the narrowest domain-specific test that can falsify the change.'
].join(' ');

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: context
    }
  })
);
