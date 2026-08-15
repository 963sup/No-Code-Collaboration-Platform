import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const failures = [];
const INSTRUCTION_MAX_BYTES = 8_192;
const ACTIVE_CHAIN_MAX_BYTES = 24_576;

const instructionScopes = [
  '.agents/AGENTS.md',
  '.codex/AGENTS.md',
  '.github/AGENTS.md',
  '.serena/AGENTS.md',
  'AGENTS.md',
  'apps/AGENTS.md',
  'apps/web/AGENTS.md',
  'apps/web/e2e/AGENTS.md',
  'apps/web/src/AGENTS.md',
  'apps/web/src/app/(auth)/AGENTS.md',
  'apps/web/src/app/(repository)/AGENTS.md',
  'apps/web/src/app/AGENTS.md',
  'apps/web/src/composition/AGENTS.md',
  'docs/AGENTS.md',
  'docs/architecture/AGENTS.md',
  'docs/benchmarks/AGENTS.md',
  'docs/domains/AGENTS.md',
  'docs/history/AGENTS.md',
  'docs/operations/AGENTS.md',
  'packages/AGENTS.md',
  'packages/application/AGENTS.md',
  'packages/application/src/AGENTS.md',
  'packages/application/tests/AGENTS.md',
  'packages/domain/AGENTS.md',
  'packages/domain/src/AGENTS.md',
  'packages/domain/src/access/AGENTS.md',
  'packages/domain/tests/AGENTS.md',
  'packages/infrastructure/supabase/AGENTS.md',
  'packages/infrastructure/supabase/src/AGENTS.md',
  'packages/infrastructure/supabase/src/generated/AGENTS.md',
  'packages/infrastructure/supabase/tests/AGENTS.md',
  'packages/ui/AGENTS.md',
  'packages/ui/src/AGENTS.md',
  'supabase/AGENTS.md',
  'supabase/migrations/AGENTS.md',
  'supabase/schemas/AGENTS.md',
  'supabase/templates/AGENTS.md',
  'supabase/tests/AGENTS.md',
  'tooling/AGENTS.md'
];

