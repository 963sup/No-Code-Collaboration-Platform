import { describe, expect, it, vi } from 'vitest';

import {
  ExecuteDiscussionCommand,
  ExecuteIssueCommand,
  type DiscussionWriter,
  type IdentityProvider,
  type IssueWriter,
  type RepositoryAccessReader,
  type RepositoryReader
} from '../src/index';
import type { RepositoryRole } from '@no-code-collaboration-platform/domain/access';

const repository = {
  description: null,
  id: 'repository-1',
  name: 'Platform',
  owner: { kind: 'user' as const, userId: 'owner-1' },
  slug: 'platform',
  visibility: 'private' as const
};

function identityProvider(actorId: string | null): IdentityProvider {
  return {
    async authenticateWithPassword() {
      return { ok: false, reason: 'invalid-credentials' };
    },
    async getCurrentIdentity() {
      return actorId ? { email: null, id: actorId } : null;
    },
    async getPasswordRecoveryIdentity() {
      return null;
    },
    async registerWithPassword() {
      return { ok: false, reason: 'registration-disabled' };
    },
    async requestPasswordRecovery() {
      return { ok: false, reason: 'provider-unavailable' };
    },
    async resendEmailVerification() {
      return { ok: false, reason: 'provider-unavailable' };
    },
    async resetPassword() {
      return { ok: false, reason: 'invalid-recovery-session' };
    },
    async signOut() {},
    async verifyEmail() {
      return { ok: false, reason: 'invalid-code' };
    },
    async verifyPasswordRecovery() {
      return { ok: false, reason: 'invalid-code' };
    }
  };
}

const repositoryReader: RepositoryReader = {
  async findAccessibleRepositoryById() {
    return repository;
  },
  async listAccessibleRepositories() {
    return [repository];
  }
};

function accessReader(role: RepositoryRole): RepositoryAccessReader {
  return {
    async readRepositoryAccess() {
      return { directRole: role, governanceRole: null };
    }
  };
}

describe('collaboration commands', () => {
  it('lets Read create and comment on Issues but denies Issue editing', async () => {
    const executeIssueCommand = vi.fn().mockResolvedValue({ ok: false, reason: 'state-changed' });
    const useCase = new ExecuteIssueCommand(
      identityProvider('actor-1'),
      repositoryReader,
      accessReader('read'),
      { executeIssueCommand }
    );

    const create = {
      body: '',
      repositoryId: repository.id,
      title: 'Actionable work',
      type: 'create' as const
    };
    await expect(useCase.execute(create)).resolves.toEqual({ ok: false, reason: 'state-changed' });
    expect(executeIssueCommand).toHaveBeenCalledWith(create);

    executeIssueCommand.mockClear();
    await expect(
      useCase.execute({
        body: 'Changed body',
        expectedVersion: 1,
        issueId: 'issue-1',
        repositoryId: repository.id,
        title: 'Changed title',
        type: 'edit'
      })
    ).resolves.toEqual({ ok: false, reason: 'forbidden' });
    expect(executeIssueCommand).not.toHaveBeenCalled();
  });

  it('lets Triage manage Issue state without granting Page-style content editing semantics', async () => {
    const executeIssueCommand = vi.fn().mockResolvedValue({ ok: false, reason: 'state-changed' });
    const useCase = new ExecuteIssueCommand(
      identityProvider('actor-1'),
      repositoryReader,
      accessReader('triage'),
      { executeIssueCommand }
    );
    const close = {
      closeReason: 'completed' as const,
      expectedVersion: 4,
      issueId: 'issue-1',
      repositoryId: repository.id,
      type: 'close' as const
    };

    await expect(useCase.execute(close)).resolves.toEqual({ ok: false, reason: 'state-changed' });
    expect(executeIssueCommand).toHaveBeenCalledWith(close);
  });

  it('reserves Announcement creation to Maintain or Admin', async () => {
    const executeDiscussionCommand = vi.fn().mockResolvedValue({ ok: false, reason: 'state-changed' });
    const command = {
      body: '',
      category: 'announcement' as const,
      repositoryId: repository.id,
      title: 'Policy update',
      type: 'create' as const
    };

    const writeUseCase = new ExecuteDiscussionCommand(
      identityProvider('actor-1'),
      repositoryReader,
      accessReader('write'),
      { executeDiscussionCommand }
    );
    await expect(writeUseCase.execute(command)).resolves.toEqual({ ok: false, reason: 'forbidden' });
    expect(executeDiscussionCommand).not.toHaveBeenCalled();

    const maintainUseCase = new ExecuteDiscussionCommand(
      identityProvider('actor-1'),
      repositoryReader,
      accessReader('maintain'),
      { executeDiscussionCommand }
    );
    await expect(maintainUseCase.execute(command)).resolves.toEqual({
      ok: false,
      reason: 'state-changed'
    });
    expect(executeDiscussionCommand).toHaveBeenCalledWith(command);
  });

  it('lets Triage moderate a Discussion while Read cannot', async () => {
    const executeDiscussionCommand = vi.fn().mockResolvedValue({ ok: false, reason: 'state-changed' });
    const command = {
      expectedVersion: 1,
      discussionId: 'discussion-1',
      repositoryId: repository.id,
      type: 'lock' as const
    };

    const readUseCase = new ExecuteDiscussionCommand(
      identityProvider('actor-1'),
      repositoryReader,
      accessReader('read'),
      { executeDiscussionCommand }
    );
    await expect(readUseCase.execute(command)).resolves.toEqual({ ok: false, reason: 'forbidden' });
    expect(executeDiscussionCommand).not.toHaveBeenCalled();

    const triageUseCase = new ExecuteDiscussionCommand(
      identityProvider('actor-1'),
      repositoryReader,
      accessReader('triage'),
      { executeDiscussionCommand }
    );
    await expect(triageUseCase.execute(command)).resolves.toEqual({
      ok: false,
      reason: 'state-changed'
    });
    expect(executeDiscussionCommand).toHaveBeenCalledWith(command);
  });
});
