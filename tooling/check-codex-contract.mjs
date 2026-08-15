import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const failures = [];
const ROOT_INSTRUCTION_MAX_BYTES = 8192;
const SESSION_CONTEXT_MAX_BYTES = 4096;
const COMPACT_PROMPT_MAX_BYTES = 4096;

const read = (path) => {
  try {
    return readFileSync(resolve(root, path), 'utf8');
  } catch (error) {
    failures.push(`${path}: ${error.message}`);
    return '';
  }
};

const json = (path) => {
  try {
    return JSON.parse(read(path));
  } catch (error) {
    failures.push(`${path}: ${error.message}`);
    return {};
  }
};

const check = (path, content, contracts) => {
  for (const [pattern, message] of contracts) {
    if (!pattern.test(content)) failures.push(`${path}: ${message}`);
  }
};

const list = (path, options) => {
  try {
    return readdirSync(resolve(root, path), options);
  } catch (error) {
    failures.push(`${path}: ${error.message}`);
    return [];
  }
};

const section = (path, content, table) => {
  const marker = `[${table}]`;
  const start = content.indexOf(marker);
  if (start < 0) {
    failures.push(`${path}: missing ${marker}`);
    return '';
  }
  const remainder = content.slice(start + marker.length);
  const next = remainder.search(/^\[/m);
  return next < 0 ? remainder : remainder.slice(0, next);
};

const configPath = '.codex/config.toml';
const config = read(configPath);
check(configPath, config, [
  [
    /^#:schema https:\/\/developers\.openai\.com\/codex\/config-schema\.json$/m,
    'official schema declaration is missing'
  ],
  [/^approval_policy = "on-request"$/m, 'approval policy is not explicit'],
  [/^approvals_reviewer = "user"$/m, 'approval requests are not routed to the user'],
  [/^sandbox_mode = "workspace-write"$/m, 'workspace-write sandbox is missing'],
  [/^project_doc_max_bytes = 65536$/m, 'project instruction limit is not pinned'],
  [
    /^project_root_markers = \["pnpm-workspace\.yaml", "turbo\.json", "\.git"\]$/m,
    'workspace root markers are not pinned'
  ],
  [/^web_search = "indexed"$/m, 'bounded web search is missing'],
  [
    /^experimental_compact_prompt_file = "compact-prompt\.md"$/m,
    'compaction prompt file is not pinned'
  ],
  [/^hooks = true$/m, 'hooks are not enabled'],
  [/^multi_agent = true$/m, 'multi-agent collaboration is not enabled'],
  [/^max_concurrent_threads_per_session = 4$/m, 'agent concurrency is not bounded'],
  [/^inherit = "core"$/m, 'environment inheritance is not bounded'],
  [/^ignore_default_excludes = false$/m, 'secret-like environment exclusions are not enabled'],
  [/^network_access = false$/m, 'shell network access is not disabled']
]);

const compactPromptPath = '.codex/compact-prompt.md';
const compactPrompt = read(compactPromptPath);
const inlineCompactPrompt = config.match(/^compact_prompt = '''\r?\n([\s\S]*?)\r?\n'''$/m)?.[1];
if (!inlineCompactPrompt) {
  failures.push(`${configPath}: inline compaction prompt is missing`);
} else if (inlineCompactPrompt.trim() !== compactPrompt.trim()) {
  failures.push(`${configPath}: inline compaction prompt differs from ${compactPromptPath}`);
}
const compactPromptBytes = Buffer.byteLength(compactPrompt, 'utf8');
if (compactPromptBytes > COMPACT_PROMPT_MAX_BYTES) {
  failures.push(
    `${compactPromptPath}: compaction prompt exceeds ${COMPACT_PROMPT_MAX_BYTES} bytes (${compactPromptBytes})`
  );
}

const mcpContracts = [
  ['openaiDeveloperDocs', 'https://developers.openai.com/mcp', []],
  ['context7', 'https://mcp.context7.com/mcp', ['resolve-library-id', 'query-docs']],
  ['supabaseDocs', 'https://mcp.supabase.com/mcp?read_only=true&features=docs', ['search_docs']]
];
for (const [name, url, tools] of mcpContracts) {
  const content = section(configPath, config, `mcp_servers.${name}`);
  check(configPath, content, [
    [
      new RegExp(`^url = "${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"$`, 'm'),
      `${name} URL is not pinned`
    ],
    [/^enabled = true$/m, `${name} is not enabled`],
    [/^required = false$/m, `${name} must remain optional for offline work`],
    [/^default_tools_approval_mode = "auto"$/m, `${name} documentation tools are not automatic`]
  ]);
  for (const tool of tools) {
    if (!content.includes(`"${tool}"`))
      failures.push(`${configPath}: ${name} does not allow ${tool}`);
  }
}

const secretPatterns = [
  /project_ref=[^<&"\s]+/i,
  /SUPABASE_ACCESS_TOKEN\s*=/i,
  /service_role\s*=/i,
  /authorization\s*=\s*["']/i
];
for (const pattern of secretPatterns) {
  if (pattern.test(config))
    failures.push(
      `${configPath}: committed MCP configuration contains a secret or project binding`
    );
}

const hooks = json('.codex/hooks.json');
const sessionHandlers = hooks?.hooks?.SessionStart;
if (!Array.isArray(sessionHandlers) || sessionHandlers.length !== 1) {
  failures.push('.codex/hooks.json: expected exactly one SessionStart matcher group');
}

const requiredAgents = [
  'architecture-auditor.toml',
  'change-reviewer.toml',
  'dependency-docs-researcher.toml',
  'openai-docs-researcher.toml',
  'supabase-docs-researcher.toml'
];
const agentFiles = list('.codex/agents')
  .filter((name) => name.endsWith('.toml'))
  .toSorted();
for (const required of requiredAgents) {
  if (!agentFiles.includes(required)) failures.push(`.codex/agents: missing ${required}`);
}
for (const file of agentFiles) {
  const path = `.codex/agents/${file}`;
  const content = read(path);
  check(path, content, [
    [/^name = "[a-z0-9_]+"$/m, 'canonical name is missing'],
    [/^description = ".+"$/m, 'description is missing'],
    [/^model = "gpt-5\.6-(?:terra|luna)"$/m, 'purpose-fit model is not pinned'],
    [/^model_reasoning_effort = "(?:medium|high)"$/m, 'reasoning effort is not bounded'],
    [/^sandbox_mode = "read-only"$/m, 'sandbox is not read-only'],
    [/^developer_instructions = """$/m, 'developer instructions are missing']
  ]);
  for (const pattern of secretPatterns) {
    if (pattern.test(content)) failures.push(`${path}: contains a secret or live-project binding`);
  }
}

check(
  '.codex/agents/openai-docs-researcher.toml',
  read('.codex/agents/openai-docs-researcher.toml'),
  [[/https:\/\/developers\.openai\.com\/mcp/, 'official OpenAI Docs MCP is missing']]
);
check(
  '.codex/agents/dependency-docs-researcher.toml',
  read('.codex/agents/dependency-docs-researcher.toml'),
  [
    [/https:\/\/mcp\.context7\.com\/mcp/, 'Context7 MCP is missing'],
    [/"resolve-library-id"/, 'Context7 library resolution is missing'],
    [/"query-docs"/, 'Context7 documentation query is missing']
  ]
);
check(
  '.codex/agents/supabase-docs-researcher.toml',
  read('.codex/agents/supabase-docs-researcher.toml'),
  [
    [
      /https:\/\/mcp\.supabase\.com\/mcp\?read_only=true&features=docs/,
      'docs-only Supabase MCP is missing'
    ],
    [/"search_docs"/, 'Supabase documentation search is missing'],
    [/\/supabase\/supabase/, 'exact Supabase Context7 library ID is missing']
  ]
);

const requiredSkills = [
  'first-principles-architecture',
  'github-product-semantics',
  'github-semantics-first-principles',
  'verify-change',
  'workspace-impact-analysis'
];
const skills = list('.agents/skills', { withFileTypes: true })
  .filter(
    (entry) =>
      entry.isDirectory() && existsSync(resolve(root, '.agents/skills', entry.name, 'SKILL.md'))
  )
  .map((entry) => entry.name)
  .toSorted();
for (const required of requiredSkills) {
  if (!skills.includes(required)) failures.push(`.agents/skills: missing ${required}`);
}
for (const skill of skills) {
  const path = `.agents/skills/${skill}/SKILL.md`;
  check(path, read(path), [
    [/^---\nname: [a-z0-9-]+\ndescription: .+\n---\n/m, 'skill frontmatter is invalid']
  ]);
  const metadataPath = `.agents/skills/${skill}/agents/openai.yaml`;
  check(metadataPath, read(metadataPath), [
    [/^interface:\n  display_name: .+\n  short_description: .+/m, 'Desktop metadata is missing']
  ]);
}
check(
  '.agents/skills/github-product-semantics/SKILL.md',
  read('.agents/skills/github-product-semantics/SKILL.md'),
  [
    [/supporting policy reference/i, 'GitHub Product reference boundary is missing'],
    [/Do not invoke both Skills independently/, 'parallel GitHub decision guard is missing'],
    [/git refs, merge\/checkout semantics/, 'source-control exclusion is missing']
  ]
);
check(
  '.agents/skills/github-semantics-first-principles/SKILL.md',
  read('.agents/skills/github-semantics-first-principles/SKILL.md'),
  [
    [/Repository = No-Code Collaboration Container/, 'no-code Repository axiom is missing'],
    [
      /Source Code, source-control file trees, git refs/,
      'code/source-control exclusion is missing'
    ],
    [
      /do not also invoke `first-principles-architecture` unless/i,
      'general-method boundary is missing'
    ]
  ]
);
check(
  '.agents/skills/github-product-semantics/agents/openai.yaml',
  read('.agents/skills/github-product-semantics/agents/openai.yaml'),
  [[/allow_implicit_invocation: false/, 'GitHub Product reference must not invoke implicitly']]
);
check(
  '.agents/skills/plugin-development-workflow/SKILL.md',
  read('.agents/skills/plugin-development-workflow/SKILL.md'),
  [
    [/active decision Skill selected by narrowest ownership/, 'plugin router bypasses Skill owner'],
    [
      /github-semantics-first-principles for GitHub-derived Product decisions/,
      'GitHub decision route is missing'
    ],
    [
      /first-principles-architecture for broader or non-GitHub decisions/,
      'general decision route is missing'
    ]
  ]
);

const instructionScopes = [
  'docs/AGENTS.md',
  'docs/architecture/AGENTS.md',
  'docs/domains/AGENTS.md',
  'packages/domain/AGENTS.md',
  'supabase/AGENTS.md',
  'tooling/AGENTS.md'
];
for (const path of instructionScopes) {
  if (!read(path).trim()) failures.push(`${path}: instruction scope is empty`);
}

const rootInstructions = read('AGENTS.md');
check('AGENTS.md', rootInstructions, [
  [/## Context continuity and skill routing/, 'context-continuity contract is missing'],
  [
    /does not require discarding context or simulating a fresh start/i,
    'fresh-start reset is not explicitly rejected'
  ],
  [/Select skills by narrowest ownership/, 'narrowest-owner skill routing is missing'],
  [/Explicit user-named skills win/, 'explicit skill precedence is missing'],
  [/github-semantics-first-principles/, 'GitHub decision Skill owner is missing'],
  [/docs\/README\.md/, 'current-truth router is missing'],
  [
    /Do not redesign architecture while solving a local task/,
    'task-scoped architecture redesign guard is missing'
  ],
  [/do not invent the missing architecture/i, 'missing-context speculation guard is missing']
]);
const rootInstructionBytes = Buffer.byteLength(rootInstructions, 'utf8');
if (rootInstructionBytes > ROOT_INSTRUCTION_MAX_BYTES) {
  failures.push(
    `AGENTS.md: always-on context exceeds ${ROOT_INSTRUCTION_MAX_BYTES} bytes (${rootInstructionBytes})`
  );
}

const workspace = read('pnpm-workspace.yaml');
check('pnpm-workspace.yaml', workspace, [
  [/^\s*- ['"]apps\/\*['"]$/m, 'apps/* pattern is missing'],
  [/^\s*- ['"]packages\/\*['"]$/m, 'packages/* pattern is missing'],
  [/^disallowWorkspaceCycles: true$/m, 'workspace cycles are not configured to fail'],
  [/^failIfNoMatch: true$/m, 'unmatched filters are not configured to fail']
]);
if (/^\s*- ['"]?\.['"]?$/m.test(workspace))
  failures.push("pnpm-workspace.yaml: remove redundant '.'");

const turbo = json('turbo.json');
if (!turbo?.tasks?.lint?.dependsOn?.includes('^lint'))
  failures.push('turbo.json: lint dependency order is missing');
if (!turbo?.tasks?.typecheck?.dependsOn?.includes('^typecheck'))
  failures.push('turbo.json: typecheck dependency order is missing');
for (const dependency of ['tsconfig.base.json', '.oxlintrc.json']) {
  if (!turbo?.globalDependencies?.includes(dependency))
    failures.push(`turbo.json: missing ${dependency}`);
}

const rootPackage = json('package.json');
if (rootPackage?.scripts?.['turbo:graph'] !== 'turbo ls')
  failures.push('package.json: bounded Turbo discovery is missing');
if (!rootPackage?.scripts?.['supabase:verify']?.includes('supabase:reset'))
  failures.push('package.json: migration replay is not verified');
if (!rootPackage?.devDependencies?.turbo || !rootPackage?.devDependencies?.supabase)
  failures.push('package.json: baseline CLI dependencies are missing');
const domainPackage = json('packages/domain/package.json');
if (
  domainPackage?.name !== '@no-code-collaboration-platform/domain' ||
  domainPackage?.private !== true
) {
  failures.push('packages/domain/package.json: canonical private domain package contract changed');
}

check('README.md', read('README.md'), [
  [
    /(?:Repository.*no-code collaboration container|Repository.*無代碼協作容器)/is,
    'project definition is missing'
  ],
  [/docs\/CODEX_DESKTOP\.md/, 'Codex Desktop documentation is not linked']
]);
check('docs/CODEX_DESKTOP.md', read('docs/CODEX_DESKTOP.md'), [
  [/OpenAI Developer Docs/, 'OpenAI context route is missing'],
  [/Context7/, 'Context7 route is missing'],
  [/Supabase Docs/, 'Supabase route is missing'],
  [/machine-local Supabase project context/i, 'machine-local Supabase boundary is missing'],
  [/read-only by default/i, 'machine-local Supabase access is not read-only by default'],
  [/documentation[- ]only/i, 'committed Supabase boundary is not explicit'],
  [/Relevant prior context is preserved/, 'context-continuity boundary is missing'],
  [/docs\/architecture\/ADR_INDEX\.md/, 'ADR history router is missing'],
  [/## Skill routing/, 'Skill routing contract is missing'],
  [/narrowest applicable owner/, 'narrowest-owner Skill routing is missing'],
  [/does not replace the active domain or decision Skill/, 'tool-router boundary is missing']
]);
check('supabase/config.toml', read('supabase/config.toml'), [
  [/^\[db\.migrations\]$/m, 'declarative migrations are missing'],
  [/^schema_paths = \["\.\/schemas\/\*\.sql"\]$/m, 'schema path is not pinned'],
  [/^major_version = 17$/m, 'PostgreSQL version is not pinned']
]);
check('supabase/schemas/README.md', read('supabase/schemas/README.md'), [
  [/source of truth/i, 'schema truth boundary is missing'],
  [/sole consolidated baseline/is, 'local baseline boundary is missing'],
  [/append-only/is, 'post-application migration history boundary is missing'],
  [/Generated.*projection/is, 'generated type boundary is missing']
]);
check('.github/workflows/verify.yml', read('.github/workflows/verify.yml'), [
  [/pnpm install --frozen-lockfile/, 'deterministic install is missing'],
  [/pnpm verify:full/, 'repository verification is missing'],
  [/pnpm supabase:start/, 'Supabase startup is missing'],
  [/pnpm supabase:verify/, 'Supabase verification is missing'],
  [/if: always\(\)/, 'Supabase cleanup is not unconditional']
]);
check('.codex/rules/.filesystem.rules', read('.codex/rules/.filesystem.rules'), [
  [/decision = "prompt"/, 'deletion is not approval-gated']
]);
check('.codex/rules/.supabase.rules', read('.codex/rules/.supabase.rules'), [
  [
    /pattern = \["supabase", "db", "reset"\][\s\S]*?decision = "allow"/,
    'local reset is not allowed'
  ],
  [
    /pattern = \["supabase", "db", "reset", "--linked"\][\s\S]*?decision = "forbidden"/,
    'linked reset is not forbidden'
  ],
  [
    /pattern = \["supabase", "db", "push"\][\s\S]*?decision = "prompt"/,
    'remote push is not approval-gated'
  ]
]);

let sessionContextBytes = 0;
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
    const context = output?.hookSpecificOutput?.additionalContext ?? '';
    sessionContextBytes = Buffer.byteLength(context, 'utf8');
    if (sessionContextBytes > SESSION_CONTEXT_MAX_BYTES) {
      failures.push(
        `SessionStart context exceeds ${SESSION_CONTEXT_MAX_BYTES} bytes (${sessionContextBytes})`
      );
    }
    if (output?.hookSpecificOutput?.hookEventName !== 'SessionStart')
      failures.push('SessionStart event shape is invalid');
    for (const expected of [
      'Context continuity',
      'does not require discarding context',
      'docs/README.md',
      'Historical and prior context',
      'Skill routing',
      'GitHub-derived Product decisions',
      'do not invent architecture',
      'Workspace packages',
      'Turbo',
      'Reference context',
      'OpenAI Developer Docs',
      'Context7',
      'Supabase Docs'
    ]) {
      if (!context.includes(expected))
        failures.push(`SessionStart hook does not report ${expected}`);
    }
  } catch (error) {
    failures.push(`SessionStart hook did not return JSON: ${error.message}`);
  }
}

const workspacePackages = ['apps', 'packages'].reduce((count, parent) => {
  const path = resolve(root, parent);
  if (!existsSync(path)) return count;
  return (
    count +
    list(path, { withFileTypes: true }).filter(
      (entry) => entry.isDirectory() && existsSync(resolve(path, entry.name, 'package.json'))
    ).length
  );
}, 0);

const result = {
  ok: failures.length === 0,
  contextSources: { found: mcpContracts.length, required: mcpContracts.length },
  agents: { found: agentFiles.length, required: requiredAgents.length },
  skills: { found: skills.length, required: requiredSkills.length },
  hooks: Array.isArray(sessionHandlers) ? sessionHandlers.length : 0,
  instructionScopes: instructionScopes.length,
  contextBudget: {
    rootInstructionBytes,
    rootInstructionMaxBytes: ROOT_INSTRUCTION_MAX_BYTES,
    sessionContextBytes,
    sessionContextMaxBytes: SESSION_CONTEXT_MAX_BYTES
  },
  workspacePackages,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
