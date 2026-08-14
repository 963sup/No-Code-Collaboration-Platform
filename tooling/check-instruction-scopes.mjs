import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const failures = [];

const instructionScopes = [
  'AGENTS.md',
  'apps/web/AGENTS.md',
  'apps/web/src/app/AGENTS.md',
  'docs/AGENTS.md',
  'docs/architecture/AGENTS.md',
  'docs/domains/AGENTS.md',
  'docs/operations/AGENTS.md',
  'packages/application/AGENTS.md',
  'packages/domain/AGENTS.md',
  'packages/domain/src/access/AGENTS.md',
  'packages/domain/tests/AGENTS.md',
  'packages/infrastructure/supabase/AGENTS.md',
  'packages/ui/AGENTS.md',
  'supabase/AGENTS.md',
  'supabase/migrations/AGENTS.md',
  'supabase/schemas/AGENTS.md',
  'supabase/tests/AGENTS.md',
  'tooling/AGENTS.md'
];

const invariantContracts = {
  'apps/web/AGENTS.md': [
    [/Web -> Application -> Domain/i, 'Web dependency direction is missing'],
    [
      /canonical Repository workspace.*\/\{ownerSlug\}\/\{repositorySlug\}/is,
      'canonical Owner/Repository namespace is missing'
    ],
    [
      /\/app\/repositories\/\[repositoryId\].*compatibility-only[\s\S]*access-aware resolution[\s\S]*redirect/is,
      'stable-ID Repository redirect-only compatibility boundary is missing'
    ],
    [
      /one Owner\/Repository header, primary navigation, and one active content surface/i,
      'canonical single-content Repository presentation is missing'
    ],
    [
      /Canonical Repository reads must not inherit an authenticated-only wrapper[\s\S]*public Repository visibility/is,
      'public Repository delivery boundary is missing'
    ],
    [/Authentication is not Authorization/i, 'authentication/authorization separation is missing']
  ],
  'apps/web/src/app/AGENTS.md': [
    [
      /canonical Repository workspace URL is `\/\{ownerSlug\}\/\{repositorySlug\}`/i,
      'canonical Repository App Router URL is missing'
    ],
    [
      /src\/app\/\(repository\)\/[\s\S]*\[ownerSlug\][\s\S]*\[repositorySlug\]/is,
      'canonical Repository route-group projection is missing'
    ],
    [
      /one owner\/Repository header, horizontal primary navigation, and one active content surface/i,
      'canonical Repository presentation invariant is missing'
    ],
    [
      /Do not require persistent navigation\/context\/activity panes merely because Parallel Routes are available/i,
      'framework composition must not become a persistent-pane Product invariant'
    ],
    [
      /only accepted Repository compatibility namespace is `\/app\/repositories\/\[repositoryId\]\/\*\*`[\s\S]*access-aware[\s\S]*redirect-only/is,
      'stable-ID compatibility route boundary is missing'
    ],
    [
      /Organization-only `\/app\/\[organizationSlug\]\/\[repositorySlug\]\/\*\*` Repository routing must not exist/i,
      'Organization-only Repository route rejection is missing'
    ],
    [
      /Soft navigation and direct hard navigation[\s\S]*same Repository stable identity and authorization result/is,
      'soft/hard navigation identity invariant is missing'
    ],
    [
      /Public Repository reads must not be converted into authenticated-only behavior/i,
      'public Repository delivery invariant is missing'
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
  'supabase/AGENTS.md': [
    [/no Supabase Cloud project is provisioned/i, 'local-only provisioning status is missing'],
    [
      /file presence.*MUST NOT.*remote deployment/is,
      'migration/deployment evidence boundary is missing'
    ],
    [
      /Default package scripts and ordinary CI MUST NOT.*remote/is,
      'ordinary verification remote-mutation boundary is missing'
    ]
  ],
  'supabase/migrations/AGENTS.md': [
    [
      /append-only accepted replayable database transition history/i,
      'accepted replayable migration invariant is missing'
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
    [/GAP-LIFECYCLE-001/i, 'destructive lifecycle gap boundary is missing'],
    [
      /MUST NOT be used as evidence.*remote deployment/is,
      'schema/deployment evidence boundary is missing'
    ]
  ],
  'supabase/tests/AGENTS.md': [
    [/original attack path/i, 'attack-path regression invariant is missing'],
    [/last-owner removal/i, 'last-owner negative case is missing'],
    [/legitimate positive control/i, 'positive control invariant is missing']
  ]
};

for (const path of instructionScopes) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) {
    failures.push(`${path}: required instruction scope is missing`);
    continue;
  }

  const content = readFileSync(absolute, 'utf8');
  if (!content.trim()) failures.push(`${path}: instruction scope is empty`);

  for (const [pattern, message] of invariantContracts[path] ?? []) {
    if (!pattern.test(content)) failures.push(`${path}: ${message}`);
  }
}

const result = {
  ok: failures.length === 0,
  instructionScopes: instructionScopes.length,
  invariantScopes: Object.keys(invariantContracts).length,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
