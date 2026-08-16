export const discussionCategories = ['general', 'question', 'announcement'] as const;
export const discussionStatuses = ['open', 'closed'] as const;
export const discussionTitleMaxLength = 240;

export type DiscussionCategory = (typeof discussionCategories)[number];
export type DiscussionStatus = (typeof discussionStatuses)[number];

export interface DiscussionComment {
  readonly body: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly id: string;
  readonly isAnswer: boolean;
  readonly updatedAt: string;
  readonly version: number;
}

export interface DiscussionSummary {
  readonly category: DiscussionCategory;
  readonly closedAt: string | null;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly discussionNumber: number;
  readonly id: string;
  readonly isLocked: boolean;
  readonly repositoryId: string;
  readonly status: DiscussionStatus;
  readonly title: string;
  readonly updatedAt: string;
  readonly version: number;
}

export interface DiscussionDetail extends DiscussionSummary {
  readonly answerCommentId: string | null;
  readonly body: string;
  readonly comments: readonly DiscussionComment[];
}

export type DiscussionCommand =
  | {
      readonly body: string;
      readonly category: DiscussionCategory;
      readonly mentionedUserIds?: readonly string[];
      readonly repositoryId: string;
      readonly title: string;
      readonly type: 'create';
    }
  | {
      readonly body: string;
      readonly expectedVersion: number;
      readonly discussionId: string;
      readonly mentionedUserIds?: readonly string[];
      readonly repositoryId: string;
      readonly title: string;
      readonly type: 'edit';
    }
  | {
      readonly body: string;
      readonly expectedVersion: number;
      readonly discussionId: string;
      readonly mentionedUserIds?: readonly string[];
      readonly repositoryId: string;
      readonly type: 'comment';
    }
  | {
      readonly expectedVersion: number;
      readonly discussionId: string;
      readonly repositoryId: string;
      readonly type: 'close' | 'reopen' | 'lock' | 'unlock';
    }
  | {
      readonly commentId: string;
      readonly expectedVersion: number;
      readonly discussionId: string;
      readonly repositoryId: string;
      readonly type: 'select-answer';
    }
  | {
      readonly expectedVersion: number;
      readonly discussionId: string;
      readonly repositoryId: string;
      readonly type: 'clear-answer';
    };

export function isDiscussionCategory(value: string): value is DiscussionCategory {
  return discussionCategories.some((category) => category === value);
}

export function isDiscussionStatus(value: string): value is DiscussionStatus {
  return discussionStatuses.some((status) => status === value);
}

export function isDiscussionNumber(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

export function isDiscussionVersion(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

export function isDiscussionTitle(value: string): boolean {
  const title = value.trim();
  return title.length >= 1 && title.length <= discussionTitleMaxLength;
}

export function normalizeDiscussionTitle(value: string): string | null {
  const title = value.trim();
  return isDiscussionTitle(title) ? title : null;
}

export function canCommentOnDiscussion(input: {
  readonly canCommentWhenLocked: boolean;
  readonly isLocked: boolean;
  readonly status: DiscussionStatus;
}): boolean {
  return input.status === 'open' && (!input.isLocked || input.canCommentWhenLocked);
}

export function canSelectDiscussionAnswer(
  category: DiscussionCategory,
  commentBelongsToDiscussion: boolean
): boolean {
  return category === 'question' && commentBelongsToDiscussion;
}
