import type { RepositoryCapability } from '../access/capability';

export const issueStatuses = ['open', 'closed'] as const;
export const issueCloseReasons = ['completed', 'cancelled'] as const;
export const issueTitleMaxLength = 240;

export type IssueStatus = (typeof issueStatuses)[number];
export type IssueCloseReason = (typeof issueCloseReasons)[number];

export interface IssueLabel {
  readonly color: string;
  readonly id: string;
  readonly name: string;
}

export interface IssueAssignee {
  readonly id: string;
}

export interface IssueComment {
  readonly body: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly id: string;
  readonly updatedAt: string;
  readonly version: number;
}

export interface IssueSummary {
  readonly closeReason: IssueCloseReason | null;
  readonly closedAt: string | null;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly id: string;
  readonly issueNumber: number;
  readonly repositoryId: string;
  readonly status: IssueStatus;
  readonly title: string;
  readonly updatedAt: string;
  readonly version: number;
}

export interface IssueDetail extends IssueSummary {
  readonly assignees: readonly IssueAssignee[];
  readonly body: string;
  readonly comments: readonly IssueComment[];
  readonly labels: readonly IssueLabel[];
}

export type IssueCommand =
  | {
      readonly body: string;
      readonly mentionedUserIds?: readonly string[];
      readonly repositoryId: string;
      readonly title: string;
      readonly type: 'create';
    }
  | {
      readonly body: string;
      readonly expectedVersion: number;
      readonly issueId: string;
      readonly mentionedUserIds?: readonly string[];
      readonly repositoryId: string;
      readonly title: string;
      readonly type: 'edit';
    }
  | {
      readonly body: string;
      readonly expectedVersion: number;
      readonly issueId: string;
      readonly mentionedUserIds?: readonly string[];
      readonly repositoryId: string;
      readonly type: 'comment';
    }
  | {
      readonly assigneeId: string;
      readonly expectedVersion: number;
      readonly issueId: string;
      readonly repositoryId: string;
      readonly type: 'assign' | 'unassign';
    }
  | {
      readonly expectedVersion: number;
      readonly issueId: string;
      readonly labelId: string;
      readonly repositoryId: string;
      readonly type: 'label' | 'unlabel';
    }
  | {
      readonly closeReason: IssueCloseReason;
      readonly expectedVersion: number;
      readonly issueId: string;
      readonly repositoryId: string;
      readonly type: 'close';
    }
  | {
      readonly expectedVersion: number;
      readonly issueId: string;
      readonly repositoryId: string;
      readonly type: 'reopen';
    };

export function requiredIssueCapability(command: IssueCommand): RepositoryCapability {
  switch (command.type) {
    case 'create':
      return 'issue.create';
    case 'comment':
      return 'issue.comment';
    case 'edit':
      return 'issue.edit';
    case 'assign':
    case 'unassign':
    case 'label':
    case 'unlabel':
    case 'close':
    case 'reopen':
      return 'issue.manage';
  }
}

export function issueAuthorMayExecute(
  command: IssueCommand,
  actorId: string,
  issueCreatedBy: string
): boolean {
  if (actorId !== issueCreatedBy) return false;
  return command.type === 'edit' || command.type === 'close' || command.type === 'reopen';
}

export function isIssueNumber(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

export function isIssueVersion(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

export function isIssueStatus(value: string): value is IssueStatus {
  return issueStatuses.some((status) => status === value);
}

export function isIssueCloseReason(value: string): value is IssueCloseReason {
  return issueCloseReasons.some((reason) => reason === value);
}

export function isIssueTitle(value: string): boolean {
  const title = value.trim();
  return title.length >= 1 && title.length <= issueTitleMaxLength;
}

export function normalizeIssueTitle(value: string): string | null {
  const title = value.trim();
  return isIssueTitle(title) ? title : null;
}

export function canTransitionIssue(
  currentStatus: IssueStatus,
  command: Extract<IssueCommand, { readonly type: 'close' | 'reopen' }>['type']
): boolean {
  return command === 'close' ? currentStatus === 'open' : currentStatus === 'closed';
}
