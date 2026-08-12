import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import type { Database } from '../src/generated/database.types';
import { SupabaseIdentityProvider } from '../src/identity/supabase-identity-provider';

describe('SupabaseIdentityProvider', () => {
  it('does not expose whether a registration email already exists', async () => {
    const signUp = vi.fn(async () => ({
      data: {
        session: null,
        user: null
      },
      error: {
        code: 'user_already_exists'
      }
    }));
    const client = {
      auth: {
        signUp
      }
    } as unknown as SupabaseClient<Database>;

    await expect(
      new SupabaseIdentityProvider(client).registerWithPassword({
        email: 'actor@example.com',
        password: 'correct-horse-battery-staple'
      })
    ).resolves.toEqual({
      ok: true,
      status: 'email-verification-required'
    });
  });

  it('routes an unverified credential to email proof without exposing a provider code', async () => {
    const signInWithPassword = vi.fn(async () => ({
      data: {
        session: null,
        user: null
      },
      error: {
        code: 'email_not_confirmed'
      }
    }));
    const client = {
      auth: {
        signInWithPassword
      }
    } as unknown as SupabaseClient<Database>;

    await expect(
      new SupabaseIdentityProvider(client).authenticateWithPassword({
        email: 'actor@example.com',
        password: 'correct-horse-battery-staple'
      })
    ).resolves.toEqual({
      ok: false,
      reason: 'email-verification-required'
    });
  });

  it.each(['email_exists', 'user_not_found', 'email_not_confirmed'] as const)(
    'does not expose account state when resend returns %s',
    async (code) => {
      const resend = vi.fn(async () => ({
        data: {
          messageId: null,
          session: null,
          user: null
        },
        error: {
          code,
          status: 422
        }
      }));
      const client = {
        auth: {
          resend
        }
      } as unknown as SupabaseClient<Database>;

      await expect(
        new SupabaseIdentityProvider(client).resendEmailVerification('actor@example.com')
      ).resolves.toEqual({ ok: true });
    }
  );

  it('keeps resend rate limits explicit', async () => {
    const resend = vi.fn(async () => ({
      data: {
        messageId: null,
        session: null,
        user: null
      },
      error: {
        code: 'over_email_send_rate_limit',
        status: 429
      }
    }));
    const client = {
      auth: {
        resend
      }
    } as unknown as SupabaseClient<Database>;

    await expect(
      new SupabaseIdentityProvider(client).resendEmailVerification('actor@example.com')
    ).resolves.toEqual({
      ok: false,
      reason: 'rate-limited'
    });
  });

  it('keeps resend provider outages explicit', async () => {
    const resend = vi.fn(async () => ({
      data: {
        messageId: null,
        session: null,
        user: null
      },
      error: {
        code: 'unexpected_failure',
        status: 503
      }
    }));
    const client = {
      auth: {
        resend
      }
    } as unknown as SupabaseClient<Database>;

    await expect(
      new SupabaseIdentityProvider(client).resendEmailVerification('actor@example.com')
    ).resolves.toEqual({
      ok: false,
      reason: 'provider-unavailable'
    });
  });

  it.each([
    ['current-session', 'local'],
    ['other-sessions', 'others'],
    ['all-sessions', 'global']
  ] as const)('maps %s to the explicit Supabase %s scope', async (scope, providerScope) => {
    const signOut = vi.fn(async () => ({ error: null }));
    const client = {
      auth: {
        signOut
      }
    } as unknown as SupabaseClient<Database>;

    await new SupabaseIdentityProvider(client).signOut(scope);

    expect(signOut).toHaveBeenCalledWith({ scope: providerScope });
  });

  it('maps a six-digit email proof to the provider OTP contract', async () => {
    const verifyOtp = vi.fn(async () => ({
      data: {
        user: {
          email: 'actor@example.com',
          id: 'actor-1'
        }
      },
      error: null
    }));
    const client = {
      auth: {
        verifyOtp
      }
    } as unknown as SupabaseClient<Database>;

    await expect(
      new SupabaseIdentityProvider(client).verifyEmail({
        code: '123456',
        email: 'actor@example.com',
        kind: 'code'
      })
    ).resolves.toEqual({
      identity: {
        email: 'actor@example.com',
        id: 'actor-1'
      },
      ok: true
    });

    expect(verifyOtp).toHaveBeenCalledWith({
      email: 'actor@example.com',
      token: '123456',
      type: 'email'
    });
  });

  it('maps a token-hash proof without exposing the Supabase API to the Application layer', async () => {
    const verifyOtp = vi.fn(async () => ({
      data: {
        user: {
          email: 'actor@example.com',
          id: 'actor-1'
        }
      },
      error: null
    }));
    const client = {
      auth: {
        verifyOtp
      }
    } as unknown as SupabaseClient<Database>;

    await new SupabaseIdentityProvider(client).verifyEmail({
      kind: 'token-hash',
      tokenHash: 'opaque-token-hash'
    });

    expect(verifyOtp).toHaveBeenCalledWith({
      token_hash: 'opaque-token-hash',
      type: 'email'
    });
  });

  it('does not expose whether a password recovery email exists', async () => {
    const resetPasswordForEmail = vi.fn(async () => ({
      data: {},
      error: {
        code: 'user_not_found',
        status: 400
      }
    }));
    const client = {
      auth: {
        resetPasswordForEmail
      }
    } as unknown as SupabaseClient<Database>;

    await expect(
      new SupabaseIdentityProvider(client).requestPasswordRecovery('unknown@example.com')
    ).resolves.toEqual({ ok: true });
  });

  it.each(['over_email_send_rate_limit', 'over_request_rate_limit'] as const)(
    'does not expose recovery delivery throttling through %s',
    async (code) => {
      const resetPasswordForEmail = vi.fn(async () => ({
        data: {},
        error: {
          code,
          status: 429
        }
      }));
      const client = {
        auth: {
          resetPasswordForEmail
        }
      } as unknown as SupabaseClient<Database>;

      await expect(
        new SupabaseIdentityProvider(client).requestPasswordRecovery('actor@example.com')
      ).resolves.toEqual({ ok: true });
    }
  );

  it('keeps recovery provider outages explicit without revealing account state', async () => {
    const resetPasswordForEmail = vi.fn(async () => ({
      data: {},
      error: {
        code: 'unexpected_failure',
        status: 503
      }
    }));
    const client = {
      auth: {
        resetPasswordForEmail
      }
    } as unknown as SupabaseClient<Database>;

    await expect(
      new SupabaseIdentityProvider(client).requestPasswordRecovery('actor@example.com')
    ).resolves.toEqual({
      ok: false,
      reason: 'provider-unavailable'
    });
  });

  it('maps a recovery token hash to the provider recovery proof', async () => {
    const verifyOtp = vi.fn(async () => ({
      data: {
        user: {
          email: 'actor@example.com',
          id: 'actor-1'
        }
      },
      error: null
    }));
    const client = {
      auth: {
        verifyOtp
      }
    } as unknown as SupabaseClient<Database>;

    await expect(
      new SupabaseIdentityProvider(client).verifyPasswordRecovery('opaque-recovery-token-hash')
    ).resolves.toEqual({
      identity: {
        email: 'actor@example.com',
        id: 'actor-1'
      },
      ok: true
    });

    expect(verifyOtp).toHaveBeenCalledWith({
      token_hash: 'opaque-recovery-token-hash',
      type: 'recovery'
    });
  });

  it('keeps recovery sessions out of the ordinary product identity boundary', async () => {
    const getClaims = vi.fn(async () => ({
      data: {
        claims: {
          amr: [{ method: 'recovery', timestamp: 1 }],
          email: 'actor@example.com',
          sub: 'actor-1'
        }
      },
      error: null
    }));
    const client = {
      auth: {
        getClaims
      }
    } as unknown as SupabaseClient<Database>;
    const provider = new SupabaseIdentityProvider(client);

    await expect(provider.getCurrentIdentity()).resolves.toBeNull();
    await expect(provider.getPasswordRecoveryIdentity()).resolves.toEqual({
      email: 'actor@example.com',
      id: 'actor-1'
    });
  });

  it('rejects password reset from an ordinary authenticated session', async () => {
    const getClaims = vi.fn(async () => ({
      data: {
        claims: {
          amr: [{ method: 'password', timestamp: 1 }],
          email: 'actor@example.com',
          sub: 'actor-1'
        }
      },
      error: null
    }));
    const updateUser = vi.fn(async () => ({ data: { user: null }, error: null }));
    const client = {
      auth: {
        getClaims,
        updateUser
      }
    } as unknown as SupabaseClient<Database>;

    await expect(
      new SupabaseIdentityProvider(client).resetPassword('new-secure-password')
    ).resolves.toEqual({
      ok: false,
      reason: 'invalid-recovery-session'
    });
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('updates the password only after a signed recovery authentication method is present', async () => {
    const getClaims = vi.fn(async () => ({
      data: {
        claims: {
          amr: [{ method: 'recovery', timestamp: 1 }],
          email: 'actor@example.com',
          sub: 'actor-1'
        }
      },
      error: null
    }));
    const updateUser = vi.fn(async () => ({ data: { user: {} }, error: null }));
    const client = {
      auth: {
        getClaims,
        updateUser
      }
    } as unknown as SupabaseClient<Database>;

    await expect(
      new SupabaseIdentityProvider(client).resetPassword('new-secure-password')
    ).resolves.toEqual({ ok: true });
    expect(updateUser).toHaveBeenCalledWith({ password: 'new-secure-password' });
  });
});
