import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const failures = [];

function read(path) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) {
    failures.push(`${path}: required documentation contract is missing`);
    return '';
  }

  return readFileSync(absolute, 'utf8');
}

function requireMatch(path, content, pattern, message) {
  if (!pattern.test(content)) failures.push(`${path}: ${message}`);
}

const requiredDocuments = [
  'docs/AGENTS.md',
  'docs/PRODUCT.md',
  'docs/IMPLEMENTATION_GAPS.md',
  'docs/README.md',
  'docs/domains/DOMAIN_TEMPLATE.md',
  'docs/domains/access-authority.md',
  'docs/domains/repository-collaboration.md',
  'docs/operations/AGENTS.md',
  'docs/operations/RUNBOOK.md'
];

const documents = Object.fromEntries(requiredDocuments.map((path) => [path, read(path)]));
const gapRegister = documents['docs/IMPLEMENTATION_GAPS.md'];

requireMatch(
  'docs/PRODUCT.md',
  documents['docs/PRODUCT.md'],
  /^- Status: Canonical$/m,
  'canonical product status is missing'
);
requireMatch(
  'docs/PRODUCT.md',
  documents['docs/PRODUCT.md'],
  /Repository.*no-code collaboration container/is,
  'Repository product invariant is missing'
);
requireMatch(
  'docs/PRODUCT.md',
  documents['docs/PRODUCT.md'],
  /^## Falsification conditions$/m,
  'falsification conditions are missing'
);
requireMatch(
  'docs/PRODUCT.md',
  documents['docs/PRODUCT.md'],
  /^## Contract update protocol$/m,
  'contract update protocol is missing'
);

requireMatch(
  'docs/README.md',
  documents['docs/README.md'],
  /IMPLEMENTATION_GAPS\.md/,
  'implementation gap register is not part of the documentation map'
);
requireMatch(
  'docs/README.md',
  documents['docs/README.md'],
  /open authorization or data-integrity gap/is,
  'production-blocking gap rule is missing'
);

for (const gapId of ['GAP-AUTH-001', 'GAP-LIFECYCLE-001']) {
  requireMatch(
    'docs/IMPLEMENTATION_GAPS.md',
    gapRegister,
    new RegExp(`^### ${gapId}\\b`, 'm'),
    `${gapId} is missing`
  );
}
for (const section of ['Direct evidence', 'Temporary containment', 'Closure evidence']) {
  requireMatch(
    'docs/IMPLEMENTATION_GAPS.md',
    gapRegister,
    new RegExp(`^#### ${section}$`, 'm'),
    `${section} section is missing`
  );
}
requireMatch(
  'docs/IMPLEMENTATION_GAPS.md',
  gapRegister,
  /### GAP-AUTH-001[\s\S]*?- Status: Closed/i,
  'GAP-AUTH-001 must retain its verified closed status'
);
requireMatch(
  'docs/IMPLEMENTATION_GAPS.md',
  gapRegister,
  /### GAP-AUTH-001[\s\S]*?02f33f4ba75cc250378a6fba38f4b926eb62c355[\s\S]*?31505215295/i,
  'GAP-AUTH-001 exact commit and CI closure evidence is missing'
);
requireMatch(
  'docs/IMPLEMENTATION_GAPS.md',
  gapRegister,
  /### GAP-LIFECYCLE-001[\s\S]*?- Status: Open/i,
  'GAP-LIFECYCLE-001 must remain open until lifecycle evidence exists'
);

requireMatch(
  'docs/domains/DOMAIN_TEMPLATE.md',
  documents['docs/domains/DOMAIN_TEMPLATE.md'],
  /^## Known implementation gaps$/m,
  'domain contracts do not require explicit implementation gaps'
);
requireMatch(
  'docs/domains/access-authority.md',
  documents['docs/domains/access-authority.md'],
  /Operation capability and role-delegation authority are distinct authorization decisions/,
  'delegation authority distinction is missing'
);
requireMatch(
  'docs/domains/repository-collaboration.md',
  documents['docs/domains/repository-collaboration.md'],
  /Deleting a Repository must define the fate of contained Resources, grants, and events/,
  'destructive Repository lifecycle rule is missing'
);

requireMatch(
  'docs/operations/AGENTS.md',
  documents['docs/operations/AGENTS.md'],
  /Never present an untested command or provider assumption as operational truth/,
  'operational truth boundary is missing'
);
requireMatch(
  'docs/operations/AGENTS.md',
  documents['docs/operations/AGENTS.md'],
  /Direct production mutation requires explicit user intent/,
  'production mutation approval boundary is missing'
);
requireMatch(
  'docs/operations/RUNBOOK.md',
  documents['docs/operations/RUNBOOK.md'],
  /Status: Baseline; not yet production-validated/,
  'production-validation status is missing'
);
requireMatch(
  'docs/operations/RUNBOOK.md',
  documents['docs/operations/RUNBOOK.md'],
  /^## Current production gates$/m,
  'production gates are missing'
);

const result = {
  ok: failures.length === 0,
  requiredDocuments: requiredDocuments.length,
  registeredGaps: 2,
  openGaps: 1,
  closedGaps: 1,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
