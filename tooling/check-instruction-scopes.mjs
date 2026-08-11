import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const failures = [];

const instructionScopes = [
  'AGENTS.md',
  'apps/web/AGENTS.md',
  'apps/web/src/app/AGENTS.md',
  'apps/web/src/app/(app)/app/repositories/[repositoryId]/AGENTS.md',
  'docs/AGENTS.md',
  'docs/architecture/AGENTS.md',
  'docs/domains/AGENTS.md',
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
  'apps/web/src/app/AGENTS.md': [
    [/implicit `children` slot/i, 'implicit children slot invariant is missing'],
    [/persistent named slot/i, 'persistent named-slot invariant is missing'],
    [/MUST NOT silently return `null`/i, 'non-null fallback invariant is missing']
  ],
  'apps/web/src/app/(app)/app/repositories/[repositoryId]/AGENTS.md': [
    [/@navigation.*@workspace.*@context.*@activity/is, 'Repository slot ownership is incomplete'],
    [/hard navigation/i, 'hard-navigation recovery invariant is missing'],
    [
      /may grant, revoke, or reinterpret Repository authority/i,
      'route authorization boundary is missing'
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
  'supabase/migrations/AGENTS.md': [
    [/append-only deployment history/i, 'append-only migration invariant is missing'],
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
    [/retain at least one owner/i, 'database owner continuity invariant is missing']
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
