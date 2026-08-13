import {
  createPageDraft,
  effectiveRepositoryRole,
  hasRepositoryCapability,
  type PageDetail
} from '@no-code-collaboration-platform/domain';

import type { IdentityProvider } from '../ports/identity-provider';
import type { PageWriter } from '../ports/page-repository';
import type { RepositoryAuthoritySourceReader } from '../ports/repository-authority-source-reader';
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
    private readonly authoritySourceReader: RepositoryAuthoritySourceReader,
    private readonly pageWriter: PageWriter
  ) {}

  public async execute(input: CreatePageInput): Promise<CreatePageResult> {
    const actor = await this.identityProvider.getCurrentIdentity();
    if (actor === null) return { ok: false, reason: 'unauthenticated' };

    const repository = await this.repositoryReader.findAccessibleRepositoryById(input.repositoryId);
    if (repository === null) return { ok: false, reason: 'repository-unavailable' };

    const sources = await this.authoritySourceReader.readRepositoryAuthoritySources({
      actorId: actor.id,
      organizationId: repository.organizationId,
      repositoryId: repository.id
    });
    const role = effectiveRepositoryRole(sources);

    if (role === null || !hasRepositoryCapability(role, 'resource.create')) {
      return { ok: false, reason: 'forbidden' };
    }

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
