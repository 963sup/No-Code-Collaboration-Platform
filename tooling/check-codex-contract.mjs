import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const failures = [];

const read = (path) => {
  try {
    return readFileSync(resolve(root, path), 'utf8');
  } catch (error) {
    failures.push(`${path}: ${error.message}`);
    return '';
  }
};

const parseJson = (path) => {
  try {
    return JSON.parse(read(path));
  } catch (error) {
    failures.push(`${path}: ${error.message}`);
    return {};
  }
};

const requireText = (path, pattern, message) => {
  const content = read(path);
  if (!pattern.test(content)) failures.push(`${path}: ${message}`);
  return content;
};

const listDirectory = (path, options) => {
  try {
    return readdirSync(resolve(root, path), options);
  } catch (error) {
    failures.push(`${path}: ${error.message}`);
    return [];
  }
};

const config = requireText(
  '.codex/config.toml',
  /^#:schema https:\/\/developers\.openai\.com\/codex\/config-schema\.json/m,
  'missing official Codex schema declaration'
);

for (const [pattern, message] of [
  [/^project_doc_max_bytes = 65536$/m, 'project instruction byte limit is not pinned'],
  [
    /^project_root_markers = \["pnpm-workspace\.yaml", "turbo\.json", "\.git"\]$/m,
    'workspace-aware project root markers are not pinned'
  ],
  [/^web_search = "indexed"$/m, 'bounded indexed web search is not configured'],
  [/^\[features\]$/m, 'features table is missing'],
  [/^hooks = true$/m, 'hooks are not enabled'],
  [/^multi_agent = true$/m, 'multi-agent collaboration is not enabled'],
  [/^\[agents\]$/m, 'agents table is missing'],
  [/^max_concurrent_threads_per_session = 4$/m, 'subagent concurrency is not bounded'],
  [/^\[shell_environment_policy\]$/m, 'shell environment policy is missing'],
  [
    /^ignore_default_excludes = false$/m,
    'automatic KEY, SECRET, and TOKEN environment exclusions are not enabled'
  ]
]) {
  if (!pattern.test(config)) failures.push(`.codex/config.toml: ${message}`);
}

const hooks = parseJson('.codex/hooks.json');
const sessionHandlers = hooks?.hooks?.SessionStart;
if (!Array.isArray(sessionHandlers) || sessionHandlers.length !== 1) {
  failures.push('.codex/hooks.json: expected exactly one SessionStart matcher group');
}

const requiredAgents = [
  'architecture-auditor.toml',
  'change-reviewer.toml',
  'openai-docs-researcher.toml'
];
const agentFiles = listDirectory('.codex/agents')
  .filter((name) => name.endsWith('.toml'))
  .toSorted();
