import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import { SupabaseRepositoryCreationAccessReader } from '../src/access/supabase-repository-creation-access-reader';
import type { Database } from '../src/generated/database.types';

describe('SupabaseRepositoryCreationAccessReader', () => {
  it('returns personal and Organization membership facts without deciding Access Policy', async () => {
    const profileMaybeSingle = vi.fn(async () => ({
      data: { display_name: 'Actor', id: 'user-1', username: 'actor' },
      error: null
    }));
    const membershipEq = vi.fn(async () => ({
      data: [
        {
          organizations: { id: 'organization-1', name: 'Operations', slug: 'operations' },
          role: 'admin'
        },
        {
          organizations: { id: 'organization-2', name: 'Members', slug: 'members' },
          role: 'member'
        }
      ],
      error: null
    }));
    const from = vi.fn((table: string) => ({
      select() {
        return table === 'profiles'
          ? {
              eq() {
                return { maybeSingle: profileMaybeSingle };
              }
            }
          : { eq: membershipEq };
      }
    }));
    const reader = new SupabaseRepositoryCreationAccessReader({
      from
    } as unknown as SupabaseClient<Database>);

    await expect(reader.listRepositoryCreationOwnerCandidates('user-1')).resolves.toEqual([
      {
        name: 'Actor',
        organizationRole: null,
        owner: { kind: 'user', userId: 'user-1' },
        slug: 'actor'
      },
      {
        name: 'Operations',
        organizationRole: 'admin',
        owner: { kind: 'organization', organizationId: 'organization-1' },
        slug: 'operations'
      },
      {
        name: 'Members',
        organizationRole: 'member',
        owner: { kind: 'organization', organizationId: 'organization-2' },
        slug: 'members'
      }
    ]);
    expect(membershipEq).toHaveBeenCalledWith('user_id', 'user-1');
  });
});
