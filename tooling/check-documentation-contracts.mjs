import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';

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

const skippedDirectories = new Set([
  '.git',
  '.next',
  '.turbo',
  'coverage',
  'node_modules',
  'playwright-report',
  'test-results'
]);

function walkFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && skippedDirectories.has(entry.name)) continue;

    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(absolute));
    else if (entry.isFile()) files.push(absolute);
  }

  return files;
}

function repositoryPath(absolute) {
  return absolute.slice(root.length + 1).replaceAll('\\', '/');
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
  'docs/architecture/ADR-011-github-surface-parallel-composition.md',
  'docs/architecture/ADR-012-collaboration-lifecycle-and-projection-boundaries.md',
  'docs/architecture/ADR-013-core-no-code-data-semantic-envelope.md',
  'docs/benchmarks/GITHUB_PUBLIC_URL_UI_UX.md',
  'docs/domains/DOMAIN_TEMPLATE.md',
  'docs/domains/README.md',
  'docs/domains/access-authority.md',
  'docs/domains/data-exchange.md',
  'docs/domains/identity-lifecycle.md',
  'docs/domains/structured-data-change.md',
  'docs/domains/repository-collaboration.md',
  'docs/operations/AGENTS.md',
  'docs/operations/RUNBOOK.md',
  'apps/web/README.md',
  '.playwright-mcp/github-ui-ux.md',
  '.playwright-mcp/github-urls.json'
];

const documents = Object.fromEntries(requiredDocuments.map((path) => [path, read(path)]));
for (const forbiddenConstitutionPath of ['CONSTITUTION.md', 'docs/CONSTITUTION.md']) {
  if (existsSync(resolve(root, forbiddenConstitutionPath))) {
    failures.push(
      `${forbiddenConstitutionPath}: docs/PRODUCT.md must remain the only Product constitution`
    );
  }
}

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
const semanticEnvelopeAdr =
  documents['docs/architecture/ADR-013-core-no-code-data-semantic-envelope.md'];
const benchmarkSummary = documents['docs/benchmarks/GITHUB_PUBLIC_URL_UI_UX.md'];
const benchmarkEvidenceIndex = documents['.playwright-mcp/github-ui-ux.md'];

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
  ],
  [
    /structural containment[\s\S]*does not create another collaboration Container or authority boundary/i,
    'structural containment/Container boundary is missing'
  ],
  [
    /Identity establishes a trusted Actor[\s\S]*Access resolves effective authority/i,
    'Identity/Access non-confusion law is missing'
  ],
  [
    /Governance constrains future action[\s\S]*Audit[\s\S]*past action/i,
    'Governance/Audit time-direction law is missing'
  ],
  [
    /Repository Derivation[\s\S]*independent Owner and authority[\s\S]*secrets, Sessions, and Grants are not copied by default/i,
    'Repository Derivation independence boundary is missing'
  ],
  [
    /Commit.*Branch.*Diff.*Pull Request.*Actions.*Gist.*Fork.*Pull.*Push[\s\S]*external benchmark aliases only/is,
    'external benchmark alias boundary is missing'
  ]
]) {
  requireMatch('docs/PRODUCT.md', product, pattern, message);
}

const productAxiomMatches =
  product.match(/Repository\s*=\s*No-Code Collaboration Container/gi) ?? [];
if (productAxiomMatches.length !== 1) {
  failures.push(
    `docs/PRODUCT.md: expected exactly one Product axiom declaration, found ${productAxiomMatches.length}`
  );
}

for (const semantic of [
  'Data Commit',
  'Data Branch',
  'Data Diff',
  'Change Proposal',
  'Data Transfer',
  'Data Capsule',
  'Repository Derivation'
]) {
  requireMatch(
    'docs/PRODUCT.md',
    product,
    new RegExp(`\\*\\*${semantic}\\*\\*`),
    `${semantic} accepted semantic envelope is missing`
  );
}

