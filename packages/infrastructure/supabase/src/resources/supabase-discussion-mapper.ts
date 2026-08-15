import {
  isDiscussionCategory,
  isDiscussionNumber,
  isDiscussionStatus,
  isDiscussionTitle,
  isDiscussionVersion,
  type DiscussionComment,
  type DiscussionDetail,
  type DiscussionSummary
} from '@no-code-collaboration-platform/domain/resource';

import type { Database } from '../generated/database.types';

type DiscussionRow = Database['public']['Tables']['discussions']['Row'];
type DiscussionCommentRow = Database['public']['Tables']['discussion_comments']['Row'];

export type DiscussionDetailProjectionRow = Pick<
  DiscussionRow,
  | 'answer_comment_id'
  | 'body'
  | 'category'
  | 'closed_at'
  | 'created_at'
  | 'created_by'
  | 'discussion_number'
  | 'id'
  | 'is_locked'
  | 'repository_id'
  | 'status'
  | 'title'
  | 'updated_at'
  | 'version'
>;

export type DiscussionSummaryProjectionRow = Omit<
  DiscussionDetailProjectionRow,
  'answer_comment_id' | 'body'
>;

function assertDiscussion(row: DiscussionSummaryProjectionRow) {
  if (
    !isDiscussionCategory(row.category) ||
    !isDiscussionNumber(row.discussion_number) ||
    !isDiscussionStatus(row.status) ||
    !isDiscussionTitle(row.title) ||
    !isDiscussionVersion(row.version)
  ) {
    throw new Error('The Discussion row does not satisfy the Discussion contract.');
  }
}

export function mapSupabaseDiscussionSummaryRow(
  row: DiscussionSummaryProjectionRow
): DiscussionSummary {
  assertDiscussion(row);
  return {
    category: row.category,
    closedAt: row.closed_at,
    createdAt: row.created_at,
    createdBy: row.created_by,
    discussionNumber: row.discussion_number,
    id: row.id,
    isLocked: row.is_locked,
    repositoryId: row.repository_id,
    status: row.status,
    title: row.title,
    updatedAt: row.updated_at,
    version: row.version
  };
}

export function mapSupabaseDiscussionRow(
  row: DiscussionDetailProjectionRow,
  commentRows: readonly DiscussionCommentRow[]
): DiscussionDetail {
  const comments: readonly DiscussionComment[] = commentRows.map((comment) => ({
    body: comment.body,
    createdAt: comment.created_at,
    createdBy: comment.created_by,
    id: comment.id,
    isAnswer: comment.id === row.answer_comment_id,
    updatedAt: comment.updated_at,
    version: comment.version
  }));
  return {
    ...mapSupabaseDiscussionSummaryRow(row),
    answerCommentId: row.answer_comment_id,
    body: row.body,
    comments
  };
}
