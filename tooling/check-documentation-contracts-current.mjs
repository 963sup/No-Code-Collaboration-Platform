import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const failures = [];

function read(path) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) {
    failures.push(`${path}: required current contract is missing`);
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

const paths = {
  rootReadme: 'README.md',
  product: 'docs/PRODUCT.md',
  ontology: 'docs/ONTOLOGY.md',
  docsReadme: 'docs/README.md',
  gaps: 'docs/IMPLEMENTATION_GAPS.md',
  closedGaps: 'docs/history/CLOSED_GAPS.md',
  architecture: 'docs/architecture/README.md',
  adr010: 'docs/architecture/ADR-010-repository-owner-namespace.md',
  adr011: 'docs/architecture/ADR-011-github-surface-parallel-composition.md',
  repositoryDomain: 'docs/domains/repository-collaboration.md',
  identityDomain: 'docs/domains/identity-lifecycle.md',
  accessDomain: 'docs/domains/access-authority.md',
  webReadme: 'apps/web/README.md',
  browserAgents: 'apps/web/e2e/AGENTS.md'
};

const documents = Object.fromEntries(
  Object.entries(paths).map(([name, path]) => [name, read(path)])
);

if (existsSync(resolve(root, 'CONSTITUTION.md')) || existsSync(resolve(root, 'docs/CONSTITUTION.md'))) {
  failures.push('docs/PRODUCT.md must remain the only Product constitution');
}

const axiomMatches =
  documents.product.match(/Repository\s*=\s*No-Code Collaboration Container/gu) ?? [];
if (axiomMatches.length !== 1) {
  failures.push(
    `docs/PRODUCT.md: expected exactly one Product axiom declaration, found ${axiomMatches.length}`
  );
}

for (const [pattern, message] of [
  [/^- Status: Canonical$/m, 'canonical status is missing'],
  [/Repository Owner[\s\S]*User[\s\S]*Organization/i, 'typed Repository ownership is missing'],
  [/\/\{ownerSlug\}[\s\S]*\/\{ownerSlug\}\/\{repositorySlug\}/i, 'shared Owner/Repository identity grammar is missing'],
  [/\/dashboard[\s\S]*\/repos[\s\S]*\/issues\/assigned/i, 'GitHub-aligned global URL baseline is missing'],
  [/\/\{ownerSlug\}\/\{repositorySlug\}\/wiki/i, 'Wiki presentation URL is missing'],
  [/\/orgs\/\{organizationSlug\}\/dashboard[\s\S]*\/organizations\/\{organizationSlug\}\/settings\/profile/i, 'split Organization operational/settings URL families are missing'],
  [/^## Falsification conditions$/m, 'falsification conditions are missing'],
  [/^## Contract update protocol$/m, 'contract update protocol is missing'],
  [/Governance constrains future action[\s\S]*Audit[\s\S]*past action/i, 'Governance/Audit time-direction law is missing'],
  [/Identity establishes a trusted Actor[\s\S]*Access resolves effective authority/i, 'Identity/Access non-confusion law is missing']
]) {
  requireMatch(paths.product, documents.product, pattern, message);
}

for (const [pattern, message] of [
  [/dashboardearance/u, 'mechanical /app replacement corrupted /settings/appearance'],
  [/dashboardlications/u, 'mechanical /app replacement corrupted /settings/applications'],
  [/\/settings\/integrations/u, 'superseded settings integration URL remains current'],
  [/\/settings\/programmatic-access/u, 'superseded programmatic-access URL remains current']
]) {
  forbidMatch(paths.product, documents.product, pattern, message);
}

for (const [pattern, message] of [
  [/^## 6\. Owner Namespace/m, 'Owner Namespace semantic section is missing'],
  [/URL shape never determines kind/i, 'Owner kind must not be inferred from URL shape'],
  [/\/issues\/assigned/i, 'assigned-Issue canonical URL is missing'],
  [/\/dashboard.*\/repos/is, 'Dashboard/Repository discovery URL distinction is missing'],
  [/GitHub Wiki presentation remains `\/wiki`/i, 'Wiki URL/Domain vocabulary distinction is missing'],
  [/There is no public stable-ID Repository compatibility namespace/i, 'stable-ID compatibility must remain unaccepted']
]) {
  requireMatch(paths.ontology, documents.ontology, pattern, message);
}

for (const [pattern, message] of [
  [/\/issues\?scope=assigned/u, 'superseded query-only assigned-Issue identity remains'],
  [/Model cross-Repository assigned Issues as `?\/issues/u, 'superseded assigned-Issue normalization rule remains'],
  [/do not copy GitHub's split `\/orgs/u, 'superseded Organization URL-collapse rule remains'],
  [/`\/app` is a discovery\/dashboard surface/u, 'superseded /app discovery rule remains']
]) {
  forbidMatch(paths.ontology, documents.ontology, pattern, message);
}

for (const [pattern, message] of [
  [/\(authenticated\).*\/dashboard.*\/repos.*\/issues\/assigned/is, 'current authenticated Route Group projection is missing'],
  [/\(owner\).*\/\{ownerSlug\}.*\/\{ownerSlug\}\/\{repositorySlug\}/is, 'current Owner Route Group projection is missing'],
  [/no public stable-ID Repository compatibility namespace/i, 'current stable-ID compatibility boundary is missing']
]) {
  requireMatch(paths.rootReadme, documents.rootReadme, pattern, message);
}
forbidMatch(paths.rootReadme, documents.rootReadme, /\(app\).*\/app/is, 'obsolete `(app)` /app delivery contract remains');
forbidMatch(paths.rootReadme, documents.rootReadme, /\(repository\).*canonical/is, 'obsolete `(repository)` Route Group contract remains');

for (const [pattern, message] of [
  [/Authenticated discovery = \/dashboard/i, 'current dashboard truth is missing'],
  [/Repository discovery = \/repos/i, 'current Repository discovery truth is missing'],
  [/Assigned Issue inbox = \/issues\/assigned/i, 'current assigned Issue truth is missing'],
  [/Repository knowledge = \/\{ownerSlug\}\/\{repositorySlug\}\/wiki/i, 'current Wiki truth is missing'],
  [/There is currently no public stable-ID Repository compatibility namespace/i, 'stable-ID compatibility boundary is missing']
]) {
  requireMatch(paths.docsReadme, documents.docsReadme, pattern, message);
}
forbidMatch(paths.docsReadme, documents.docsReadme, /^\/app = authenticated Repository discovery\/dashboard$/m, 'obsolete /app current truth remains');

for (const corruption of [
  'packages/dashboardlication',
  'apps/web/src/dashboard/',
  'src/dashboard/(auth)'
]) {
  forbidMatch(
    paths.architecture,
    documents.architecture,
    new RegExp(corruption.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'u'),
    `mechanical path corruption remains: ${corruption}`
  );
}
for (const [pattern, message] of [
  [/packages\/application.*owns use cases and provider-neutral Ports/i, 'Application ownership boundary is missing'],
  [/apps\/web\/src\/app\/[\s\S]*\(authenticated\)[\s\S]*\(owner\)/i, 'current App Router ownership tree is missing'],
  [/\/dashboard[\s\S]*\/repos[\s\S]*\/issues\/assigned/i, 'global URL baseline is missing'],
  [/\/wiki\/\{pageId\}/i, 'Wiki/Page presentation identity is missing']
]) {
  requireMatch(paths.architecture, documents.architecture, pattern, message);
}

for (const [path, content] of [
  [paths.adr010, documents.adr010],
  [paths.adr011, documents.adr011]
]) {
  requireMatch(path, content, /^- Status: Accepted$/m, 'accepted ADR status is missing');
  requireMatch(path, content, /\/dashboard/u, 'current dashboard URL is missing');
  requireMatch(path, content, /\/\{ownerSlug\}\/\{repositorySlug\}/u, 'canonical Repository URL is missing');
}
forbidMatch(paths.adr010, documents.adr010, /apps\/web\/src\/app\/\(repository\)/u, 'obsolete `(repository)` tree remains current');
forbidMatch(paths.adr010, documents.adr010, /Repository card from `\/app`/u, 'obsolete /app discriminating test remains');
forbidMatch(paths.adr011, documents.adr011, /`\/dashboard` maps to target `\/app`/u, 'superseded URL-normalization rule remains');
forbidMatch(paths.adr011, documents.adr011, /`\/repos` maps to `\/repositories`/u, 'superseded Repository URL-normalization rule remains');
forbidMatch(paths.adr011, documents.adr011, /`\/issues\/assigned` maps to `\/issues\?scope=assigned`/u, 'superseded Issue URL-normalization rule remains');
forbidMatch(paths.adr011, documents.adr011, /Use `\/pages/u, 'superseded Page URL rule remains');

for (const [pattern, message] of [
  [/`GAP-OWNERSHIP-001` is closed and historical/i, 'closed ownership gap is not acknowledged as historical'],
  [/`\/dashboard` is authenticated personal discovery/i, 'current Dashboard delivery rule is missing'],
  [/`\/repos` is Repository discovery/i, 'current Repository discovery rule is missing'],
  [/`\/wiki` is the GitHub-aligned presentation URL/i, 'Wiki/Page non-confusion rule is missing']
]) {
  requireMatch(paths.repositoryDomain, documents.repositoryDomain, pattern, message);
}
forbidMatch(paths.repositoryDomain, documents.repositoryDomain, /\/\{owner\}\/\{repository\}\/pages/u, 'superseded /pages route remains in current Domain contract');
forbidMatch(paths.repositoryDomain, documents.repositoryDomain, /`\/app` is an authenticated dashboard/u, 'superseded /app dashboard rule remains in current Domain contract');
forbidMatch(paths.repositoryDomain, documents.repositoryDomain, /Stable-ID compatibility route redirects/u, 'unaccepted stable-ID compatibility behavior remains in current Domain contract');

requireMatch(paths.webReadme, documents.webReadme, /\(authenticated\).*\/dashboard.*\/repos.*\/issues\/assigned/is, 'Web README authenticated delivery baseline is missing');
requireMatch(paths.webReadme, documents.webReadme, /\(owner\).*\/\{ownerSlug\}/is, 'Web README shared Owner delivery is missing');
requireMatch(paths.browserAgents, documents.browserAgents, /Cover `\/dashboard` discovery/u, 'browser instructions still lack current dashboard journey');

requireMatch(paths.identityDomain, documents.identityDomain, /Recovery Session[\s\S]*cannot enter `\/dashboard`/i, 'identity contract must separate Recovery Session from product Dashboard');
requireMatch(paths.accessDomain, documents.accessDomain, /Operation Capability[\s\S]*delegation authority[\s\S]*distinct/i, 'delegation authority distinction is missing');

requireMatch(paths.gaps, documents.gaps, /### GAP-IDENTITY-001[\s\S]*?- Status: Open/i, 'GAP-IDENTITY-001 must remain Open until closure evidence is complete');
requireMatch(paths.gaps, documents.gaps, /### GAP-COLLABORATION-SURFACES-001[\s\S]*?- Status: Contained/i, 'collaboration-surface gap must remain Contained');
forbidMatch(paths.gaps, documents.gaps, /ordinary `\/app` identity/u, 'superseded /app identity containment remains');

for (const closedGapId of [
  'GAP-OWNERSHIP-001',
  'GAP-PAGE-001',
  'GAP-LIFECYCLE-002',
  'GAP-LIFECYCLE-001',
  'GAP-AUTH-001'
]) {
  requireMatch(
    paths.gaps,
    documents.gaps,
    new RegExp(`\\b${closedGapId}\\b`, 'u'),
    `${closedGapId} closed-gap index entry is missing`
  );
  requireMatch(
    paths.closedGaps,
    documents.closedGaps,
    new RegExp(`^### ${closedGapId}\\b[\\s\\S]*?- Status: Closed`, 'mu'),
    `${closedGapId} historical closure evidence is missing`
  );
}

for (const [path, content] of [
  [paths.product, documents.product],
  [paths.ontology, documents.ontology],
  [paths.docsReadme, documents.docsReadme],
  [paths.architecture, documents.architecture],
  [paths.repositoryDomain, documents.repositoryDomain],
  [paths.gaps, documents.gaps]
]) {
  for (const corruption of ['dashboardlication', 'dashboardearance', 'dashboardlications']) {
    forbidMatch(path, content, new RegExp(corruption, 'u'), `mechanical replacement corruption remains: ${corruption}`);
  }
}

const result = {
  ok: failures.length === 0,
  currentContracts: Object.keys(paths).length,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
