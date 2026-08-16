import {
  decideRepositoryCapability,
  type RepositoryCapability
} from '@no-code-collaboration-platform/domain/access';
import {
  isDiscussionCategory,
  isDiscussionVersion,
  normalizeDiscussionTitle,
  type DiscussionCommand
} from '@no-code-collaboration-platform/domain/resource';

import type { DiscussionWriter } from '../ports/discussion-repository';
import type { IdentityProvider } from '../ports/identity-provider';
import type { RepositoryAccessReader } from '../ports/repository-access-reader';
import type { RepositoryReader } from '../ports/repository-reader';

export type ExecuteDiscussionCommandFailureReason =
  | 'forbidden'
  | 'invalid-command'
  | 'related-resource-unavailable'
  | 'repository-unavailable'
  | 'state-changed'
  | 'unauthenticated';

function requiredCapability(command: DiscussionCommand): RepositoryCapability {
  if (command.type === 'create') {
    return command.category === 'announcement' ? 'discussion.announce' : 'discussion.create';
  }

  switch (command.type) {
    case 'comment':
      return 'discussion.comment';
    case 'edit':
      return 'discussion.edit';
    case 'close':
    case 'reopen':
    case 'lock':
    case 'unlock':
    case 'select-answer':
    case 'clear-answer':
      return 'discussion.moderate';
  }
}

function normalizeCommand(command: DiscussionCommand): DiscussionCommand | null {
  if (!command.repositoryId) return null;
  if (command.type === 'create') {
    const title = normalizeDiscussionTitle(command.title);
    if (title === null || !isDiscussionCategory(command.category)) return null;
    return { ...command, title };
  }
  if (!command.discussionId || !isDiscussionVersion(command.expectedVersion)) return null;
  if (command.type === 'edit') {
    const title = normalizeDiscussionTitle(command.title);
    return title === null ? null : { ...command, title };
  }
  if (command.type === 'select-answer' && !command.commentId) return null;
  return command;
}

export class ExecuteDiscussionCommand {
  public constructor(
    private readonly identityProvider: IdentityProvider,
    private readonly repositoryReader: RepositoryReader,
    private readonly repositoryAccessReader: RepositoryAccessReader,
    private readonly discussionWriter: DiscussionWriter
  ) {}

  public async execute(command: DiscussionCommand) {
    const normalized = normalizeCommand(command);
    if (normalized === null) return { ok: false as const, reason: 'invalid-command' as const };
    const actor = await this.identityProvider.getCurrentIdentity();
    if (actor === null) return { ok: false as const, reason: 'unauthenticated' as const };
    const repository = await this.repositoryReader.findAccessibleRepositoryById(
      normalized.repositoryId
    );
    if (repository === null) {
      return { ok: false as const, reason: 'repository-unavailable' as const };
    }
    const sources = await this.repositoryAccessReader.readRepositoryAccess({
      actorId: actor.id,
      repositoryId: repository.id
    });
    const decision = decideRepositoryCapability(
      { sources, visibility: repository.visibility },
      requiredCapability(normalized)
    );
    if (!decision.allowed) return { ok: false as const, reason: 'forbidden' as const };
    return this.discussionWriter.executeDiscussionCommand(normalized);
  }
}
