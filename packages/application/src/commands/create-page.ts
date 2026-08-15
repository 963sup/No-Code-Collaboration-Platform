import { decideRepositoryCapability } from '@no-code-collaboration-platform/domain/access';
import { createPageDraft, type PageDetail } from '@no-code-collaboration-platform/domain/resource';

import type { IdentityProvider } from '../ports/identity-provider';
import type { PageWriter } from '../ports/page-repository';
import type { RepositoryAccessReader } from '../ports/repository-access-reader';
import type { RepositoryReader } from '../ports/repository-reader';

export interface CreatePageInput {
  readonly repositoryId: string;
  readonly title: string;
}

export type CreatePageFailureReason =
  | 'forbidden'
  | 'invalid-title'
  | 'repository-unavailable'
  | 'unauthenticated';

export type CreatePageResult =
  | {
      readonly ok: true;
      readonly page: PageDetail;
    }
  | {
      readonly ok: false;
      readonly reason: CreatePageFailureReason;
    };

export class CreatePage {
  public constructor(
    private readonly identityProvider: IdentityProvider,
    private readonly repositoryReader: RepositoryReader,
    private readonly repositoryAccessReader: RepositoryAccessReader,
    private readonly pageWriter: PageWriter
  ) {}

  public async execute(input: CreatePageInput): Promise<CreatePageResult> {
    const actor = await this.identityProvider.getCurrentIdentity();
    if (actor === null) return { ok: false, reason: 'unauthenticated' };

    const repository = await this.repositoryReader.findAccessibleRepositoryById(input.repositoryId);
    if (repository === null) return { ok: false, reason: 'repository-unavailable' };

    const sources = await this.repositoryAccessReader.readRepositoryAccess({
      actorId: actor.id,
      repositoryId: repository.id
    });
    const decision = decideRepositoryCapability(
      { sources, visibility: repository.visibility },
      'resource.create'
    );

    if (!decision.allowed) return { ok: false, reason: 'forbidden' };

    const draft = createPageDraft({
      createdBy: actor.id,
      repositoryId: repository.id,
      title: input.title
    });
    if (draft === null) return { ok: false, reason: 'invalid-title' };

    const page = await this.pageWriter.createPage(draft);
    return page === null ? { ok: false, reason: 'forbidden' } : { ok: true, page };
  }
}
