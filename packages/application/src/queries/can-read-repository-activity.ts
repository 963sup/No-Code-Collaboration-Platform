import {
  effectiveRepositoryRole,
  hasRepositoryCapability
} from '@no-code-collaboration-platform/domain';

import type { RepositoryAccessReader } from '../ports/repository-access-reader';

export interface CanReadRepositoryActivityInput {
  readonly actorId: string;
  readonly repositoryId: string;
}

export class CanReadRepositoryActivity {
  public constructor(private readonly repositoryAccessReader: RepositoryAccessReader) {}

  public async execute(input: CanReadRepositoryActivityInput): Promise<boolean> {
    const sources = await this.repositoryAccessReader.readRepositoryAccess(input);
    const role = effectiveRepositoryRole(sources);

    return role !== null && hasRepositoryCapability(role, 'repository.view');
  }
}