for (const required of requiredAgents) {
  if (!agentFiles.includes(required)) failures.push(`.codex/agents: missing ${required}`);
}
for (const file of agentFiles) {
  const path = `.codex/agents/${file}`;
  const content = read(path);
  for (const [pattern, label] of [
    [/^name = "[a-z0-9_]+"$/m, 'name'],
    [/^description = ".+"$/m, 'description'],
    [/^developer_instructions = """$/m, 'developer_instructions'],
    [/^sandbox_mode = "read-only"$/m, 'read-only sandbox']
  ]) {
    if (!pattern.test(content)) failures.push(`${path}: missing ${label}`);
  }
}

const requiredSkills = [
  'first-principles-architecture',
  'github-product-semantics',
  'verify-change',
  'workspace-impact-analysis'
];
const skillDirectories = listDirectory('.agents/skills', { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .toSorted();
for (const required of requiredSkills) {
  if (!skillDirectories.includes(required)) failures.push(`.agents/skills: missing ${required}`);
}
for (const directory of skillDirectories) {
  const path = `.agents/skills/${directory}/SKILL.md`;
  const content = read(path);
  if (!/^---\nname: [a-z0-9-]+\ndescription: .+\n---\n/m.test(content)) {
    failures.push(`${path}: invalid required skill frontmatter`);
  }
  const metadataPath = `.agents/skills/${directory}/agents/openai.yaml`;
  const metadata = read(metadataPath);
  if (!/^interface:\n  display_name: .+\n  short_description: .+/m.test(metadata)) {
    failures.push(`${metadataPath}: missing desktop interface metadata`);
  }
}

const instructionScopes = [
  'docs/AGENTS.md',
  'docs/architecture/AGENTS.md',
  'docs/domains/AGENTS.md',
  'packages/domain/AGENTS.md',
  'tooling/AGENTS.md'
];
for (const path of instructionScopes) {
  if (!read(path).trim()) failures.push(`${path}: instruction scope is empty`);
}

const workspace = read('pnpm-workspace.yaml');
for (const [pattern, message] of [
  [/^\s*- ['"]apps\/\*['"]$/m, 'apps/* workspace pattern is missing'],
  [/^\s*- ['"]packages\/\*['"]$/m, 'packages/* workspace pattern is missing'],
  [/^disallowWorkspaceCycles: true$/m, 'workspace cycles are not configured to fail'],
  [/^failIfNoMatch: true$/m, 'unmatched workspace filters are not configured to fail']
]) {
  if (!pattern.test(workspace)) failures.push(`pnpm-workspace.yaml: ${message}`);
}
if (/^\s*- ['"]?\.['"]?$/m.test(workspace)) {
  failures.push("pnpm-workspace.yaml: remove redundant '.' because pnpm always includes the workspace root");
}

const turbo = parseJson('turbo.json');
if (!turbo?.tasks?.lint) failures.push('turbo.json: lint task is missing');
if (!turbo?.tasks?.typecheck) failures.push('turbo.json: typecheck task is missing');
if (!Array.isArray(turbo?.globalDependencies) || !turbo.globalDependencies.includes('tsconfig.base.json')) {
  failures.push('turbo.json: tsconfig.base.json is not a global task dependency');
}

const rootPackage = parseJson('package.json');
if (rootPackage?.scripts?.['turbo:graph'] !== 'turbo ls') {
  failures.push('package.json: turbo:graph must remain the bounded workspace discovery entry point');
}
if (!rootPackage?.devDependencies?.turbo) failures.push('package.json: Turbo dependency is missing');

const domainPackage = parseJson('packages/domain/package.json');
if (domainPackage?.name !== '@no-code-collaboration-platform/domain') {
  failures.push('packages/domain/package.json: canonical package name changed');
}
if (domainPackage?.private !== true) failures.push('packages/domain/package.json: domain package must remain private');

const hookRun = spawnSync(process.execPath, [resolve(root, '.codex/hooks/session-start.mjs')], {
  cwd: root,
  encoding: 'utf8',
  timeout: 5000,
  windowsHide: true
});
if (hookRun.status !== 0) {
  failures.push(`SessionStart hook exited with ${hookRun.status}: ${hookRun.stderr.trim()}`);
} else {
  try {
    const output = JSON.parse(hookRun.stdout);
    const additionalContext = output?.hookSpecificOutput?.additionalContext ?? '';
    if (output?.hookSpecificOutput?.hookEventName !== 'SessionStart') {
      failures.push('SessionStart hook returned an unexpected event shape');
    }
    if (!additionalContext) failures.push('SessionStart hook returned no additional context');
    if (!additionalContext.includes('Workspace packages')) {
      failures.push('SessionStart hook does not report bounded workspace package context');
    }
    if (!additionalContext.includes('Turbo')) {
      failures.push('SessionStart hook does not report Turbo task-graph context');
    }
  } catch (error) {
    failures.push(`SessionStart hook did not return JSON: ${error.message}`);
  }
}

const workspacePackageCount = ['apps', 'packages'].reduce((count, parent) => {
  const parentPath = resolve(root, parent);
  if (!existsSync(parentPath)) return count;
  return (
    count +
    listDirectory(parentPath, { withFileTypes: true }).filter(
      (entry) => entry.isDirectory() && existsSync(resolve(parentPath, entry.name, 'package.json'))
    ).length
  );
}, 0);

const result = {
  ok: failures.length === 0,
  agents: { found: agentFiles.length, required: requiredAgents.length },
  skills: { found: skillDirectories.length, required: requiredSkills.length },
  hooks: Array.isArray(sessionHandlers) ? sessionHandlers.length : 0,
  instructionScopes: instructionScopes.length,
  workspacePackages: workspacePackageCount,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
