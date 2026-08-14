import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import type { Database } from '../src/generated/database.types';
import { SupabaseOrganizationCreation } from '../src/organizations/supabase-organization-creation';

const draft = {
  createdBy: '00000000-0000-4000-8000-000000000001',
  name: 'Operations Group',
  slug: 'operations-group'
};

describe('SupabaseOrganizationCreation', () => {
  it('uses a minimal INSERT so founder Membership visibility is read in a later request', async () => {
    const insert = vi.fn(async () => ({ data: null, error: null }));
    const from = vi.fn(() => ({ insert }));
    const adapter = new SupabaseOrganizationCreation({
      from
    } as unknown as SupabaseClient<Database>);

    const result = await adapter.createOrganization(draft);

    expect(from).toHaveBeenCalledWith('organizations');
    expect(insert).toHaveBeenCalledWith({
      created_by: draft.createdBy,
      id: expect.any(String),
      name: draft.name,
      slug: draft.slug
    });
    expect(result).toEqual({
      ok: true,
      organization: {
        createdBy: draft.createdBy,
        id: expect.any(String),
        name: draft.name,
        slug: draft.slug
      }
    });
  });

  it.each([
    ['23505', 'slug-taken'],
    ['42501', 'forbidden']
  ] as const)('maps provider code %s to %s', async (code, reason) => {
    const client = {
      from() {
        return {
          async insert() {
            return { data: null, error: { code } };
          }
        };
      }
    } as unknown as SupabaseClient<Database>;

    await expect(
      new SupabaseOrganizationCreation(client).createOrganization(draft)
    ).resolves.toEqual({ ok: false, reason });
  });
});
