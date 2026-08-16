import type {
  IssueDetail,
  IssueStatus,
  IssueSummary
} from '@no-code-collaboration-platform/domain/resource';

export type IssueStatusFilter = IssueStatus | 'all';

export interface AccessibleIssueQuery {
  readonly issueNumber: number;
  readonly repositoryId: string;
}

export interface AccessibleIssueByIdQuery {
  readonly issueId: string;
  readonly repositoryId: string;
}

export interface IssueCollectionQuery {
  readonly page: number;
  readonly pageSize: number;
  readonly query: string;
  readonly repositoryId: string;
  readonly status: IssueStatusFilter;
}

export interface IssueCollection {
  readonly issues: readonly IssueSummary[];
  readonly total: number;
}

export interface IssueReader {
  findAccessibleIssue(query: AccessibleIssueQuery): Promise<IssueDetail | null>;
  findAccessibleIssueById(query: AccessibleIssueByIdQuery): Promise<IssueDetail | null>;
  listAccessibleIssues(query: IssueCollectionQuery): Promise<IssueCollection>;
}
