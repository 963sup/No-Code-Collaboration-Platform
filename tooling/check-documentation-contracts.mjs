import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = process.cwd();
const checks = [
  'check-documentation-contracts-current.mjs',
  'check-github-semantic-contract.mjs'
];
const failures = [];
const results = [];

for (const script of checks) {
  const run = spawnSync(process.execPath, [resolve(root, 'tooling', script)], {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true
  });

  let output = null;
  try {
    output = JSON.parse(run.stdout || '{}');
  } catch (error) {
    failures.push(`${script}: non-JSON output: ${error.message}`);
  }

  results.push({
    script,
    status: run.status,
    ok: output?.ok === true,
    failures: output?.failures ?? []
  });

  if (run.status !== 0 || output?.ok !== true) {
    failures.push(`${script}: contract check failed`);
  }
  if (run.stderr?.trim()) {
    failures.push(`${script}: ${run.stderr.trim()}`);
  }
}

const result = {
  ok: failures.length === 0,
  compatibilityEntry: 'tooling/check-documentation-contracts.mjs',
  delegates: checks,
  results,
  failures
};

process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
