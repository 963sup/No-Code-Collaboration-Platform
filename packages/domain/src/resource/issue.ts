export const issueStatuses = ['open', 'closed'] as const;
export const issueTitleMaxLength = 240;

export type IssueStatus = (typeof issueStatuses)[number];

export interface IssueSummary {
  readonly closedAt: string | null;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly id: string;
  readonly issueNumber: number;
  readonly repositoryId: string;
  readonly status: IssueStatus;
  readonly title: string;
  readonly updatedAt: string;
}

export interface IssueDetail extends IssueSummary {
  readonly body: string;
}

export function isIssueNumber(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

export function isIssueStatus(value: string): value is IssueStatus {
  return issueStatuses.some((status) => status === value);
}

export function isIssueTitle(value: string): boolean {
  const title = value.trim();
  return title.length >= 1 && title.length <= issueTitleMaxLength;
}
