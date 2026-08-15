import {
  createRepositoryDraft,
  type RepositoryOwner,
  type RepositorySummary
} from '@no-code-collaboration-platform/domain/repository';

import type { IdentityProvider } from '../ports/identity-provider';
import type { RepositoryWriter } from '../ports/repository-creation';
import type { RepositoryCreationAccessPolicy } from '../policies/repository-creation-access-policy';

export interface CreateRepositoryInput {
  readonly description?: string | null;
  readonly name: string;
  readonly owner: RepositoryOwner;
  readonly slug: string;
  readonly visibility: string;
}

export type CreateRepositoryFailureReason =
  | 'forbidden'
  | 'invalid-input'
  | 'slug-taken'
  | 'unauthenticated';

export type CreateRepositoryResult =
  | {
      readonly ok: true;
      readonly ownerSlug: string;
      readonly repository: RepositorySummary;
    }
  | {
      readonly ok: false;
      readonly reason: CreateRepositoryFailureReason;
    };

export class CreateRepository {
  public constructor(
    private readonly identityProvider: IdentityProvider,
    private readonly accessPolicy: RepositoryCreationAccessPolicy,
    private readonly repositoryWriter: RepositoryWriter
  ) {}

  public async execute(input: CreateRepositoryInput): Promise<CreateRepositoryResult> {
    const actor = await this.identityProvider.getCurrentIdentity();
    if (actor === null) return { ok: false, reason: 'unauthenticated' };

    const selectedOwner = await this.accessPolicy.authorizeOwner(actor.id, input.owner);
    if (!selectedOwner) return { ok: false, reason: 'forbidden' };

    const draft = createRepositoryDraft({
      createdBy: actor.id,
      description: input.description,
      name: input.name,
      owner: selectedOwner.owner,
      slug: input.slug,
      visibility: input.visibility
    });
    if (!draft) return { ok: false, reason: 'invalid-input' };

    const persisted = await this.repositoryWriter.createRepository(draft);
    if (!persisted.ok) return persisted;

    return {
      ok: true,
      ownerSlug: selectedOwner.slug,
      repository: persisted.repository
    };
  }
}
