import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import type { Database } from '../src/generated/database.types';
import { SupabaseRepositoryWriter } from '../src/repositories/supabase-repository-creation';

const draft = {
  createdBy: '00000000-0000-4000-8000-000000000001',
  description: 'Shared planning space',
  name: 'Customer workspace',
  owner: {
    kind: 'user' as const,
    userId: '00000000-0000-4000-8000-000000000001'
  },
  slug: 'customer-workspace',
  visibility: 'private' as const
};

describe('SupabaseRepositoryWriter', () => {
  it('uses a minimal INSERT response so private-Repository SELECT RLS runs in a later request', async () => {
    const insert = vi.fn(async () => ({ data: null, error: null }));
    const from = vi.fn(() => ({ insert }));
    const adapter = new SupabaseRepositoryWriter({ from } as unknown as SupabaseClient<Database>);

    const result = await adapter.createRepository(draft);

    expect(from).toHaveBeenCalledWith('repositories');
    expect(insert).toHaveBeenCalledWith({
      created_by: draft.createdBy,
      description: draft.description,
      id: expect.any(String),
      name: draft.name,
      owner_organization_id: null,
      owner_user_id: draft.owner.userId,
      slug: draft.slug,
      visibility: draft.visibility
    });
    expect(result).toMatchObject({
      ok: true,
      repository: {
        description: draft.description,
        id: expect.any(String),
        name: draft.name,
        owner: draft.owner,
        slug: draft.slug,
        visibility: draft.visibility
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

    await expect(new SupabaseRepositoryWriter(client).createRepository(draft)).resolves.toEqual({
      ok: false,
      reason
    });
  });
});
