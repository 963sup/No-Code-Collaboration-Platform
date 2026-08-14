import type { IdentityProvider } from '../ports/identity-provider';
import type {
  RepositoryCreationOwner,
  RepositoryCreationOwnerReader
} from '../ports/repository-creation';

export class ListRepositoryCreationOwners {
  public constructor(
    private readonly identityProvider: IdentityProvider,
    private readonly ownerReader: RepositoryCreationOwnerReader
  ) {}

  public async execute(): Promise<readonly RepositoryCreationOwner[]> {
    const actor = await this.identityProvider.getCurrentIdentity();
    if (actor === null) return [];
    return this.ownerReader.listCreatableRepositoryOwners(actor.id);
  }
}
