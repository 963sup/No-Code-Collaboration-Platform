import { existsSync, readFileSync, readdirSync } from 'node:fs';
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

function forbidMatch(path, content, pattern, message) {
  if (pattern.test(content)) failures.push(`${path}: ${message}`);
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
requireMatch(
  packagePath,
  packageJson,
  /"supabase:reset"\s*:\s*"supabase db reset --local"/u,
  'Supabase reset must explicitly target the local database'
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

const workflowDirectory = resolve(root, '.github/workflows');
const workflowPaths = existsSync(workflowDirectory)
  ? readdirSync(workflowDirectory)
      .filter((name) => /\.ya?ml$/u.test(name))
      .map((name) => `.github/workflows/${name}`)
  : [];

const localOnlySurfaces = new Map([
  [packagePath, packageJson],
  ...workflowPaths.map((path) => [path, read(path)])
]);

const remoteOperationPatterns = [
  [/\bsupabase\s+link\b/u, 'ordinary scripts may not link a remote Supabase project'],
  [/\bsupabase\s+db\s+push\b/u, 'ordinary scripts may not push to a remote database'],
  [/\bsupabase\s+db\s+pull\b/u, 'ordinary scripts may not pull from a remote database'],
  [
    /\bsupabase\s+db\s+reset\b[^\n"']*--linked\b/u,
    'ordinary scripts may not reset a linked database'
  ],
  [/\bsupabase\s+functions\s+deploy\b/u, 'ordinary scripts may not deploy Edge Functions'],
  [/\bsupabase\s+secrets\s+set\b/u, 'ordinary scripts may not mutate remote secrets'],
  [/--project-ref\b/u, 'ordinary scripts may not select a remote Supabase project']
];

const remoteCredentialPatterns = [
  [/\bSUPABASE_ACCESS_TOKEN\b/u, 'remote Supabase access token identifier is forbidden'],
  [/\bSUPABASE_PROJECT_(?:ID|REF)\b/u, 'remote Supabase project identifier is forbidden'],
  [/\bSUPABASE_DB_PASSWORD\b/u, 'remote Supabase database password identifier is forbidden']
];

for (const [path, content] of localOnlySurfaces) {
  for (const [pattern, message] of [...remoteOperationPatterns, ...remoteCredentialPatterns]) {
    forbidMatch(path, content, pattern, message);
  }
}

const rootReadmePath = 'README.md';
const rootReadme = read(rootReadmePath);
requireMatch(
  rootReadmePath,
  rootReadme,
  /No Supabase Cloud project is provisioned/i,
  'local-only database provisioning status is missing'
);

const runbookPath = 'docs/operations/RUNBOOK.md';
const runbook = read(runbookPath);
for (const [pattern, message] of [
  [/No Supabase Cloud project is provisioned/i, 'Cloud provisioning status is missing'],
  [
    /migration ledger.*prove.*applied/is,
    'environment-specific applied migration evidence is missing'
  ],
  [
    /Persistent database acceptance and application gate/i,
    'persistent database acceptance/application gate is missing'
  ],
  [
    /provider resource.*accepted persistent|hosted provider resource.*accepted environment/is,
    'provider-resource/accepted-environment distinction is missing'
  ]
]) {
  requireMatch(runbookPath, runbook, pattern, message);
}

const result = {
  ok: failures.length === 0,
  environment: Boolean(environment.trim()),
  reviewRules: 3,
  workflowActions: [...workflow.matchAll(/^\s*uses:/gmu)].length,
  workflowFiles: workflowPaths.length,
  remoteOperationPatterns: remoteOperationPatterns.length,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
