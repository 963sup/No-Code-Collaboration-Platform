import { describe, expect, it } from 'vitest';

import { isIssueNumber, isIssueStatus, isIssueTitle, issueTitleMaxLength } from '../src/index';

describe('Issue Resource', () => {
  it('accepts only positive safe Repository-local issue numbers', () => {
    expect(isIssueNumber(1)).toBe(true);
    expect(isIssueNumber(Number.MAX_SAFE_INTEGER)).toBe(true);
    expect(isIssueNumber(0)).toBe(false);
    expect(isIssueNumber(-1)).toBe(false);
    expect(isIssueNumber(1.5)).toBe(false);
  });

  it('accepts only the explicit Issue lifecycle states', () => {
    expect(isIssueStatus('open')).toBe(true);
    expect(isIssueStatus('closed')).toBe(true);
    expect(isIssueStatus('done')).toBe(false);
  });

  it('rejects empty and overlong Issue titles', () => {
    expect(isIssueTitle('Actionable collaboration work')).toBe(true);
    expect(isIssueTitle('   ')).toBe(false);
    expect(isIssueTitle('x'.repeat(issueTitleMaxLength + 1))).toBe(false);
  });
});
