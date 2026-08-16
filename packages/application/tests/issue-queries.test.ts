import { describe, expect, it, vi } from 'vitest';

import { GetAccessibleIssue, ListAccessibleIssues, type IssueReader } from '../src/index';

const issue = {
  assignees: [],
  body: 'A no-code collaboration problem.',
  closeReason: null,
  closedAt: null,
  comments: [],
  createdAt: '2026-08-15T00:00:00.000Z',
  createdBy: 'user-1',
  id: 'issue-1',
  issueNumber: 7,
  labels: [],
  repositoryId: 'repository-1',
  status: 'open' as const,
  title: 'Clarify customer onboarding',
  updatedAt: '2026-08-15T00:00:00.000Z',
  version: 1
};

describe('Issue queries', () => {
  it('loads one Issue through stable Repository and issue-number identity', async () => {
    const findAccessibleIssue = vi.fn().mockResolvedValue(issue);
    const reader: IssueReader = {
      findAccessibleIssue,
      async findAccessibleIssueById() {
        return null;
      },
      async listAccessibleIssues() {
        return { issues: [], total: 0 };
      }
    };

    await expect(
      new GetAccessibleIssue(reader).execute({
        issueNumber: issue.issueNumber,
        repositoryId: issue.repositoryId
      })
    ).resolves.toEqual(issue);
    expect(findAccessibleIssue).toHaveBeenCalledWith({
      issueNumber: issue.issueNumber,
      repositoryId: issue.repositoryId
    });
  });

  it('normalizes temporary list query state before calling the adapter', async () => {
    const listAccessibleIssues = vi.fn().mockResolvedValue({ issues: [issue], total: 1 });
    const reader: IssueReader = {
      async findAccessibleIssue() {
        return null;
      },
      async findAccessibleIssueById() {
        return null;
      },
      listAccessibleIssues
    };

    await expect(
      new ListAccessibleIssues(reader).execute({
        page: Number.NaN,
        pageSize: 500,
        query: `  ${'x'.repeat(300)}  `,
        repositoryId: issue.repositoryId,
        status: 'not-a-state'
      })
    ).resolves.toEqual({ issues: [issue], total: 1 });
    expect(listAccessibleIssues).toHaveBeenCalledWith({
      page: 1,
      pageSize: 50,
      query: 'x'.repeat(256),
      repositoryId: issue.repositoryId,
      status: 'open'
    });
  });
});