const invariantContracts = {
  'AGENTS.md': [
    [/Repository = No-Code Collaboration Container/i, 'absolute Product axiom is missing'],
    [
      /structural containment.*does not create another Container/i,
      'structural containment/Container boundary is missing'
    ],
    [
      /Context, Projection, Branch selection, Proposal participation or approval[\s\S]*never create or change authority/i,
      'presentation/process authority boundary is missing'
    ],
    [
      /Governance constrains future action.*Audit.*past action/i,
      'Governance/Audit time-direction boundary is missing'
    ],
    [
      /accepted Data Change\/Exchange\/Repository Derivation semantic envelope[\s\S]*no schema, route, Capability[\s\S]*arbitrary execution/i,
      'accepted Data envelope/implementation boundary is missing'
    ]
  ],
  '.agents/AGENTS.md': [
    [/A Skill routes work; it does not become Product/i, 'Skill/truth boundary is missing'],
    [/one narrow owner and a discriminating trigger/i, 'narrow Skill ownership is missing']
  ],
  '.codex/AGENTS.md': [
    [/within the enforced byte budgets/i, 'Codex context-budget boundary is missing'],
    [/must not print secrets or make hidden network/i, 'Codex hook safety boundary is missing']
  ],
  '.github/AGENTS.md': [
    [/least-privilege permissions/i, 'workflow least-privilege boundary is missing'],
    [/pinned action revisions/i, 'workflow action-pinning boundary is missing']
  ],
  '.serena/AGENTS.md': [
    [/supporting context, not current truth/i, 'Serena/current-truth boundary is missing'],
    [/Do not store credentials.*transient logs/is, 'Serena memory safety boundary is missing']
  ],
  'apps/web/AGENTS.md': [
    [/Web -> Application -> Domain/i, 'Web dependency direction is missing'],
    [/Authentication is not authorization/i, 'authentication/authorization separation is missing'],
    [
      /Supabase implementations enter Web only through `src\/composition`/i,
      'composition boundary is missing'
    ]
  ],
  'apps/web/src/app/AGENTS.md': [
    [
      /Route Groups.*never become Product URL semantics/is,
      'Route Group/Product boundary is missing'
    ],
    [
      /Hard navigation and soft navigation.*same stable identity and authorization/is,
      'navigation identity invariant is missing'
    ]
  ],
  'apps/web/src/app/(repository)/AGENTS.md': [
    [
      /canonical Repository URL is `\/\{ownerSlug\}\/\{repositorySlug\}`/i,
      'canonical Repository URL is missing'
    ],
    [
      /owner namespace resolves a User or Organization.*never implies mandatory Organization ownership/is,
      'typed Repository owner boundary is missing'
    ],
    [
      /\/app\/repositories\/\[repositoryId\]\/\*\*.*access-aware, redirect-only compatibility/is,
      'stable-ID redirect-only compatibility boundary is missing'
    ],
    [
      /Organization-only.*Repository routing is invalid/is,
      'Organization-only Repository route rejection is missing'
    ],
    [
      /Presentation Context and slot state never become authorization inputs/i,
      'presentation/authorization boundary is missing'
    ]
  ],
  'apps/web/src/app/(auth)/AGENTS.md': [
    [
      /never grant Organization Membership.*Capability/is,
      'authentication/authority boundary is missing'
    ],
    [
      /known same-application routes.*open redirect/is,
      'safe authentication redirect boundary is missing'
    ]
  ],
  'apps/web/src/composition/AGENTS.md': [
    [
      /only Web-owned provider construction boundary/i,
      'Web provider-construction owner is missing'
    ],
    [
      /Service-role or admin credentials.*server-only/is,
      'server-only administrative credential boundary is missing'
    ]
  ],
  'docs/benchmarks/AGENTS.md': [
    [/Benchmarks are evidence, not Product admission/i, 'benchmark/Product boundary is missing'],
    [/source, observation date, conditions/i, 'benchmark evidence requirements are missing']
  ],
  'docs/history/AGENTS.md': [
    [/never the current truth router/i, 'history/current-truth boundary is missing'],
    [
      /closed gap must point to the executable evidence/i,
      'gap closure evidence requirement is missing'
    ]
  ],
  'docs/operations/AGENTS.md': [
    [
      /Never present an untested command or provider assumption as operational truth/i,
      'operational truth boundary is missing'
    ],
    [
      /selected adapter is not a provisioned environment/i,
      'adapter/provisioning distinction is missing'
    ],
    [
      /migration file is not an applied deployment/i,
      'migration/applied-deployment distinction is missing'
    ],
    [
      /Direct production mutation requires explicit user intent/i,
      'production mutation approval boundary is missing'
    ]
  ],
  'packages/domain/src/AGENTS.md': [
    [
      /Owner is exactly a typed User or Organization relationship/i,
      'typed Repository owner invariant is missing'
    ],
    [/undefined transitions explicitly/i, 'undefined Domain transition boundary is missing']
  ],
  'packages/domain/src/access/AGENTS.md': [
    [
      /capability.*never implies unlimited authority to delegate/is,
      'capability/delegation split is missing'
    ],
    [/current role.*proposed role/is, 'dual-sided role transition invariant is missing'],
    [/retain at least one owner/i, 'ownership continuity invariant is missing']
  ],
  'packages/domain/tests/AGENTS.md': [
    [/adversarial negative cases/i, 'negative authorization test invariant is missing'],
    [
      /actor role.*current target role.*proposed target role/is,
      'transition-matrix test invariant is missing'
    ]
  ],
  'packages/infrastructure/supabase/AGENTS.md': [
    [/A database row is not a Domain entity/i, 'row/Domain mapping boundary is missing'],
    [
      /Authentication establishes actor identity only/i,
      'provider authentication boundary is missing'
    ]
  ],
  'packages/infrastructure/supabase/src/generated/AGENTS.md': [
    [/Never hand-edit generated database types/i, 'generated-type authoring boundary is missing'],
    [
      /must not leak into Domain, Application, or UI APIs/i,
      'generated-type reachability boundary is missing'
    ]
  ],
  'supabase/AGENTS.md': [
    [/no Supabase Cloud project is provisioned/i, 'local-only provisioning status is missing'],
    [
      /File presence.*MUST NOT.*remote deployment/is,
      'migration/deployment evidence boundary is missing'
    ],
    [
      /Default package scripts and ordinary CI MUST NOT.*remote/is,
      'ordinary verification remote-mutation boundary is missing'
    ]
  ],
  'supabase/migrations/AGENTS.md': [
    [
      /single replaceable local-development baseline.*append-only/is,
      'local baseline and applied-history lifecycle is missing'
    ],
    [/migration ledger.*provider evidence/is, 'environment applied-state evidence is missing'],
    [/remote Supabase project/i, 'remote mutation boundary is missing']
  ],
  'supabase/schemas/AGENTS.md': [
    [
      /`USING` protects the existing row.*`WITH CHECK` protects the proposed row/is,
      'RLS transition invariant is missing'
    ],
    [
      /Repository managers MUST NOT.*manager or admin grants/is,
      'Repository delegation ceiling is missing'
    ],
    [/retain at least one owner/i, 'database owner continuity invariant is missing'],
    [
      /Undefined archive, restore, retention, purge, redaction[\s\S]*fail closed/i,
      'undefined destructive lifecycle boundary is missing'
    ],
    [
      /MUST NOT be used as evidence.*remote deployment/is,
      'schema/deployment evidence boundary is missing'
    ]
  ],
  'supabase/templates/AGENTS.md': [
    [
      /do not decide Repository access.*capability/is,
      'Auth template/authorization boundary is missing'
    ],
    [
      /confirmation, recovery, and redirect tokens as secrets/i,
      'Auth template token boundary is missing'
    ]
  ],
  'supabase/tests/AGENTS.md': [
    [/original attack path/i, 'attack-path regression invariant is missing'],
    [/last-owner removal/i, 'last-owner negative case is missing'],
    [/legitimate positive control/i, 'positive control invariant is missing']
  ]
};

