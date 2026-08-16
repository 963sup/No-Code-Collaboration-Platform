import { describe, expect, it, vi } from 'vitest';

import {
  ExecuteDiscussionCommand,
  ExecuteIssueCommand,
  type IdentityProvider,
  type IssueReader,
  type RepositoryAccessReader,
  type RepositoryReader
} from '../src/index';
import type { RepositoryRole } from '@no-code-collaboration-platform/domain/access';
import type { RepositorySummary } from '@no-code-collaboration-platform/domain/repository';
import type { IssueDetail } from '@no-code-collaboration-platform/domain/resource';

const privateRepository: RepositorySummary = {
  description: null,
  id: 'repository-1',
  name: 'Platform',
  owner: { kind: 'organization' as const, organizationId: 'organization-1' },
  slug: 'platform',
  visibility: 'private' as const
};

const publicRepository: RepositorySummary = {
  ...privateRepository,
  id: 'repository-public',
  visibility: 'public' as const
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

function repositoryReader(repository: RepositorySummary = privateRepository): RepositoryReader {
  return {
    async findAccessibleRepositoryById() {
      return repository;
    },
    async listAccessibleRepositories() {
      return [repository];
    }
  };
}

function accessReader(role: RepositoryRole | null): RepositoryAccessReader {
  return {
    async readRepositoryAccess() {
      return { directRole: role, governanceRole: null };
    }
  };
}

function issueReader(createdBy = 'issue-author'): IssueReader {
  const issue: IssueDetail = {
    assignees: [],
    body: '',
    closeReason: null,
    closedAt: null,
    comments: [],
    createdAt: '2026-08-16T00:00:00.000Z',
    createdBy,
    id: 'issue-1',
    issueNumber: 1,
    labels: [],
    repositoryId: privateRepository.id,
    status: 'open',
    title: 'Actionable work',
    updatedAt: '2026-08-16T00:00:00.000Z',
    version: 1
  };
  return {
    async findAccessibleIssue() {
      return issue;
    },
    async findAccessibleIssueById() {
      return issue;
    },
    async listAccessibleIssues() {
      return { issues: [issue], total: 1 };
    }
  };
}

describe('collaboration commands', () => {
  it("lets Read create/comment but denies editing somebody else's private Issue", async () => {
    const executeIssueCommand = vi.fn().mockResolvedValue({ ok: false, reason: 'state-changed' });
    const useCase = new ExecuteIssueCommand(
      identityProvider('actor-1'),
      repositoryReader(),
      accessReader('read'),
      issueReader('issue-author'),
      { executeIssueCommand }
    );

    const create = {
      body: '',
      repositoryId: privateRepository.id,
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
        repositoryId: privateRepository.id,
        title: 'Changed title',
        type: 'edit'
      })
    ).resolves.toEqual({ ok: false, reason: 'forbidden' });
    expect(executeIssueCommand).not.toHaveBeenCalled();
  });

  it('lets an Issue author edit and close their own Issue without upgrading their Repository Role', async () => {
    const executeIssueCommand = vi.fn().mockResolvedValue({ ok: false, reason: 'state-changed' });
    const useCase = new ExecuteIssueCommand(
      identityProvider('issue-author'),
      repositoryReader(),
      accessReader('read'),
      issueReader('issue-author'),
      { executeIssueCommand }
    );

    const edit = {
      body: 'Author edit',
      expectedVersion: 1,
      issueId: 'issue-1',
      repositoryId: privateRepository.id,
      title: 'Author changed title',
      type: 'edit' as const
    };
    await expect(useCase.execute(edit)).resolves.toEqual({ ok: false, reason: 'state-changed' });
    expect(executeIssueCommand).toHaveBeenCalledWith(edit);

    const close = {
      closeReason: 'completed' as const,
      expectedVersion: 1,
      issueId: 'issue-1',
      repositoryId: privateRepository.id,
      type: 'close' as const
    };
    await expect(useCase.execute(close)).resolves.toEqual({ ok: false, reason: 'state-changed' });
    expect(executeIssueCommand).toHaveBeenCalledWith(close);
  });

  it('lets Triage manage Issue state without granting Page-style content editing semantics', async () => {
    const executeIssueCommand = vi.fn().mockResolvedValue({ ok: false, reason: 'state-changed' });
    const useCase = new ExecuteIssueCommand(
      identityProvider('actor-1'),
      repositoryReader(),
      accessReader('triage'),
      issueReader(),
      { executeIssueCommand }
    );
    const close = {
      closeReason: 'completed' as const,
      expectedVersion: 4,
      issueId: 'issue-1',
      repositoryId: privateRepository.id,
      type: 'close' as const
    };

    await expect(useCase.execute(close)).resolves.toEqual({ ok: false, reason: 'state-changed' });
    expect(executeIssueCommand).toHaveBeenCalledWith(close);
  });

  it('uses authenticated public participation without fabricating a Repository Role', async () => {
    const executeIssueCommand = vi.fn().mockResolvedValue({ ok: false, reason: 'state-changed' });
    const issueUseCase = new ExecuteIssueCommand(
      identityProvider('actor-1'),
      repositoryReader(publicRepository),
      accessReader(null),
      issueReader('actor-1'),
      { executeIssueCommand }
    );
    const createIssue = {
      body: '',
      repositoryId: publicRepository.id,
      title: 'Public issue',
      type: 'create' as const
    };
    await expect(issueUseCase.execute(createIssue)).resolves.toEqual({
      ok: false,
      reason: 'state-changed'
    });
    expect(executeIssueCommand).toHaveBeenCalledWith(createIssue);

    const executeDiscussionCommand = vi
      .fn()
      .mockResolvedValue({ ok: false, reason: 'state-changed' });
    const discussionUseCase = new ExecuteDiscussionCommand(
      identityProvider('actor-1'),
      repositoryReader(publicRepository),
      accessReader(null),
      { executeDiscussionCommand }
    );
    const createDiscussion = {
      body: '',
      category: 'general' as const,
      repositoryId: publicRepository.id,
      title: 'Public discussion',
      type: 'create' as const
    };
    await expect(discussionUseCase.execute(createDiscussion)).resolves.toEqual({
      ok: false,
      reason: 'state-changed'
    });
    expect(executeDiscussionCommand).toHaveBeenCalledWith(createDiscussion);
  });

  it('reserves Announcement creation to Maintain or Admin', async () => {
    const executeDiscussionCommand = vi
      .fn()
      .mockResolvedValue({ ok: false, reason: 'state-changed' });
    const command = {
      body: '',
      category: 'announcement' as const,
      repositoryId: privateRepository.id,
      title: 'Policy update',
      type: 'create' as const
    };

    const writeUseCase = new ExecuteDiscussionCommand(
      identityProvider('actor-1'),
      repositoryReader(),
      accessReader('write'),
      { executeDiscussionCommand }
    );
    await expect(writeUseCase.execute(command)).resolves.toEqual({
      ok: false,
      reason: 'forbidden'
    });
    expect(executeDiscussionCommand).not.toHaveBeenCalled();

    const maintainUseCase = new ExecuteDiscussionCommand(
      identityProvider('actor-1'),
      repositoryReader(),
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
    const executeDiscussionCommand = vi
      .fn()
      .mockResolvedValue({ ok: false, reason: 'state-changed' });
    const command = {
      expectedVersion: 1,
      discussionId: 'discussion-1',
      repositoryId: privateRepository.id,
      type: 'lock' as const
    };

    const readUseCase = new ExecuteDiscussionCommand(
      identityProvider('actor-1'),
      repositoryReader(),
      accessReader('read'),
      { executeDiscussionCommand }
    );
    await expect(readUseCase.execute(command)).resolves.toEqual({ ok: false, reason: 'forbidden' });
    expect(executeDiscussionCommand).not.toHaveBeenCalled();

    const triageUseCase = new ExecuteDiscussionCommand(
      identityProvider('actor-1'),
      repositoryReader(),
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
