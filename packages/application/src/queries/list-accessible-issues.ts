import { isIssueStatus } from '@no-code-collaboration-platform/domain';

import type { IssueCollectionQuery, IssueReader, IssueStatusFilter } from '../ports/issue-reader';

export interface ListAccessibleIssuesInput {
  readonly page?: number;
  readonly pageSize?: number;
  readonly query?: string;
  readonly repositoryId: string;
  readonly status?: string;
}

function normalizeStatus(status: string | undefined): IssueStatusFilter {
  if (status === 'all' || (status && isIssueStatus(status))) return status;
  return 'open';
}

function boundedInteger(value: number | undefined, fallback: number, maximum: number) {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(Math.trunc(value), maximum));
}

export class ListAccessibleIssues {
  public constructor(private readonly issueReader: IssueReader) {}

  public execute(input: ListAccessibleIssuesInput) {
    const query: IssueCollectionQuery = {
      page: boundedInteger(input.page, 1, 10_000),
      pageSize: boundedInteger(input.pageSize, 25, 50),
      query: input.query?.trim().slice(0, 256) ?? '',
      repositoryId: input.repositoryId,
      status: normalizeStatus(input.status)
    };

    return this.issueReader.listAccessibleIssues(query);
  }
}