forbidMatch(
  'docs/PRODUCT.md',
  product,
  /GitHub Pull Request, Gist, Commit, Branch, Diff, Code, Actions, Source, and code-review surfaces are rejected/i,
  'old blanket rejection incorrectly rejects accepted no-code semantics'
);

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
    /^## 18\. No-code Data Change, Exchange, and Derivation[\s\S]*shared envelope does not prove one generic `version_control` or `automation` aggregate/ims,
    'accepted no-code data-change, exchange, and derivation ontology is missing'
  ],
  [
    /Account.*not a generic Entity[\s\S]*Identity establishes a trusted User Actor[\s\S]*Access resolves effective Capability/is,
    'Account and Identity/Access non-confusion boundary is missing'
  ],
  [
    /Governance constrains future actions[\s\S]*Audit explains or proves past actions/i,
    'Governance/Audit ontology boundary is missing'
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
  ],
  [
    /Data Commit, Data Branch, Data Diff, Change Proposal, Data Transfer, Data Capsule, and Repository Derivation[\s\S]*authorize no concrete lifecycle, persistence, API, route, Capability, or UI/i,
    'accepted semantic envelope/architecture non-implementation boundary is missing'
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
  ],
  [
    /ADR-012[\s\S]*item 10 partially superseded by ADR-013[\s\S]*replaces only its rejection\/deferral of no-code Data semantics/i,
    'ADR-012 precise partial supersession is missing'
  ],
  [
    /ADR-013[\s\S]*Accepted[\s\S]*without authorizing concrete lifecycle or implementation/i,
    'ADR-013 accepted semantic-envelope decision is missing'
  ]
]) {
  requireMatch('docs/architecture/ADR_INDEX.md', architectureDecisionIndex, pattern, message);
}

