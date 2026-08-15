import {
  createOrganizationDraft,
  type OrganizationSummary
} from '@no-code-collaboration-platform/domain/organization';

import type { IdentityProvider } from '../ports/identity-provider';
import type { OrganizationWriter } from '../ports/organization-creation';

export interface CreateOrganizationInput {
  readonly name: string;
  readonly slug: string;
}

export type CreateOrganizationFailureReason =
  | 'forbidden'
  | 'invalid-input'
  | 'slug-taken'
  | 'unauthenticated';

export type CreateOrganizationResult =
  | { readonly ok: true; readonly organization: OrganizationSummary }
  | { readonly ok: false; readonly reason: CreateOrganizationFailureReason };

export class CreateOrganization {
  public constructor(
    private readonly identityProvider: IdentityProvider,
    private readonly organizationWriter: OrganizationWriter
  ) {}

  public async execute(input: CreateOrganizationInput): Promise<CreateOrganizationResult> {
    const actor = await this.identityProvider.getCurrentIdentity();
    if (actor === null) return { ok: false, reason: 'unauthenticated' };

    const draft = createOrganizationDraft({
      createdBy: actor.id,
      name: input.name,
      slug: input.slug
    });
    if (!draft) return { ok: false, reason: 'invalid-input' };

    return this.organizationWriter.createOrganization(draft);
  }
}
