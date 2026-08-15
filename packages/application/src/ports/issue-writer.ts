import type { IssueCommand, IssueDetail } from '@no-code-collaboration-platform/domain/resource';

export type IssueCommandPersistenceResult =
  | { readonly issue: IssueDetail; readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: 'forbidden' | 'related-resource-unavailable' | 'state-changed';
    };

export interface IssueWriter {
  executeIssueCommand(command: IssueCommand): Promise<IssueCommandPersistenceResult>;
}
