import type {
  DiscussionCommand,
  DiscussionDetail,
  DiscussionStatus,
  DiscussionSummary
} from '@no-code-collaboration-platform/domain/resource';

export interface AccessibleDiscussionQuery {
  readonly discussionNumber: number;
  readonly repositoryId: string;
}

export interface DiscussionCollectionQuery {
  readonly category: string | 'all';
  readonly page: number;
  readonly pageSize: number;
  readonly query: string;
  readonly repositoryId: string;
  readonly status: DiscussionStatus | 'all';
}

export interface DiscussionCollection {
  readonly discussions: readonly DiscussionSummary[];
  readonly total: number;
}

export interface DiscussionReader {
  findAccessibleDiscussion(query: AccessibleDiscussionQuery): Promise<DiscussionDetail | null>;
  listAccessibleDiscussions(query: DiscussionCollectionQuery): Promise<DiscussionCollection>;
}

export type DiscussionCommandPersistenceResult =
  | { readonly discussion: DiscussionDetail; readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: 'forbidden' | 'related-resource-unavailable' | 'state-changed';
    };

export interface DiscussionWriter {
  executeDiscussionCommand(command: DiscussionCommand): Promise<DiscussionCommandPersistenceResult>;
}
