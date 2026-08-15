import {
  isIssueCloseReason,
  isIssueNumber,
  isIssueStatus,
  isIssueTitle,
  isIssueVersion,
  type IssueAssignee,
  type IssueComment,
  type IssueDetail,
  type IssueLabel,
  type IssueSummary
} from '@no-code-collaboration-platform/domain';

import type { Database } from '../generated/database.types';

type IssueRow = Database['public']['Tables']['issues']['Row'];
type IssueCommentRow = Database['public']['Tables']['issue_comments']['Row'];
type RepositoryLabelRow = Database['public']['Tables']['repository_labels']['Row'];

type IssueSummaryProjectionRow = Pick<
  IssueRow,
  | 'close_reason'
  | 'closed_at'
  | 'created_at'
  | 'created_by'
  | 'id'
  | 'issue_number'
  | 'repository_id'
  | 'status'
  | 'title'
  | 'updated_at'
  | 'version'
>;

export type IssueDetailProjectionRow = IssueSummaryProjectionRow & Pick<IssueRow, 'body'>;

function assertIssueProjection(row: IssueSummaryProjectionRow) {
  if (
    !isIssueNumber(row.issue_number) ||
    !isIssueStatus(row.status) ||
    !isIssueTitle(row.title) ||
    !isIssueVersion(row.version) ||
    (row.close_reason !== null && !isIssueCloseReason(row.close_reason))
  ) {
    throw new Error('The Issue row does not satisfy the Issue contract.');
  }
}

export function mapSupabaseIssueSummaryRow(row: IssueSummaryProjectionRow): IssueSummary {
  assertIssueProjection(row);
  return {
    closeReason: row.close_reason,
    closedAt: row.closed_at,
    createdAt: row.created_at,
    createdBy: row.created_by,
    id: row.id,
    issueNumber: row.issue_number,
    repositoryId: row.repository_id,
    status: row.status,
    title: row.title,
    updatedAt: row.updated_at,
    version: row.version
  };
}

export function mapSupabaseIssueRow(
  row: IssueDetailProjectionRow,
  relationships: {
    readonly assigneeIds: readonly string[];
    readonly comments: readonly IssueCommentRow[];
    readonly labels: readonly RepositoryLabelRow[];
  }
): IssueDetail {
  const assignees: readonly IssueAssignee[] = relationships.assigneeIds.map((id) => ({ id }));
  const comments: readonly IssueComment[] = relationships.comments.map((comment) => ({
    body: comment.body,
    createdAt: comment.created_at,
    createdBy: comment.created_by,
    id: comment.id,
    updatedAt: comment.updated_at,
    version: comment.version
  }));
  const labels: readonly IssueLabel[] = relationships.labels.map((label) => ({
    color: label.color,
    id: label.id,
    name: label.name
  }));
  return {
    ...mapSupabaseIssueSummaryRow(row),
    assignees,
    body: row.body,
    comments,
    labels
  };
}
