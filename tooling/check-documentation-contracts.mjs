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

function forbidMatch(path, content, pattern, message) {
  if (pattern.test(content)) failures.push(`${path}: ${message}`);
}

const requiredDocuments = [
  'README.md',
  'docs/AGENTS.md',
  'docs/PRODUCT.md',
  'docs/ONTOLOGY.md',
  'docs/IMPLEMENTATION_GAPS.md',
  'docs/history/CLOSED_GAPS.md',
  'docs/README.md',
  'docs/architecture/README.md',
  'docs/architecture/ADR_INDEX.md',
  'docs/architecture/ADR-003-repository-workspace-parallel-composition.md',
  'docs/architecture/ADR-005-local-first-supabase-lifecycle.md',
  'docs/architecture/ADR-010-repository-owner-namespace.md',
  'docs/domains/DOMAIN_TEMPLATE.md',
  'docs/domains/access-authority.md',
  'docs/domains/data-exchange.md',
  'docs/domains/identity-lifecycle.md',
  'docs/domains/structured-data-change.md',
  'docs/domains/repository-collaboration.md',
  'docs/operations/AGENTS.md',
  'docs/operations/RUNBOOK.md'
];

const documents = Object.fromEntries(requiredDocuments.map((path) => [path, read(path)]));
const product = documents['docs/PRODUCT.md'];
const ontology = documents['docs/ONTOLOGY.md'];
const repositoryDomain = documents['docs/domains/repository-collaboration.md'];
const structuredDataChangeDomain = documents['docs/domains/structured-data-change.md'];
const dataExchangeDomain = documents['docs/domains/data-exchange.md'];
const gapRegister = documents['docs/IMPLEMENTATION_GAPS.md'];
const closedGapArchive = documents['docs/history/CLOSED_GAPS.md'];
const architectureReadme = documents['docs/architecture/README.md'];
const architectureDecisionIndex = documents['docs/architecture/ADR_INDEX.md'];
const compositionAdr =
  documents['docs/architecture/ADR-003-repository-workspace-parallel-composition.md'];

requireMatch(
  'README.md',
  documents['README.md'],
  /No Supabase Cloud project is provisioned/i,
  'current database provisioning status is missing'
);
requireMatch(
  'README.md',
  documents['README.md'],
  /migration ledger.*proves.*applied/is,
  'migration application evidence boundary is missing'
);

