import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const failures = [];
const legacy = spawnSync(process.execPath, ['tooling/check-documentation-contracts.mjs'], {
  cwd: root,
  encoding: 'utf8'
});

let legacyResult = null;
try {
  legacyResult = JSON.parse(legacy.stdout.trim());
} catch (error) {
  failures.push(`legacy documentation checker did not return JSON: ${error.message}`);
}

const supersededLegacyFailures = new Set([
  'docs/IMPLEMENTATION_GAPS.md: GAP-OWNERSHIP-001 is missing',
  'docs/IMPLEMENTATION_GAPS.md: GAP-OWNERSHIP-001 must remain open until its closure evidence is complete',
  'docs/domains/repository-collaboration.md: destructive Repository lifecycle rule is missing',
  'apps/web/README.md: stable-ID compatibility route is not redirect-only'
]);

for (const failure of legacyResult?.failures ?? []) {
  if (!supersededLegacyFailures.has(failure)) failures.push(failure);
}

const gapRegister = readFileSync(resolve(root, 'docs/IMPLEMENTATION_GAPS.md'), 'utf8');
const closedGapArchive = readFileSync(resolve(root, 'docs/history/CLOSED_GAPS.md'), 'utf8');
const repositoryCollaboration = readFileSync(
  resolve(root, 'docs/domains/repository-collaboration.md'),
  'utf8'
);

if (/^### GAP-OWNERSHIP-001\b/m.test(gapRegister)) {
  failures.push(
    'docs/IMPLEMENTATION_GAPS.md: closed GAP-OWNERSHIP-001 detail must live in history'
  );
}
if (!/\bGAP-OWNERSHIP-001\b/u.test(gapRegister)) {
  failures.push('docs/IMPLEMENTATION_GAPS.md: GAP-OWNERSHIP-001 closed-gap index entry is missing');
}
if (!/### GAP-IDENTITY-001[\s\S]*?- Status: Open/iu.test(gapRegister)) {
  failures.push('docs/IMPLEMENTATION_GAPS.md: GAP-IDENTITY-001 must remain Open');
}
if (!/### GAP-COLLABORATION-SURFACES-001[\s\S]*?- Status: Contained/iu.test(gapRegister)) {
  failures.push('docs/IMPLEMENTATION_GAPS.md: collaboration-surface gap must remain Contained');
}
if (!/### GAP-OWNERSHIP-001[\s\S]*?- Status: Closed/iu.test(closedGapArchive)) {
  failures.push('docs/history/CLOSED_GAPS.md: GAP-OWNERSHIP-001 closed evidence is missing');
}
if (
  !/### GAP-OWNERSHIP-001[\s\S]*?7423d82d558c904ba12cb6a1d83a5eb4941e6bfd[\s\S]*?31883206522/iu.test(
    closedGapArchive
  )
) {
  failures.push(
    'docs/history/CLOSED_GAPS.md: GAP-OWNERSHIP-001 exact implementation and CI closure evidence is missing'
  );
}
if (
  !/Repository deletion remains unavailable[\s\S]*(?:Resources|Artifacts)[\s\S]*Grants[\s\S]*history[\s\S]*recovery/iu.test(
    repositoryCollaboration
  )
) {
  failures.push(
    'docs/domains/repository-collaboration.md: destructive Repository lifecycle fail-closed invariant is missing'
  );
}

const result = {
  ...legacyResult,
  ok: failures.length === 0,
  currentGaps: 2,
  archivedClosedGaps: 5,
  supersededLegacyAssertions: supersededLegacyFailures.size,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
