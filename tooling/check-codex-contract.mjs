import { readFileSync, readdirSync } from 'node:fs';
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
const requireText = (path, pattern, message) => {
  const content = read(path);
  if (!pattern.test(content)) failures.push(`${path}: ${message}`);
  return content;
};

const config = requireText(
  '.codex/config.toml',
  /^#:schema https:\/\/developers\.openai\.com\/codex\/config-schema\.json/m,
  'missing official Codex schema declaration'
);

for (const [pattern, message] of [
  [/^project_doc_max_bytes = 65536$/m, 'project instruction byte limit is not pinned'],
  [/^web_search = "indexed"$/m, 'bounded indexed web search is not configured'],
  [/^\[features\]$/m, 'features table is missing'],
  [/^hooks = true$/m, 'hooks are not enabled'],
  [/^multi_agent = true$/m, 'multi-agent collaboration is not enabled'],
  [/^\[agents\]$/m, 'agents table is missing'],
  [/^max_concurrent_threads_per_session = 4$/m, 'subagent concurrency is not bounded']
]) {
  if (!pattern.test(config)) failures.push(`.codex/config.toml: ${message}`);
}

let hooks = {};
try {
  hooks = JSON.parse(read('.codex/hooks.json'));
} catch (error) {
  failures.push(`.codex/hooks.json: ${error.message}`);
}
const sessionHandlers = hooks?.hooks?.SessionStart;
if (!Array.isArray(sessionHandlers) || sessionHandlers.length !== 1) {
  failures.push('.codex/hooks.json: expected exactly one SessionStart matcher group');
}

const listDirectory = (path, options) => {
  try {
    return readdirSync(resolve(root, path), options);
  } catch (error) {
    failures.push(`${path}: ${error.message}`);
    return [];
  }
};

const agentFiles = listDirectory('.codex/agents').filter((name) => name.endsWith('.toml')).sort();
if (agentFiles.length !== 3) failures.push('.codex/agents: expected exactly three focused custom agents');
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

const skillDirectories = listDirectory('.agents/skills', { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
if (skillDirectories.length !== 3) failures.push('.agents/skills: expected exactly three focused repository skills');
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

for (const path of [
  'docs/AGENTS.md',
  'docs/architecture/AGENTS.md',
  'docs/domains/AGENTS.md',
  'tooling/AGENTS.md'
]) {
  if (!read(path).trim()) failures.push(`${path}: instruction scope is empty`);
}

const hookRun = spawnSync(process.execPath, [resolve(root, '.codex/hooks/session-start.mjs')], {
  cwd: root,
  encoding: 'utf8'
});
if (hookRun.status !== 0) {
  failures.push(`SessionStart hook exited with ${hookRun.status}: ${hookRun.stderr.trim()}`);
} else {
  try {
    const output = JSON.parse(hookRun.stdout);
    if (output?.hookSpecificOutput?.hookEventName !== 'SessionStart') {
      failures.push('SessionStart hook returned an unexpected event shape');
    }
    if (!output?.hookSpecificOutput?.additionalContext) {
      failures.push('SessionStart hook returned no additional context');
    }
  } catch (error) {
    failures.push(`SessionStart hook did not return JSON: ${error.message}`);
  }
}

const result = {
  ok: failures.length === 0,
  agents: agentFiles.length,
  skills: skillDirectories.length,
  hooks: Array.isArray(sessionHandlers) ? sessionHandlers.length : 0,
  instructionScopes: 4,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
