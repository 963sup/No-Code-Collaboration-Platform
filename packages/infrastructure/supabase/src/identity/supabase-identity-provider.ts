import type {
  AuthenticationResult,
  EmailVerificationProof,
  EmailVerificationResult,
  IdentityProvider,
  PasswordCredentials,
  RegistrationCredentials,
  RegistrationResult,
  SignOutScope,
  VerificationDeliveryResult
} from '@no-code-collaboration-platform/application';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';
import { mapSupabaseIdentity } from '../mappers/supabase-identity-mapper';

const RATE_LIMIT_CODES = new Set([
  'over_email_send_rate_limit',
  'over_request_rate_limit'
]);

const PROVIDER_UNAVAILABLE_CODES = new Set(['request_timeout', 'unexpected_failure']);

const SIGN_OUT_SCOPE = {
  'all-sessions': 'global',
  'current-session': 'local',
  'other-sessions': 'others'
} as const satisfies Record<SignOutScope, 'global' | 'local' | 'others'>;

function isProviderUnavailable(error: { readonly code?: string; readonly status?: number }) {
  return (error.status ?? 0) >= 500 || PROVIDER_UNAVAILABLE_CODES.has(error.code ?? '');
}

export class SupabaseIdentityProvider implements IdentityProvider {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async authenticateWithPassword(
    credentials: PasswordCredentials
  ): Promise<AuthenticationResult> {
    const { data, error } = await this.client.auth.signInWithPassword(credentials);

    if (error) {
      if (error.code === 'email_not_confirmed') {
        return {
          ok: false,
          reason: 'email-verification-required'
        };
      }

      return {
        ok: false,
        reason:
          error.code === 'invalid_credentials' || error.code === 'user_not_found'
            ? 'invalid-credentials'
            : 'provider-unavailable'
      };
    }

    if (!data.user) {
      return {
        ok: false,
        reason: 'provider-unavailable'
      };
    }

    return {
      identity: mapSupabaseIdentity({
        email: data.user.email,
        id: data.user.id
      }),
      ok: true
    };
  }

  public async getCurrentIdentity() {
    const { data, error } = await this.client.auth.getClaims();

    if (error || !data?.claims || typeof data.claims.sub !== 'string') return null;

    return mapSupabaseIdentity({
      email: typeof data.claims.email === 'string' ? data.claims.email : null,
      id: data.claims.sub
    });
  }

  public async registerWithPassword(
    credentials: RegistrationCredentials
  ): Promise<RegistrationResult> {
    const { data, error } = await this.client.auth.signUp(credentials);

    if (error) {
      if (RATE_LIMIT_CODES.has(error.code ?? '')) {
        return {
          ok: false,
          reason: 'rate-limited'
        };
      }

      if (error.code === 'weak_password') {
        return {
          ok: false,
          reason: 'weak-password'
        };
      }

      if (error.code === 'signup_disabled') {
        return {
          ok: false,
          reason: 'registration-disabled'
        };
      }

      if (error.code === 'email_exists' || error.code === 'user_already_exists') {
        return {
          ok: true,
          status: 'email-verification-required'
        };
      }

      return {
        ok: false,
        reason: 'provider-unavailable'
      };
    }

    if (data.session && data.user) {
      return {
        identity: mapSupabaseIdentity({
          email: data.user.email,
          id: data.user.id
        }),
        ok: true,
        status: 'authenticated'
      };
    }

    return {
      ok: true,
      status: 'email-verification-required'
    };
  }

  public async resendEmailVerification(email: string): Promise<VerificationDeliveryResult> {
    const { error } = await this.client.auth.resend({
      email,
      type: 'signup'
    });

    if (!error) return { ok: true };

    return {
      ok: false,
      reason: RATE_LIMIT_CODES.has(error.code ?? '') ? 'rate-limited' : 'provider-unavailable'
    };
  }

  public async signOut(scope: SignOutScope): Promise<void> {
    const { error } = await this.client.auth.signOut({
      scope: SIGN_OUT_SCOPE[scope]
    });

    if (error) throw new Error('Unable to sign out from the identity provider.', { cause: error });
  }

  public async verifyEmail(proof: EmailVerificationProof): Promise<EmailVerificationResult> {
    const { data, error } =
      proof.kind === 'code'
        ? await this.client.auth.verifyOtp({
            email: proof.email,
            token: proof.code,
            type: 'email'
          })
        : await this.client.auth.verifyOtp({
            token_hash: proof.tokenHash,
            type: 'email'
          });

    if (error) {
      if (RATE_LIMIT_CODES.has(error.code ?? '')) {
        return {
          ok: false,
          reason: 'rate-limited'
        };
      }

      if (error.code === 'otp_expired') {
        return {
          ok: false,
          reason: 'expired-code'
        };
      }

      return {
        ok: false,
        reason: isProviderUnavailable(error) ? 'provider-unavailable' : 'invalid-code'
      };
    }

    if (!data.user) {
      return {
        ok: false,
        reason: 'provider-unavailable'
      };
    }

    return {
      identity: mapSupabaseIdentity({
        email: data.user.email,
        id: data.user.id
      }),
      ok: true
    };
  }
}
