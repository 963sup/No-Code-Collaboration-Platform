import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

const requireText = (path, content, expected, message) => {
  if (!content.includes(expected)) failures.push(`${path}: ${message}`);
};

const requireMatch = (path, content, pattern, message) => {
  if (!pattern.test(content)) failures.push(`${path}: ${message}`);
};

const forbidMatch = (path, content, pattern, message) => {
  if (pattern.test(content)) failures.push(`${path}: ${message}`);
};

const skillRoot = '.agents/skills/github-semantic-reverse';
const snapshotPath = `${skillRoot}/REFERENCE_SNAPSHOT.md`;
const glossaryPath = `${skillRoot}/GLOSSARY.md`;
const reportPath = `${skillRoot}/audit-reports/2026-08-16.md`;
const resolutionPath =
  '.codex/tasks/collaboration-relationship-kernel-repair/EXECUTION_RESOLUTION.md';
const inputRoot = '.codex/tasks/collaboration-relationship-kernel-repair/input';

const currentContracts = {
  root: 'AGENTS.md',
  product: 'docs/PRODUCT.md',
  ontology: 'docs/ONTOLOGY.md',
  docsMap: 'docs/README.md',
  architecture: 'docs/architecture/README.md',
  adrIndex: 'docs/architecture/ADR_INDEX.md',
  adr013: 'docs/architecture/ADR-013-core-no-code-data-semantic-envelope.md',
  adr014: 'docs/architecture/ADR-014-current-state-collaboration-kernel.md',
  domains: 'docs/domains/README.md',
  structuredChange: 'docs/domains/structured-data-change.md',
  dataMovement: 'docs/domains/data-exchange.md',
  gaps: 'docs/IMPLEMENTATION_GAPS.md'
};

for (const path of [
  snapshotPath,
  glossaryPath,
  reportPath,
  resolutionPath,
  ...Object.values(currentContracts)
]) {
  if (!existsSync(resolve(root, path))) {
    failures.push(`${path}: required semantic contract is missing`);
  }
}

const snapshot = read(snapshotPath);
for (const [expected, message] of [
  ['81ade08c26f13325c0cde8a23cd3bfb85bd0778e', 'locked github/docs revision is missing'],
  ['2026-08-16', 'locked date is missing'],
  ['`content/`, `src/`', 'locked coverage is missing'],
  ['must not move during the cycle', 'mid-cycle update prohibition is missing']
]) {
  requireText(snapshotPath, snapshot, expected, message);
}

const glossary = read(glossaryPath);
for (const concept of [
  '`commit`',
  '`branch`',
  '`diff`',
  '`merge`',
  '`fork`',
  '`rebase`',
  '`cherry-pick`',
  '`tag`',
  '`HEAD`'
]) {
  requireText(glossaryPath, glossary, concept, `canonical outcome is missing for ${concept}`);
}
for (const expected of [
  'Product, Domain, Application, API, persistence, URL/IA, and user-facing UI',
  'Benchmark evidence, repair specifications, audit reports, and Git/GitHub engineering workflow',
  'State Transition',
  'Activity Event',
  'Repository Duplication'
]) {
  requireText(glossaryPath, glossary, expected, `semantic boundary is missing: ${expected}`);
}

const documents = Object.fromEntries(
  Object.entries(currentContracts).map(([name, path]) => [name, read(path)])
);

for (const [pattern, message] of [
  [/Repository = No-Code Collaboration Container/i, 'absolute Product axiom is missing'],
  [/Current State \+ Activity Event/i, 'current-state collaboration result is missing'],
  [/Expected Revision/i, 'concurrency precondition is missing'],
  [/No source-control-shaped Data Change/i, 'source-control-shaped Product rejection is missing'],
  [/typed transfer or independent Repository duplication requires a separately accepted/i, 'future transfer/copy admission gate is missing']
]) {
  requireMatch(currentContracts.root, documents.root, pattern, message);
}

