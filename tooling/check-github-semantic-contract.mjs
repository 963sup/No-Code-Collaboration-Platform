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
const section = (content, heading) => {
  const marker = `### \`${heading}\``;
  const start = content.indexOf(marker);
  if (start < 0) return '';
  const next = content.indexOf('\n### `', start + marker.length);
  return next < 0 ? content.slice(start) : content.slice(start, next);
};
const answer = (content) => content.match(/\*\*Required answer:\*\*\s*`([^`]+)`/)?.[1] ?? '';

const skillRoot = '.agents/skills/github-semantic-reverse';
const files = {
  skill: `${skillRoot}/SKILL.md`,
  snapshot: `${skillRoot}/REFERENCE_SNAPSHOT.md`,
  glossary: `${skillRoot}/GLOSSARY.md`,
  matrix: `${skillRoot}/BENCHMARK_CONCEPT_MATRIX.md`,
  executableAudit: `${skillRoot}/EXECUTABLE_SEMANTIC_AUDIT.md`,
  report: `${skillRoot}/audit-reports/2026-08-16.md`,
  resolution: '.codex/tasks/collaboration-relationship-kernel-repair/EXECUTION_RESOLUTION.md',
  product: 'docs/PRODUCT.md',
  ontology: 'docs/ONTOLOGY.md',
  architecture: 'docs/architecture/README.md',
  adr013: 'docs/architecture/ADR-013-core-no-code-data-semantic-envelope.md',
  adr014: 'docs/architecture/ADR-014-current-state-collaboration-kernel.md',
  accessDomain: 'docs/domains/access-authority.md',
  structuredChange: 'docs/domains/structured-data-change.md',
  dataMovement: 'docs/domains/data-exchange.md',
  accessPage: 'apps/web/src/app/(owner)/[ownerSlug]/[repositorySlug]/settings/access/page.tsx',
  issueDetail: 'apps/web/src/app/(owner)/[ownerSlug]/[repositorySlug]/_components/issue-detail.tsx'
};

for (const path of Object.values(files)) {
  if (!existsSync(resolve(root, path)))
    failures.push(`${path}: required semantic contract is missing`);
}
const contents = Object.fromEntries(Object.entries(files).map(([key, path]) => [key, read(path)]));

for (const expected of [
  '81ade08c26f13325c0cde8a23cd3bfb85bd0778e',
  '2026-08-16',
  '`content/`, `src/`',
  'must not move during the cycle',
  'enumerates eight names'
]) {
  requireText(
    files.snapshot,
    contents.snapshot,
    expected,
    `locked snapshot boundary is missing: ${expected}`
  );
}

for (const concept of [
  'Enterprise',
  'Organization',
  'Team',
  'Collaborator',
  'User / Social',
  'Wiki',
  'Projects',
  'Issues'
]) {
  requireMatch(
    files.matrix,
    contents.matrix,
    new RegExp(`\\| ${concept.replace('/', '\\/')} \\|`),
    `benchmark matrix row is missing: ${concept}`
  );
}

const excluded = [
  'commit',
  'branch',
  'diff',
  'merge',
  'fork',
  'rebase',
  'cherry-pick',
  'tag',
  'HEAD'
];
for (const concept of excluded) {
  const conceptSection = section(contents.glossary, concept);
  if (!conceptSection) {
    failures.push(`${files.glossary}: section is missing for ${concept}`);
    continue;
  }
  for (const label of [
    '**Target outcome:**',
    '**Data-versioning classification:**',
    '**Verification question:**',
    '**Required answer:**',
    '**Forbidden answer shape:**'
  ]) {
    requireText(files.glossary, conceptSection, label, `${concept} is missing ${label}`);
  }
  if (!answer(conceptSection)) {
    failures.push(`${files.glossary}: ${concept} required answer must be one backticked sentence`);
  }
}

const commitSection = section(contents.glossary, 'commit');
const commitAnswer = answer(commitSection);
if (
  commitAnswer !==
  'The Page Current State now contains the accepted title and body at State Revision 12.'
) {
  failures.push(`${files.glossary}: commit answer is not the state-only criterion`);
}
if (/Activity Event|who|when|changed|history|snapshot|author|message/i.test(commitAnswer)) {
  failures.push(`${files.glossary}: commit answer contains historical narration`);
}
requireText(
  files.glossary,
  contents.glossary,
  '`version`, `expectedVersion`, and `expected_version`',
  'current implementation naming boundary is missing'
);

for (const [pattern, message] of [
  [/Repository = No-Code Collaboration Container/i, 'Repository axiom is missing'],
  [/^## Current-state collaboration kernel$/m, 'current-state kernel is missing'],
  [
    /No source-control-shaped Product primitive may be recovered through renaming/i,
    'renaming rejection is missing'
  ]
]) {
  requireMatch(files.product, contents.product, pattern, message);
}
for (const [pattern, message] of [
  [/^## 15\. State Transition/m, 'State Transition ontology is missing'],
  [/^## 16\. Activity Event/m, 'Activity Event ontology is missing'],
  [/^## 18\. State Comparison/m, 'State Comparison boundary is missing']
]) {
  requireMatch(files.ontology, contents.ontology, pattern, message);
}
requireMatch(
  files.adr013,
  contents.adr013,
  /^- Status: Superseded by ADR-014$/m,
  'ADR-013 must remain superseded'
);
requireMatch(
  files.adr014,
  contents.adr014,
  /^- Status: Accepted$/m,
  'ADR-014 must remain accepted'
);
requireMatch(
  files.structuredChange,
  contents.structuredChange,
  /^- Status: Superseded by the current-state Resource command kernel$/m,
  'generic structured-data-change Domain must remain superseded'
);
requireMatch(
  files.dataMovement,
  contents.dataMovement,
  /^- Status: Deferred; no accepted Product capability or concrete lifecycle$/m,
  'data movement must remain deferred'
);

for (const expected of [
  'Collaborator(user, repository)',
  'derived classification',
  'Direct User Grant',
  'Collaborator ≠ Direct User Grant',
  'Assignment / mention / participation ≠ authority'
]) {
  requireText(
    files.accessDomain,
    contents.accessDomain,
    expected,
    `Access Authority boundary is missing: ${expected}`
  );
}
forbidMatch(
  files.accessDomain,
  contents.accessDomain,
  /Direct collaborator relationship/i,
  'derived Collaborator remains modeled as the causal Grant relationship'
);

for (const expected of [
  '<CardTitle>Direct User grants</CardTitle>',
  'Collaborator is derived only after effective access is resolved',
  'Grant access',
  "placeholder='user-name'"
]) {
  requireText(
    files.accessPage,
    contents.accessPage,
    expected,
    `access UI correction is missing: ${expected}`
  );
}
for (const [pattern, message] of [
  [/Direct collaborators/i, 'access UI still labels Grants as collaborators'],
  [/Add collaborator/i, 'access UI still treats collaborator as a mutation command'],
  [/collaborator-name/i, 'access UI retains collaborator-shaped target placeholder']
]) {
  forbidMatch(files.accessPage, contents.accessPage, pattern, message);
}
requireText(
  files.issueDetail,
  contents.issueDetail,
  'Opened by {issue.createdBy}',
  'Issue UI does not attribute the actual creator'
);
forbidMatch(
  files.issueDetail,
  contents.issueDetail,
  /Collaborator opened this Issue/i,
  'Issue UI still infers collaborator identity from authorship'
);

for (const expected of [
  'Semantic result: **passed with two verification/deployment follow-ups; no excluded Product primitive found**',
  'Corrected `commit` scenario revalidation',
  'Current-state revision boundary',
  'Product benchmark executable matrix',
  'Direct User grants',
  'Opened by {issue.createdBy}',
  'authorization/history boundary'
]) {
  requireText(
    files.executableAudit,
    contents.executableAudit,
    expected,
    `executable audit evidence is missing: ${expected}`
  );
}

for (const category of ['## newly_passed', '## maintained_passed', '## revoked', '## not_passed']) {
  requireText(
    files.report,
    contents.report,
    category,
    `round-3 audit category is missing: ${category}`
  );
}
for (const expected of [
  'Audit round: **3 — executable revalidation and causal-label repair**',
  'Overall status: **not passed**',
  '## revoked\n\nNone.',
  '`commit` revalidation',
  'Collaborator causal correction',
  'Full repository commands not executed',
  'Schema comment normalization pending'
]) {
  requireText(
    files.report,
    contents.report,
    expected,
    `round-3 audit evidence is missing: ${expected}`
  );
}
forbidMatch(
  files.report,
  contents.report,
  /`commit` verification scenario — revoked once/,
  'round-2 active revocation heading remains in round 3'
);

for (const expected of [
  'existing single owner',
  'Repository code and documentation are authoritative',
  'Linear and Notion are mirrors'
]) {
  requireText(
    files.resolution,
    contents.resolution,
    expected,
    `execution resolution is missing: ${expected}`
  );
}

const inputRoot = '.codex/tasks/collaboration-relationship-kernel-repair/input';
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
  if (existsSync(resolve(root, path)))
    failures.push(`${path}: task input remains in executable agent discovery`);
}

const result = {
  ok: failures.length === 0,
  auditRound: 3,
  excludedConcepts: excluded.length,
  benchmarkConcepts: 8,
  filesChecked: Object.keys(files).length,
  failures
};
process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
