import {
  isIssueNumber,
  isIssueStatus,
  isIssueTitle,
  type IssueDetail,
  type IssueSummary
} from '@no-code-collaboration-platform/domain';

import type { Database } from '../generated/database.types';

type IssueRow = Database['public']['Tables']['issues']['Row'];

type IssueSummaryProjectionRow = Pick<
  IssueRow,
  | 'closed_at'
  | 'created_at'
  | 'created_by'
  | 'id'
  | 'issue_number'
  | 'repository_id'
  | 'status'
  | 'title'
  | 'updated_at'
>;

type IssueDetailProjectionRow = IssueSummaryProjectionRow & Pick<IssueRow, 'body'>;

function assertIssueProjection(row: IssueSummaryProjectionRow) {
  if (!isIssueNumber(row.issue_number) || !isIssueStatus(row.status) || !isIssueTitle(row.title)) {
    throw new Error('The Issue row does not satisfy the Issue contract.');
  }
}

export function mapSupabaseIssueSummaryRow(row: IssueSummaryProjectionRow): IssueSummary {
  assertIssueProjection(row);

  return {
    closedAt: row.closed_at,
    createdAt: row.created_at,
    createdBy: row.created_by,
    id: row.id,
    issueNumber: row.issue_number,
    repositoryId: row.repository_id,
    status: row.status,
    title: row.title,
    updatedAt: row.updated_at
  };
}

export function mapSupabaseIssueRow(row: IssueDetailProjectionRow): IssueDetail {
  return {
    ...mapSupabaseIssueSummaryRow(row),
    body: row.body
  };
}