const volatileSnapshotPatterns = [
  [/##\s+Current executable/i, 'volatile executable-status section is forbidden'],
  [
    /Only Pages and Activity are currently executable/i,
    'volatile feature-status snapshot is forbidden'
  ],
  [/Discussion remains an Open delivery gap/i, 'volatile gap-status snapshot is forbidden'],
  [/Current end-user reachability is SELECT-only/i, 'volatile reachability snapshot is forbidden'],
  [/\bcurrently executable\b/i, 'volatile executable-status statement is forbidden'],
  [/\bnot yet implemented\b/i, 'volatile implementation-status statement is forbidden']
];

const scopeSet = new Set(instructionScopes);
const scopeBytes = new Map();

function discoverInstructionScopes(directory = root) {
  const discovered = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (
      entry.isDirectory() &&
      [
        '.git',
        '.next',
        '.turbo',
        'coverage',
        'node_modules',
        'playwright-report',
        'test-results'
      ].includes(entry.name)
    ) {
      continue;
    }

    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      discovered.push(...discoverInstructionScopes(absolute));
    } else if (entry.isFile() && entry.name === 'AGENTS.md') {
      discovered.push(normalize(absolute.slice(root.length + 1)));
    }
  }

  return discovered.toSorted();
}

const discoveredScopes = discoverInstructionScopes();
for (const path of discoveredScopes) {
  if (!scopeSet.has(path)) failures.push(`${path}: instruction scope is not registered`);
}
for (const path of instructionScopes) {
  if (!discoveredScopes.includes(path))
    failures.push(`${path}: registered instruction scope is missing`);
}

for (const path of instructionScopes) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) {
    failures.push(`${path}: required instruction scope is missing`);
    continue;
  }

  const content = readFileSync(absolute, 'utf8');
  const bytes = Buffer.byteLength(content, 'utf8');
  scopeBytes.set(path, bytes);

  if (!content.trim()) failures.push(`${path}: instruction scope is empty`);
  if (bytes > INSTRUCTION_MAX_BYTES) {
    failures.push(
      `${path}: ${bytes} bytes exceeds ${INSTRUCTION_MAX_BYTES}-byte instruction budget`
    );
  }

  for (const [pattern, message] of invariantContracts[path] ?? []) {
    if (!pattern.test(content)) failures.push(`${path}: ${message}`);
  }

  for (const [pattern, message] of volatileSnapshotPatterns) {
    if (pattern.test(content)) failures.push(`${path}: ${message}`);
  }
}

function normalize(path) {
  return path.replaceAll('\\', '/');
}

function instructionChain(path) {
  const chain = [];
  let directory = normalize(dirname(path));

  while (true) {
    const candidate = directory === '.' ? 'AGENTS.md' : `${directory}/AGENTS.md`;
    if (scopeSet.has(candidate)) chain.push(candidate);
    if (directory === '.') break;
    directory = normalize(dirname(directory));
  }

  return chain.toReversed();
}

let maxActiveChainBytes = 0;
for (const path of instructionScopes) {
  const chain = instructionChain(path);
  const bytes = chain.reduce((total, item) => total + (scopeBytes.get(item) ?? 0), 0);
  maxActiveChainBytes = Math.max(maxActiveChainBytes, bytes);
  if (bytes > ACTIVE_CHAIN_MAX_BYTES) {
    failures.push(
      `${path}: active instruction chain is ${bytes} bytes; limit is ${ACTIVE_CHAIN_MAX_BYTES}`
    );
  }
}

const result = {
  ok: failures.length === 0,
  instructionScopes: instructionScopes.length,
  discoveredInstructionScopes: discoveredScopes.length,
  invariantScopes: Object.keys(invariantContracts).length,
  instructionMaxBytes: INSTRUCTION_MAX_BYTES,
  maxActiveChainBytes,
  activeChainMaxBytes: ACTIVE_CHAIN_MAX_BYTES,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
