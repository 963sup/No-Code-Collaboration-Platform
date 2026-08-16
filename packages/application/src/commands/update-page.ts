import { decideRepositoryCapability } from '@no-code-collaboration-platform/domain/access';
import { createPageUpdate, type PageDetail } from '@no-code-collaboration-platform/domain/resource';

import type { IdentityProvider } from '../ports/identity-provider';
import type { PageWriter } from '../ports/page-repository';
import type { RepositoryAccessReader } from '../ports/repository-access-reader';
import type { RepositoryReader } from '../ports/repository-reader';

export interface UpdatePageInput {
  readonly body: string;
  readonly expectedUpdatedAt: string;
  readonly pageId: string;
  readonly repositoryId: string;
  readonly title: string;
}

export type UpdatePageFailureReason =
  | 'forbidden'
  | 'invalid-page'
  | 'repository-unavailable'
  | 'state-changed'
  | 'unauthenticated';

export type UpdatePageResult =
  | {
      readonly ok: true;
      readonly page: PageDetail;
    }
  | {
      readonly ok: false;
      readonly reason: UpdatePageFailureReason;
    };

export class UpdatePage {
  public constructor(
    private readonly identityProvider: IdentityProvider,
    private readonly repositoryReader: RepositoryReader,
    private readonly repositoryAccessReader: RepositoryAccessReader,
    private readonly pageWriter: PageWriter
  ) {}

  public async execute(input: UpdatePageInput): Promise<UpdatePageResult> {
    const actor = await this.identityProvider.getCurrentIdentity();
    if (actor === null) return { ok: false, reason: 'unauthenticated' };

    const repository = await this.repositoryReader.findAccessibleRepositoryById(input.repositoryId);
    if (repository === null) return { ok: false, reason: 'repository-unavailable' };

    const sources = await this.repositoryAccessReader.readRepositoryAccess({
      actorId: actor.id,
      repositoryId: repository.id
    });
    const decision = decideRepositoryCapability(
      { actorTrust: 'authenticated', sources, visibility: repository.visibility },
      'page.update'
    );

    if (!decision.allowed) return { ok: false, reason: 'forbidden' };

    const update = createPageUpdate({
      body: input.body,
      expectedUpdatedAt: input.expectedUpdatedAt,
      id: input.pageId,
      repositoryId: repository.id,
      title: input.title
    });
    if (update === null) return { ok: false, reason: 'invalid-page' };

    const page = await this.pageWriter.updatePage(update);
    return page === null ? { ok: false, reason: 'state-changed' } : { ok: true, page };
  }
}
