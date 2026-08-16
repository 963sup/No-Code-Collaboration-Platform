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

function accessReader(role: 'admin' | 'write' | 'read'): RepositoryAccessReader {
  return {
    async readRepositoryAccess() {
      return { directRole: role, governanceRole: null };
    }
  };
}

describe('collaboration commands', () => {
  it('routes Issue create through resource.create and rejects a Viewer', async () => {
    const executeIssueCommand = vi.fn();
    const writer: IssueWriter = { executeIssueCommand };
    const useCase = new ExecuteIssueCommand(
      identityProvider('actor-1'),
      repositoryReader,
      accessReader('read'),
      writer
    );

    await expect(
      useCase.execute({
        body: '',
        repositoryId: repository.id,
        title: 'Actionable work',
        type: 'create'
      })
    ).resolves.toEqual({ ok: false, reason: 'forbidden' });
    expect(executeIssueCommand).not.toHaveBeenCalled();
  });

  it('passes the expected Issue version to persistence without replacing it', async () => {
    const executeIssueCommand = vi.fn().mockResolvedValue({ ok: false, reason: 'state-changed' });
    const useCase = new ExecuteIssueCommand(
      identityProvider('actor-1'),
      repositoryReader,
      accessReader('write'),
      { executeIssueCommand }
    );
    const command = {
      closeReason: 'completed' as const,
      expectedVersion: 4,
      issueId: 'issue-1',
      repositoryId: repository.id,
      type: 'close' as const
    };

    await expect(useCase.execute(command)).resolves.toEqual({ ok: false, reason: 'state-changed' });
    expect(executeIssueCommand).toHaveBeenCalledWith(command);
  });

  it('requires repository.manage to create an announcement Discussion', async () => {
    const executeDiscussionCommand = vi.fn();
    const writer: DiscussionWriter = { executeDiscussionCommand };
    const useCase = new ExecuteDiscussionCommand(
      identityProvider('actor-1'),
      repositoryReader,
      accessReader('write'),
      writer
    );

    await expect(
      useCase.execute({
        body: '',
        category: 'announcement',
        repositoryId: repository.id,
        title: 'Policy update',
        type: 'create'
      })
    ).resolves.toEqual({ ok: false, reason: 'forbidden' });
    expect(executeDiscussionCommand).not.toHaveBeenCalled();
  });

  it('requires repository.manage for lock while permitting question create for a Contributor', async () => {
    const executeDiscussionCommand = vi
      .fn()
      .mockResolvedValue({ ok: false, reason: 'state-changed' });
    const useCase = new ExecuteDiscussionCommand(
      identityProvider('actor-1'),
      repositoryReader,
      accessReader('write'),
      { executeDiscussionCommand }
    );

    await expect(
      useCase.execute({
        expectedVersion: 1,
        discussionId: 'discussion-1',
        repositoryId: repository.id,
        type: 'lock'
      })
    ).resolves.toEqual({ ok: false, reason: 'forbidden' });
    await useCase.execute({
      body: '',
      category: 'question',
      repositoryId: repository.id,
      title: 'What should change?',
      type: 'create'
    });
    expect(executeDiscussionCommand).toHaveBeenCalledTimes(1);
  });
});