for (const [pattern, message] of [
  [/^- Status: Canonical$/m, 'canonical status is missing'],
  [/^## Current-state collaboration kernel$/m, 'current-state kernel section is missing'],
  [/Actor \+ Authority \+ Command \+ Expected Revision[\s\S]*Current State \+ Activity Event/i, 'kernel law is missing'],
  [/No generic data exchange or Repository ancestry capability is currently accepted/i, 'deferred movement/copy boundary is missing'],
  [/No source-control-shaped Product primitive may be recovered through renaming/i, 'renaming rejection invariant is missing']
]) {
  requireMatch(currentContracts.product, documents.product, pattern, message);
}

for (const [pattern, message] of [
  [/^## 15\. State Transition/m, 'State Transition ontology is missing'],
  [/^## 16\. Activity Event/m, 'Activity Event ontology is missing'],
  [/^## 18\. State Comparison/m, 'State Comparison boundary is missing'],
  [/^## 19\. Typed data movement/m, 'typed movement deferral is missing'],
  [/^## 20\. Repository duplication/m, 'Repository duplication deferral is missing']
]) {
  requireMatch(currentContracts.ontology, documents.ontology, pattern, message);
}

requireMatch(
  currentContracts.adr013,
  documents.adr013,
  /^- Status: Superseded by ADR-014$/m,
  'ADR-013 must be historical only'
);
requireMatch(
  currentContracts.adr014,
  documents.adr014,
  /^- Status: Accepted$/m,
  'ADR-014 accepted status is missing'
);
for (const [pattern, message] of [
  [/Concrete Resource Command \+ Expected Revision/i, 'ADR-014 command/revision kernel is missing'],
  [/Authoritative Current State \+ Activity Event/i, 'ADR-014 current-state/Evidence result is missing'],
  [/No generic history graph/i, 'ADR-014 rejected-history boundary is missing'],
  [/Future typed transfer gate/i, 'ADR-014 transfer gate is missing'],
  [/Future Repository duplication gate/i, 'ADR-014 duplication gate is missing']
]) {
  requireMatch(currentContracts.adr014, documents.adr014, pattern, message);
}

for (const [path, content, pattern, message] of [
  [
    currentContracts.structuredChange,
    documents.structuredChange,
    /^- Status: Superseded by the current-state Resource command kernel$/m,
    'structured-data-change must be superseded'
  ],
  [
    currentContracts.dataMovement,
    documents.dataMovement,
    /^- Status: Deferred; no accepted Product capability or concrete lifecycle$/m,
    'data-exchange must be deferred'
  ]
]) {
  requireMatch(path, content, pattern, message);
}

const currentTruthPaths = [
  currentContracts.root,
  currentContracts.product,
  currentContracts.ontology,
  currentContracts.docsMap,
  currentContracts.architecture,
  currentContracts.adrIndex,
  currentContracts.domains,
  currentContracts.structuredChange,
  currentContracts.dataMovement,
  currentContracts.gaps
];

for (const path of currentTruthPaths) {
  const content = read(path);
  for (const [pattern, message] of [
    [/Accepted semantic envelope/i, 'superseded accepted-envelope status remains'],
    [/Data Branch selection/i, 'alternate-state-line authority language remains'],
    [/accepted Data Change\/Exchange\/Repository Derivation/i, 'old accepted envelope remains'],
    [/Data Commit, Data Branch, Data Diff/i, 'old Product concept cluster remains'],
    [/Repository Derivation semantic envelope/i, 'old Repository ancestry envelope remains']
  ]) {
    forbidMatch(path, content, pattern, message);
  }
}

const report = read(reportPath);
for (const category of [
  '## newly_passed',
  '## maintained_passed',
  '## revoked',
  '## not_passed'
]) {
  requireText(reportPath, report, category, `audit category is missing: ${category}`);
}
requireText(reportPath, report, 'Overall status: **not passed**', 'audit status is not explicit');
requireText(reportPath, report, 'Source-of-truth synchronization log', 'mirror arbitration log is missing');
requireText(reportPath, report, 'Canonical Product/Ontology correction', 'second-stage correction is not recorded');

const resolution = read(resolutionPath);
for (const expected of [
  'authoritative behavior and convergence requirements',
  'existing single owner',
  'Repository code and documentation are authoritative',
  'Linear and Notion are mirrors'
]) {
  requireText(resolutionPath, resolution, expected, `execution resolution is missing: ${expected}`);
}

for (const path of [
  `${inputRoot}/collaboration-relationship-kernel-repair-v1.toml`,
  `${inputRoot}/collaboration-relationship-kernel-repair-v2.toml`,
  `${inputRoot}/collaboration-relationship-kernel-repair-v2.md`
]) {
  if (!existsSync(resolve(root, path))) failures.push(`${path}: preserved task input is missing`);
}

for (const path of [
  '.codex/agents/collaboration-relationship-kernel-repair.toml',
  '.codex/agents/collaboration-relationship-kernel-repair-v2.toml',
  '.codex/agents/collaboration-relationship-kernel-repair-v2.md'
]) {
  if (existsSync(resolve(root, path))) {
    failures.push(`${path}: task specification remains in executable agent discovery`);
  }
}

const result = {
  ok: failures.length === 0,
  snapshot: snapshotPath,
  glossary: glossaryPath,
  report: reportPath,
  currentContracts: Object.keys(currentContracts).length,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
