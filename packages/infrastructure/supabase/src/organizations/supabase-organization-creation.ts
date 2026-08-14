import type {
  OrganizationPersistenceResult,
  OrganizationWriter
} from '@no-code-collaboration-platform/application';
import type { OrganizationDraft } from '@no-code-collaboration-platform/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';

export class SupabaseOrganizationCreation implements OrganizationWriter {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async createOrganization(
    draft: OrganizationDraft
  ): Promise<OrganizationPersistenceResult> {
    const organizationId = crypto.randomUUID();

    // The creation trigger adds the founder-owner Membership. Keep this INSERT response minimal
    // because the Organization SELECT policy can observe that relationship only in a later request.
    const { error } = await this.client.from('organizations').insert({
      created_by: draft.createdBy,
      id: organizationId,
      name: draft.name,
      slug: draft.slug
    });

    if (error?.code === '23505') return { ok: false, reason: 'slug-taken' };
    if (error?.code === '42501') return { ok: false, reason: 'forbidden' };
    if (error) throw new Error('Unable to create the Organization.', { cause: error });

    return {
      ok: true,
      organization: {
        createdBy: draft.createdBy,
        id: organizationId,
        name: draft.name,
        slug: draft.slug
      }
    };
  }
}