for (const [pattern, message] of [
  [/^- Status: Accepted$/m, 'ADR-013 is not accepted'],
  [
    /ADR-011 is refined[\s\S]*conditional Data-semantics admission[\s\S]*accepted Product envelope/i,
    'ADR-011 refinement boundary is missing'
  ],
  [
    /ADR-012 Decision item 10 is superseded only[\s\S]*Source Code, Git mechanics, code review, arbitrary execution, and CI\/CD remains? current/i,
    'ADR-012 partial supersession boundary is missing'
  ],
  [
    /authorizes no Domain entity, schema, migration, Capability, API, route, UI[\s\S]*generic version-control engine[\s\S]*automation runtime/i,
    'semantic acceptance/implementation boundary is missing'
  ],
  [
    /Branch selection[\s\S]*Proposal (?:participation or )?approval[\s\S]*Project filter[\s\S]*Notification state[\s\S]*do not change effective authority/i,
    'non-authoritative Branch, Proposal, Project, and Notification cases are missing'
  ],
  [
    /script[\s\S]*expression[\s\S]*Git ref[\s\S]*(?:code|executable) payload[\s\S]*secret (?:material|value)[\s\S]*cross-Repository authority bypass/i,
    'required Data rejection fixtures are missing'
  ]
]) {
  requireMatch(
    'docs/architecture/ADR-013-core-no-code-data-semantic-envelope.md',
    semanticEnvelopeAdr,
    pattern,
    message
  );
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

const currentTruthDocuments = [
  ['docs/PRODUCT.md', product],
  ['docs/ONTOLOGY.md', ontology],
  ['docs/architecture/README.md', architectureReadme],
  ['docs/domains/README.md', documents['docs/domains/README.md']],
  ['docs/IMPLEMENTATION_GAPS.md', gapRegister]
];

for (const [path, content] of currentTruthDocuments) {
  for (const [pattern, message] of [
    [/conditionally admitted only/i, 'old conditional Data-semantics admission remains'],
    [
      /retained only as non-current research evidence/i,
      'accepted Data envelope is mislabeled as research'
    ],
    [
      /future typed data proposals?\/capsules? require new target vocabulary/i,
      'old future-only Data-semantics rejection remains'
    ]
  ]) {
    forbidMatch(path, content, pattern, message);
  }
}

for (const [pattern, message] of [
  [
    /canonical Repository URL is `\/\{ownerSlug\}\/\{repositorySlug\}`/i,
    'canonical Repository delivery URL is missing'
  ],
  [
    /\/app\/repositories\/\[repositoryId\]\/\*\*.*redirect-only compatibility/is,
    'stable-ID compatibility route is not redirect-only'
  ]
]) {
  requireMatch('apps/web/README.md', documents['apps/web/README.md'], pattern, message);
}
forbidMatch(
  'apps/web/README.md',
  documents['apps/web/README.md'],
  /four Parallel Route slots|@navigation[\s\S]*@workspace[\s\S]*@context[\s\S]*@activity/i,
  'obsolete four-slot Repository workspace remains'
);

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
      [
        /^- Status: Accepted semantic envelope; Candidate concrete lifecycle$/m,
        'semantic-envelope/candidate-lifecycle status is missing'
      ],
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
      [
        /^- Status: Accepted semantic envelope; Candidate concrete lifecycle$/m,
        'semantic-envelope/candidate-lifecycle status is missing'
      ],
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

for (const [path, content] of [
  ['docs/benchmarks/GITHUB_PUBLIC_URL_UI_UX.md', benchmarkSummary],
  ['.playwright-mcp/github-ui-ux.md', benchmarkEvidenceIndex]
]) {
  requireMatch(
    path,
    content,
    /github-urls\.json/i,
    'authoritative benchmark manifest link is missing'
  );
  forbidMatch(
    path,
    content,
    /\b\d+\s+(?:URL[- ]resource inventories|resource inventories|component inventories|screenshots)\b/i,
    'handwritten benchmark inventory count is forbidden'
  );
}

const benchmarkManifestPath = '.playwright-mcp/github-urls.json';
let benchmarkManifest = null;
try {
  benchmarkManifest = JSON.parse(documents[benchmarkManifestPath]);
} catch (error) {
  failures.push(`${benchmarkManifestPath}: invalid JSON: ${error.message}`);
}

let benchmarkResources = 0;
let benchmarkComponents = 0;
let benchmarkScreenshots = 0;
if (benchmarkManifest) {
  const resources = benchmarkManifest.resourceInventories ?? [];
  const components = benchmarkManifest.componentInventories ?? [];
  const inventories = [...resources, ...components];
  benchmarkResources = resources.length;
  benchmarkComponents = components.length;

  if (benchmarkManifest.credentialDataStored !== false) {
    failures.push(`${benchmarkManifestPath}: credentialDataStored must be false`);
  }

  for (const inventory of inventories) {
    const inventoryPath = `.playwright-mcp/${inventory.path}`;
    const inventoryAbsolute = resolve(root, inventoryPath);
    if (!existsSync(inventoryAbsolute)) {
      failures.push(`${benchmarkManifestPath}: missing inventory ${inventoryPath}`);
      continue;
    }

    const sidecarPath = resolve(dirname(inventoryAbsolute), 'ui-ux.md');
    if (!existsSync(sidecarPath)) {
      failures.push(
        `${benchmarkManifestPath}: ${repositoryPath(sidecarPath)} is missing for ${inventory.path}`
      );
    }

    let inventoryEntries = null;
    try {
      inventoryEntries = JSON.parse(readFileSync(inventoryAbsolute, 'utf8'));
    } catch (error) {
      failures.push(`${inventoryPath}: invalid JSON: ${error.message}`);
    }
    if (!Array.isArray(inventoryEntries)) {
      failures.push(`${inventoryPath}: inventory must be an array`);
    } else if (
      inventoryEntries.some(
        (entry) =>
          /127\.0\.0\.1|localhost/i.test(`${entry.url ?? ''} ${entry.canonicalUrl ?? ''}`) ||
          /^target\b/i.test(entry.resourceType ?? '')
      )
    ) {
      failures.push(
        `${inventoryPath}: target/local implementation evidence is mixed into benchmark`
      );
    }

    const screenshotDirectory = resolve(dirname(inventoryAbsolute), 'screenshots');
    const actualScreenshots = existsSync(screenshotDirectory)
      ? readdirSync(screenshotDirectory, { withFileTypes: true }).filter(
          (entry) =>
            entry.isFile() &&
            extname(entry.name).toLowerCase() === '.png' &&
            !entry.name.startsWith('target-')
        ).length
      : 0;
    const declaredScreenshots = Number(inventory.screenshots);
    if (!Number.isInteger(declaredScreenshots) || declaredScreenshots < 0) {
      failures.push(`${benchmarkManifestPath}: ${inventory.path} has invalid screenshot count`);
    } else {
      benchmarkScreenshots += declaredScreenshots;
      if (declaredScreenshots !== actualScreenshots) {
        failures.push(
          `${benchmarkManifestPath}: ${inventory.path} declares ${declaredScreenshots} screenshots but ${actualScreenshots} non-target PNG files exist`
        );
      }
    }
  }

  if (benchmarkManifest.screenshotCount !== benchmarkScreenshots) {
    failures.push(
      `${benchmarkManifestPath}: screenshotCount ${benchmarkManifest.screenshotCount} does not equal derived inventory total ${benchmarkScreenshots}`
    );
  }
}

const markdownFiles = walkFiles(root).filter(
  (absolute) => extname(absolute).toLowerCase() === '.md'
);
let relativeMarkdownLinks = 0;
for (const absolute of markdownFiles) {
  const path = repositoryPath(absolute);
  const content = readFileSync(absolute, 'utf8');
  const linkPattern = /!?\[[^\]]*\]\((<[^>]+>|[^)\n]+)\)/g;

  for (const match of content.matchAll(linkPattern)) {
    let target = match[1].trim();
    if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1);
    else target = target.split(/\s+(?=["'])/, 1)[0];

    if (
      !target ||
      target.startsWith('#') ||
      target.startsWith('/') ||
      target.startsWith('\\') ||
      /^[a-z][a-z\d+.-]*:/i.test(target)
    ) {
      continue;
    }

    target = target.split('#', 1)[0].split('?', 1)[0];
    if (!target) continue;

    try {
      target = decodeURIComponent(target);
    } catch {
      failures.push(`${path}: malformed percent-encoding in Markdown link ${match[1]}`);
      continue;
    }

    relativeMarkdownLinks += 1;
    const resolvedTarget = resolve(dirname(absolute), target);
    if (!existsSync(resolvedTarget)) {
      failures.push(`${path}: relative Markdown link target is missing: ${target}`);
    }
  }
}

for (const absolute of markdownFiles.filter((path) =>
  repositoryPath(path).startsWith('.playwright-mcp/')
)) {
  const path = repositoryPath(absolute);
  const content = readFileSync(absolute, 'utf8');
  for (const [pattern, message] of [
    [/^## Target comparison/im, 'target comparison is mixed into benchmark evidence'],
    [/^## Proposed App Router/im, 'target architecture is mixed into benchmark evidence'],
    [
      /^## Existing architecture conflicts/im,
      'implementation status is mixed into benchmark evidence'
    ],
    [
      /^## Runtime and shadcn checkpoint/im,
      'local runtime snapshot is mixed into benchmark evidence'
    ],
    [
      /current target slice/i,
      'current target implementation snapshot is mixed into benchmark evidence'
    ]
  ]) {
    forbidMatch(path, content, pattern, message);
  }
}

const result = {
  ok: failures.length === 0,
  requiredDocuments: requiredDocuments.length,
  currentGaps: 2,
  archivedClosedGaps: 4,
  markdownFiles: markdownFiles.length,
  relativeMarkdownLinks,
  benchmarkResources,
  benchmarkComponents,
  benchmarkScreenshots,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
