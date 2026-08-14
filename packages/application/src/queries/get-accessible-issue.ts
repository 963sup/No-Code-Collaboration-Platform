import { isIssueNumber } from '@no-code-collaboration-platform/domain';

import type { AccessibleIssueQuery, IssueReader } from '../ports/issue-reader';

export class GetAccessibleIssue {
  public constructor(private readonly issueReader: IssueReader) {}

  public execute(query: AccessibleIssueQuery) {
    if (!isIssueNumber(query.issueNumber) || !query.repositoryId) return Promise.resolve(null);
    return this.issueReader.findAccessibleIssue(query);
  }
}
