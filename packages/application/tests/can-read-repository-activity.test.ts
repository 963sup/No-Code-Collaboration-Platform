import { describe, expect, it } from 'vitest';

import { CanReadRepositoryActivity, type RepositoryAccessReader } from '../src/index';

function reader(
  directRole: 'read' | 'write' | 'maintain' | 'admin' | null,
  governanceRole: 'read' | 'write' | 'maintain' | 'admin' | null
): RepositoryAccessReader {
  return {
    async readRepositoryAccess() {
      return { directRole, governanceRole };
    }
  };
}

const input = {
  actorId: 'user-1',
  repositoryId: 'repository-1'
};

describe('CanReadRepositoryActivity', () => {
  it('allows a direct Viewer because repository.view is an accepted authority capability', async () => {
    await expect(new CanReadRepositoryActivity(reader('read', null)).execute(input)).resolves.toBe(
      true
    );
  });

  it('allows ownership or governance-derived admin authority without fabricating a direct Grant', async () => {
    await expect(new CanReadRepositoryActivity(reader(null, 'admin')).execute(input)).resolves.toBe(
      true
    );
  });

  it('denies when no persisted authority source yields a Repository Role', async () => {
    await expect(new CanReadRepositoryActivity(reader(null, null)).execute(input)).resolves.toBe(
      false
    );
  });
});
