import type {
  OrganizationDraft,
  OrganizationSummary
} from '@no-code-collaboration-platform/domain/organization';

export type OrganizationPersistenceResult =
  | { readonly ok: true; readonly organization: OrganizationSummary }
  | { readonly ok: false; readonly reason: 'forbidden' | 'slug-taken' };

export interface OrganizationWriter {
  createOrganization(draft: OrganizationDraft): Promise<OrganizationPersistenceResult>;
}
