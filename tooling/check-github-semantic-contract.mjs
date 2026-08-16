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

const skillRoot = '.agents/skills/github-semantic-reverse';
const snapshotPath = `${skillRoot}/REFERENCE_SNAPSHOT.md`;
const glossaryPath = `${skillRoot}/GLOSSARY.md`;
const reportPath = `${skillRoot}/audit-reports/2026-08-16.md`;
const resolutionPath =
  '.codex/tasks/collaboration-relationship-kernel-repair/EXECUTION_RESOLUTION.md';
const inputRoot = '.codex/tasks/collaboration-relationship-kernel-repair/input';

for (const path of [snapshotPath, glossaryPath, reportPath, resolutionPath]) {
  if (!existsSync(resolve(root, path))) failures.push(`${path}: required semantic contract is missing`);
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
  requireText(glossaryPath, glossary, expected, `required semantic boundary is missing: ${expected}`);
}

const report = read(reportPath);
for (const category of ['## newly_passed', '## maintained_passed', '## revoked', '## not_passed']) {
  requireText(reportPath, report, category, `audit category is missing: ${category}`);
}
requireText(reportPath, report, 'Overall status: **not passed**', 'current audit status is not explicit');
requireText(reportPath, report, 'Source-of-truth synchronization log', 'mirror arbitration log is missing');

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
  if (existsSync(resolve(root, path))) failures.push(`${path}: task specification remains in executable agent discovery`);
}

const result = {
  ok: failures.length === 0,
  snapshot: snapshotPath,
  glossary: glossaryPath,
  report: reportPath,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
