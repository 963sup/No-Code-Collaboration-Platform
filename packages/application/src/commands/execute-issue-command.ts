import {
  effectiveRepositoryRole,
  hasRepositoryCapability,
  isIssueCloseReason,
  isIssueVersion,
  normalizeIssueTitle,
  type IssueCommand,
  type RepositoryCapability
} from '@no-code-collaboration-platform/domain';

import type { IdentityProvider } from '../ports/identity-provider';
import type { IssueCommandPersistenceResult, IssueWriter } from '../ports/issue-writer';
import type { RepositoryAccessReader } from '../ports/repository-access-reader';
import type { RepositoryReader } from '../ports/repository-reader';

export type ExecuteIssueCommandFailureReason =
  | 'forbidden'
  | 'invalid-command'
  | 'related-resource-unavailable'
  | 'repository-unavailable'
  | 'state-changed'
  | 'unauthenticated';

export type ExecuteIssueCommandResult =
  | IssueCommandPersistenceResult
  | { readonly ok: false; readonly reason: ExecuteIssueCommandFailureReason };

function requiredCapability(command: IssueCommand): RepositoryCapability {
  return command.type === 'create' || command.type === 'comment'
    ? 'resource.create'
    : 'resource.update';
}

function normalizeCommand(command: IssueCommand): IssueCommand | null {
  if (!command.repositoryId) return null;
  if (command.type === 'create') {
    const title = normalizeIssueTitle(command.title);
    return title === null ? null : { ...command, title };
  }
  if (!command.issueId || !isIssueVersion(command.expectedVersion)) return null;
  if (command.type === 'edit') {
    const title = normalizeIssueTitle(command.title);
    return title === null ? null : { ...command, title };
  }
  if (command.type === 'assign' || command.type === 'unassign') {
    return command.assigneeId ? command : null;
  }
  if (command.type === 'label' || command.type === 'unlabel') {
    return command.labelId ? command : null;
  }
  if (command.type === 'close' && !isIssueCloseReason(command.closeReason)) return null;
  return command;
}

export class ExecuteIssueCommand {
  public constructor(
    private readonly identityProvider: IdentityProvider,
    private readonly repositoryReader: RepositoryReader,
    private readonly repositoryAccessReader: RepositoryAccessReader,
    private readonly issueWriter: IssueWriter
  ) {}

  public async execute(command: IssueCommand): Promise<ExecuteIssueCommandResult> {
    const normalized = normalizeCommand(command);
    if (normalized === null) return { ok: false, reason: 'invalid-command' };

    const actor = await this.identityProvider.getCurrentIdentity();
    if (actor === null) return { ok: false, reason: 'unauthenticated' };

    const repository = await this.repositoryReader.findAccessibleRepositoryById(
      normalized.repositoryId
    );
    if (repository === null) return { ok: false, reason: 'repository-unavailable' };

    const sources = await this.repositoryAccessReader.readRepositoryAccess({
      actorId: actor.id,
      repositoryId: repository.id
    });
    const role = effectiveRepositoryRole(sources);
    if (role === null || !hasRepositoryCapability(role, requiredCapability(normalized))) {
      return { ok: false, reason: 'forbidden' };
    }

    return this.issueWriter.executeIssueCommand(normalized);
  }
}