for (const [pattern, message] of [
  [/^- Status: Canonical$/m, 'canonical product status is missing'],
  [/Repository\s*=\s*No-Code Collaboration Container/i, 'absolute Repository axiom is missing'],
  [/Repository Owner[\s\S]*User[\s\S]*Organization/i, 'typed Repository ownership is missing'],
  [/\/\{ownerSlug\}\/\{repositorySlug\}/, 'canonical Owner/Repository URL is missing'],
  [/^## Falsification conditions$/m, 'falsification conditions are missing'],
  [/^## Contract update protocol$/m, 'contract update protocol is missing'],
  [
    /reject the candidate[\s\S]*software-development-specific/i,
    'benchmark exclusion rule is missing'
  ],
  [
    /^## No-code data change and transfer semantics$[\s\S]*opaque text is never parsed or executed as code[\s\S]*allowlisted connectors\/endpoints/ims,
    'no-code structured-data change and transfer boundary is missing'
  ]
]) {
  requireMatch('docs/PRODUCT.md', product, pattern, message);
}

for (const [pattern, message] of [
  [
    /Repository Owner[\s\S]*exactly one User OR one Organization/i,
    'corrected Repository owner relationship is missing'
  ],
  [
    /After semantic admission, preserve the sanitized public and read-only authenticated owner\/Repository information architecture[\s\S]*Preserve resource relationships, not GitHub's historical route aliases/i,
    'sanitized owner/Repository benchmark and alias-normalization rule is missing'
  ],
  [
    /A benchmark feature whose usefulness depends[\s\S]*not translated, renamed, or retained/i,
    'ontology exclusion boundary is missing'
  ],
  [
    /Canonical Repository presentation is owner\/Repository header \+ primary navigation \+ one active child resource surface[\s\S]*supporting/i,
    'canonical Repository interaction model is missing'
  ],
  [
    /^## 18\. No-code Data Change and Transfer[\s\S]*shared envelope does not prove one generic `version_control` or `automation` aggregate/ims,
    'conditional no-code data-change and data-transfer ontology is missing'
  ]
]) {
  requireMatch('docs/ONTOLOGY.md', ontology, pattern, message);
}

requireMatch(
  'docs/domains/repository-collaboration.md',
  repositoryDomain,
  /Each Repository has exactly one active Owner relationship/i,
  'Repository ownership invariant is missing'
);
requireMatch(
  'docs/domains/repository-collaboration.md',
  repositoryDomain,
  /Repository deletion remains unavailable[\s\S]*Resources[\s\S]*Grants[\s\S]*history[\s\S]*recovery/i,
  'destructive Repository lifecycle rule is missing'
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
  /history\/CLOSED_GAPS\.md/,
  'closed-gap historical archive is not part of the documentation map'
);
requireMatch(
  'docs/README.md',
  documents['docs/README.md'],
  /architecture\/ADR_INDEX\.md/,
  'architecture decision-history router is not part of the documentation map'
);
requireMatch(
  'docs/README.md',
  documents['docs/README.md'],
  /open authorization or data-integrity gap/is,
  'production-blocking gap rule is missing'
);
requireMatch(
  'docs/README.md',
  documents['docs/README.md'],
  /selected provider is not proof of a provisioned environment/i,
  'provider/provisioning truth boundary is missing'
);

for (const [pattern, message] of [
  [/\/\{ownerSlug\}\/\{repositorySlug\}/, 'canonical Owner/Repository semantic route is missing'],
  [
    /one Owner\/Repository header, primary navigation, one active child resource surface[\s\S]*route-specific supporting regions/i,
    'canonical Repository presentation contract is missing'
  ],
  [
    /Repository reads cannot inherit an authenticated-only wrapper[\s\S]*public Repository visibility/is,
    'public Repository delivery boundary is missing'
  ],
  [
    /Organization-only semantic Repository route is not a valid compatibility UI/i,
    'obsolete Organization-only route rejection is missing'
  ],
  [
    /legacyPath[\s\S]*access-aware resolution/is,
    'stable-ID compatibility redirect boundary is missing'
  ]
]) {
  requireMatch('docs/architecture/README.md', architectureReadme, pattern, message);
}

for (const [pattern, message] of [
  [/ADR-003[\s\S]*Superseded/i, 'ADR-003 superseded status is missing'],
  [/ADR-008[\s\S]*Historical[\s\S]*superseded by ADR-010/i, 'ADR-008 historical status is missing'],
  [
    /ADR-010[\s\S]*Accepted current ownership\/routing identity/i,
    'ADR-010 current ownership/routing status is missing'
  ],
  [
    /ADR-011[\s\S]*Accepted[\s\S]*route-specific `@sidebar`, `@activity`, and `@modal` composition/i,
    'ADR-011 current supporting-composition status is missing'
  ]
]) {
  requireMatch('docs/architecture/ADR_INDEX.md', architectureDecisionIndex, pattern, message);
}

for (const [pattern, message] of [
  [/\*\*Superseded\.\*\*/m, 'ADR-003 is not explicitly superseded'],
  [
    /immediate replacement interaction model[\s\S]*one active content surface[\s\S]*four persistent panes/i,
    'ADR-003 immediate replacement and rejected persistent panes are missing'
  ],
  [
    /current canonical route identity is owned by ADR-010/i,
    'ADR-003 does not defer current route identity to ADR-010'
  ],
  [
    /current route-specific supporting composition is owned by ADR-011/i,
    'ADR-003 does not defer current supporting composition to ADR-011'
  ]
]) {
  requireMatch(
    'docs/architecture/ADR-003-repository-workspace-parallel-composition.md',
    compositionAdr,
    pattern,
    message
  );
}

for (const openGapId of ['GAP-OWNERSHIP-001', 'GAP-IDENTITY-001']) {
  requireMatch(
    'docs/IMPLEMENTATION_GAPS.md',
    gapRegister,
    new RegExp(`^### ${openGapId}\\b`, 'm'),
    `${openGapId} is missing`
  );
  requireMatch(
    'docs/IMPLEMENTATION_GAPS.md',
    gapRegister,
    new RegExp(`### ${openGapId}[\\s\\S]*?- Status: Open`, 'i'),
    `${openGapId} must remain open until its closure evidence is complete`
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
for (const closedGapId of [
  'GAP-AUTH-001',
  'GAP-LIFECYCLE-001',
  'GAP-LIFECYCLE-002',
  'GAP-PAGE-001'
]) {
  forbidMatch(
    'docs/IMPLEMENTATION_GAPS.md',
    gapRegister,
    new RegExp(`^### ${closedGapId}\\b`, 'm'),
    `${closedGapId} detail belongs in docs/history/CLOSED_GAPS.md, not the current register`
  );
  requireMatch(
    'docs/IMPLEMENTATION_GAPS.md',
    gapRegister,
    new RegExp(`\\b${closedGapId}\\b`),
    `${closedGapId} archive index entry is missing`
  );
  requireMatch(
    'docs/history/CLOSED_GAPS.md',
    closedGapArchive,
    new RegExp(`^### ${closedGapId}\\b`, 'm'),
    `${closedGapId} historical closure section is missing`
  );
  requireMatch(
    'docs/history/CLOSED_GAPS.md',
    closedGapArchive,
    new RegExp(`### ${closedGapId}[\\s\\S]*?- Status: Closed`, 'i'),
    `${closedGapId} must retain its verified closed status`
  );
}

requireMatch(
  'docs/history/CLOSED_GAPS.md',
  closedGapArchive,
  /### GAP-AUTH-001[\s\S]*?02f33f4ba75cc250378a6fba38f4b926eb62c355[\s\S]*?31505215295/i,
  'GAP-AUTH-001 exact implementation and CI closure evidence is missing'
);
requireMatch(
  'docs/history/CLOSED_GAPS.md',
  closedGapArchive,
  /### GAP-LIFECYCLE-001[\s\S]*?d8af47d0b3c6225c79efbd708106f42176e443ad[\s\S]*?31524256329/i,
  'GAP-LIFECYCLE-001 exact implementation and CI closure evidence is missing'
);
requireMatch(
  'docs/history/CLOSED_GAPS.md',
  closedGapArchive,
  /### GAP-LIFECYCLE-002[\s\S]*?c5ab97474e8c3f538fd5966a70d40450048a1952[\s\S]*?31567572157/i,
  'GAP-LIFECYCLE-002 exact implementation and CI closure evidence is missing'
);
requireMatch(
  'docs/history/CLOSED_GAPS.md',
  closedGapArchive,
  /### GAP-PAGE-001[\s\S]*?a6bba75bb08cd0c6742ad6932e103698a9ab0bf2[\s\S]*?31577420974/i,
  'GAP-PAGE-001 exact implementation and CI closure evidence is missing'
);

const lifecycleAdrPath = 'docs/architecture/ADR-005-local-first-supabase-lifecycle.md';
const lifecycleAdr = documents[lifecycleAdrPath];
for (const [pattern, message] of [
  [/^- Status: Accepted$/m, 'ADR is not accepted'],
  [/Migration artifact\s*≠\s*Applied deployment/u, 'migration/deployment distinction is missing'],
  [
    /Selected provider\s*≠\s*Provisioned environment/u,
    'provider/provisioning distinction is missing'
  ],
  [
    /Local verification\s*≠\s*Production validation/u,
    'verification/production distinction is missing'
  ],
  [/^## Initial remote baseline gate$/m, 'initial remote baseline gate is missing']
]) {
  requireMatch(lifecycleAdrPath, lifecycleAdr, pattern, message);
}

requireMatch(
  'docs/domains/DOMAIN_TEMPLATE.md',
  documents['docs/domains/DOMAIN_TEMPLATE.md'],
  /^## Known implementation gaps$/m,
  'domain contracts do not require explicit implementation gaps'
);
requireMatch(
  'docs/domains/access-authority.md',
  documents['docs/domains/access-authority.md'],
  /Operation capability[\s\S]*delegation authority[\s\S]*distinct/i,
  'delegation authority distinction is missing'
);
requireMatch(
  'docs/domains/identity-lifecycle.md',
  documents['docs/domains/identity-lifecycle.md'],
  /Authentication\s*≠\s*Authorization/,
  'identity and authorization separation is missing'
);
requireMatch(
  'docs/domains/identity-lifecycle.md',
  documents['docs/domains/identity-lifecycle.md'],
  /Registration never creates Organization membership, Team membership, Repository Grant, or Resource authority/,
  'registration authority invariant is missing'
);

for (const [path, content, requiredPatterns] of [
  [
    'docs/domains/structured-data-change.md',
    structuredDataChangeDomain,
    [
      [/^- Status: Candidate$/m, 'candidate status is missing'],
      [
        /Every Data Commit, Data Branch, and Change Proposal belongs to exactly one Repository/i,
        'single-Repository change boundary is missing'
      ],
      [
        /no generic script, expression, executable payload, or unbounded patch language/i,
        'non-executable change-operation boundary is missing'
      ],
      [
        /Applying through a Change Proposal yields the same authorization and validation result as issuing the equivalent direct commands/i,
        'authorization-equivalence invariant is missing'
      ]
    ]
  ],
  [
    'docs/domains/data-exchange.md',
    dataExchangeDomain,
    [
      [/^- Status: Candidate$/m, 'candidate status is missing'],
      [
        /Every Data Transfer and Data Capsule belongs to exactly one Repository/i,
        'single-Repository exchange boundary is missing'
      ],
      [
        /No payload field is interpreted as source code, shell, script, executable expression, or workflow instruction/i,
        'non-executable transfer boundary is missing'
      ],
      [
        /Connector credentials are represented only by secret reference/i,
        'secret-reference boundary is missing'
      ]
    ]
  ]
]) {
  for (const [pattern, message] of requiredPatterns) {
    requireMatch(path, content, pattern, message);
  }
}

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
requireMatch(
  'docs/operations/RUNBOOK.md',
  documents['docs/operations/RUNBOOK.md'],
  /No Supabase Cloud project is provisioned/i,
  'Cloud provisioning status is missing'
);

const result = {
  ok: failures.length === 0,
  requiredDocuments: requiredDocuments.length,
  currentGaps: 2,
  archivedClosedGaps: 4,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
