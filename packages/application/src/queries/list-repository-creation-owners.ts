import type { IdentityProvider } from '../ports/identity-provider';
import type { RepositoryCreationOwner } from '../ports/repository-creation-access';
import type { RepositoryCreationAccessPolicy } from '../policies/repository-creation-access-policy';

export class ListRepositoryCreationOwners {
  public constructor(
    private readonly identityProvider: IdentityProvider,
    private readonly accessPolicy: RepositoryCreationAccessPolicy
  ) {}

  public async execute(): Promise<readonly RepositoryCreationOwner[]> {
    const actor = await this.identityProvider.getCurrentIdentity();
    if (actor === null) return [];
    return this.accessPolicy.listAuthorizedOwners(actor.id);
  }
}
