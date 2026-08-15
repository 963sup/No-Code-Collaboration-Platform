import { isDiscussionNumber } from '@no-code-collaboration-platform/domain/resource';

import type { AccessibleDiscussionQuery, DiscussionReader } from '../ports/discussion-repository';

export class GetAccessibleDiscussion {
  public constructor(private readonly reader: DiscussionReader) {}

  public execute(query: AccessibleDiscussionQuery) {
    if (!isDiscussionNumber(query.discussionNumber) || !query.repositoryId) {
      return Promise.resolve(null);
    }
    return this.reader.findAccessibleDiscussion(query);
  }
}
