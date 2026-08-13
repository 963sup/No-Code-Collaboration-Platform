import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import type { Database } from '../src/generated/database.types';
import { SupabaseIdentityProvider } from '../src/identity/supabase-identity-provider';

describe('SupabaseIdentityProvider password recovery PKCE', () => {
  it('exchanges a Human-submitted PKCE recovery proof for a recovery Session', async () => {
    const exchangeCodeForSession = vi.fn(async () => ({
      data: {
        session: {},
        user: {
          email: 'actor@example.com',
          id: 'actor-1'
        }
      },
      error: null
    }));
    const client = {
      auth: {
        exchangeCodeForSession
      }
    } as unknown as SupabaseClient<Database>;
    const response = new Response(null, {
      headers: {
        location: 'http://127.0.0.1:3000/?code=recovery-auth-code'
      },
      status: 303
    });
    const providerFetch = vi.fn(async () => response);
    const provider = new SupabaseIdentityProvider(client, {
      fetch: providerFetch,
      projectUrl: 'http://127.0.0.1:54321',
      publishableKey: 'sb_publishable_test'
    });

    await expect(
      provider.verifyPasswordRecovery('pkce_opaque-recovery-token-hash')
    ).resolves.toEqual({
      identity: {
        email: 'actor@example.com',
        id: 'actor-1'
      },
      ok: true
    });

    expect(providerFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:54321/auth/v1/verify?token=pkce_opaque-recovery-token-hash&type=recovery',
      {
        headers: {
          apikey: 'sb_publishable_test'
        },
        redirect: 'manual'
      }
    );
    expect(exchangeCodeForSession).toHaveBeenCalledWith('recovery-auth-code');
  });

  it('fails closed instead of converting a non-PKCE recovery proof into an ordinary OTP Session', async () => {
    const exchangeCodeForSession = vi.fn();
    const client = {
      auth: {
        exchangeCodeForSession
      }
    } as unknown as SupabaseClient<Database>;
    const providerFetch = vi.fn();
    const provider = new SupabaseIdentityProvider(client, {
      fetch: providerFetch,
      projectUrl: 'http://127.0.0.1:54321',
      publishableKey: 'sb_publishable_test'
    });

    await expect(
      provider.verifyPasswordRecovery('opaque-recovery-token-hash')
    ).resolves.toEqual({
      ok: false,
      reason: 'invalid-code'
    });
    expect(providerFetch).not.toHaveBeenCalled();
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });
});
