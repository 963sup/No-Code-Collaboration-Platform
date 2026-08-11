import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const failures = [];

function read(path) {
  try {
    return readFileSync(resolve(root, path), 'utf8');
  } catch (error) {
    failures.push(`${path}: ${error.message}`);
    return '';
  }
}

function requireMatch(path, content, pattern, message) {
  if (!pattern.test(content)) failures.push(`${path}: ${message}`);
}

const environmentPath = '.codex/environments/environment.toml';
const environment = read(environmentPath);
for (const [pattern, message] of [
  [/^version = 1$/m, 'environment version is not pinned'],
  [/^\[setup\]$/m, 'worktree setup is missing'],
  [/pnpm install --frozen-lockfile/, 'deterministic install is missing'],
  [/pnpm codex:check/, 'Codex contract is not checked during setup'],
  [/name = "Run web"/, 'web action is missing'],
  [/command = "pnpm dev"/, 'web action command is missing'],
  [/name = "Verify worktree"/, 'worktree verification action is missing'],
  [/command = "pnpm verify:fast"/, 'worktree verification command is missing'],
  [/name = "Verify full"/, 'full verification action is missing'],
  [/command = "pnpm verify:full"/, 'full verification command is missing']
]) {
  requireMatch(environmentPath, environment, pattern, message);
}

const packagePath = 'package.json';
const packageJson = read(packagePath);
requireMatch(
  packagePath,
  packageJson,
  /"lint"\s*:\s*"[^"]*oxlint[^"]*\.codex\/hooks[^"]*"/u,
  'Codex hook scripts are outside the root lint boundary'
);

const agentsPath = 'AGENTS.md';
const agents = read(agentsPath);
for (const [pattern, message] of [
  [/^## Code Review Rules$/m, 'Code Review Rules section is missing'],
  [/Product semantic drift/, 'product-semantic review rule is missing'],
  [/Architecture truth-boundary violations/, 'truth-boundary review rule is missing'],
  [/Authorization enforcement bypass/, 'authorization review rule is missing']
]) {
  requireMatch(agentsPath, agents, pattern, message);
}

const workflowPath = '.github/workflows/verify.yml';
const workflow = read(workflowPath);
for (const [pattern, message] of [
  [/^  guardrails:$/m, 'parallel workflow guardrail job is missing'],
  [/actionlint/, 'actionlint validation is missing'],
  [/zizmorcore\/zizmor-action@[0-9a-f]{40}/, 'zizmor action is missing or not pinned'],
  [/persist-credentials: false/, 'checkout credentials are not disabled']
]) {
  requireMatch(workflowPath, workflow, pattern, message);
}

for (const match of workflow.matchAll(/^\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/gmu)) {
  const action = match[1];
  const separator = action.lastIndexOf('@');
  const reference = separator >= 0 ? action.slice(separator + 1) : '';
  if (!/^[0-9a-f]{40}$/u.test(reference)) {
    failures.push(`${workflowPath}: action must be pinned to a full commit SHA: ${action}`);
  }
}

for (const jobName of ['repository', 'database']) {
  const start = workflow.indexOf(`  ${jobName}:`);
  if (start < 0) {
    failures.push(`${workflowPath}: ${jobName} job is missing`);
    continue;
  }
  const remainder = workflow.slice(start + 2);
  const nextJob = remainder.search(/^  [a-z][a-z0-9_-]*:$/m);
  const section = nextJob < 0 ? remainder : remainder.slice(0, nextJob);
  if (/^\s+needs:\s*guardrails\s*$/mu.test(section)) {
    failures.push(`${workflowPath}: ${jobName} must run in parallel with guardrails`);
  }
}

const result = {
  ok: failures.length === 0,
  environment: Boolean(environment.trim()),
  reviewRules: 3,
  workflowActions: [...workflow.matchAll(/^\s*uses:/gmu)].length,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
