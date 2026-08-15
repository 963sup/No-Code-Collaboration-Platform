import type {
  AuthenticationResult,
  EmailVerificationProof,
  EmailVerificationResult,
  IdentityProvider,
  PasswordCredentials,
  PasswordRecoveryRequestResult,
  PasswordRecoveryVerificationFailureReason,
  PasswordRecoveryVerificationResult,
  PasswordResetResult,
  RegistrationCredentials,
  RegistrationResult,
  SignOutScope,
  VerificationDeliveryResult
} from '@no-code-collaboration-platform/application';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';
import { mapSupabaseIdentity } from './supabase-identity-mapper';

const RATE_LIMIT_CODES = new Set(['over_email_send_rate_limit', 'over_request_rate_limit']);

const PROVIDER_UNAVAILABLE_CODES = new Set(['request_timeout', 'unexpected_failure']);

const EXPIRED_RECOVERY_CODES = new Set(['flow_state_expired', 'otp_expired']);

const INVALID_RECOVERY_SESSION_CODES = new Set([
  'reauthentication_needed',
  'session_expired',
  'session_not_found'
]);

const SIGN_OUT_SCOPE = {
  'all-sessions': 'global',
  'current-session': 'local',
  'other-sessions': 'others'
} as const satisfies Record<SignOutScope, 'global' | 'local' | 'others'>;

interface PasswordRecoveryExchangeOptions {
  readonly fetch: typeof globalThis.fetch;
  readonly projectUrl: string;
  readonly publishableKey: string;
}

function isProviderUnavailable(error: { readonly code?: string; readonly status?: number }) {
  return (error.status ?? 0) >= 500 || PROVIDER_UNAVAILABLE_CODES.has(error.code ?? '');
}

function mapPasswordRecoveryVerificationFailure(error: {
  readonly code?: string;
  readonly status?: number;
}): PasswordRecoveryVerificationFailureReason {
  if (RATE_LIMIT_CODES.has(error.code ?? '') || error.status === 429) return 'rate-limited';
  if (EXPIRED_RECOVERY_CODES.has(error.code ?? '')) return 'expired-code';
  if (isProviderUnavailable(error)) return 'provider-unavailable';
  return 'invalid-code';
}

function hasAuthenticationMethod(claims: unknown, method: string) {
  if (!claims || typeof claims !== 'object') return false;

  const amr = (claims as { readonly amr?: unknown }).amr;
  if (!Array.isArray(amr)) return false;

  return amr.some(
    (entry) =>
      Boolean(entry) &&
      typeof entry === 'object' &&
      (entry as { readonly method?: unknown }).method === method
  );
}

function mapClaimsIdentity(claims: unknown) {
  if (!claims || typeof claims !== 'object') return null;

  const { email, sub } = claims as {
    readonly email?: unknown;
    readonly sub?: unknown;
  };

  if (typeof sub !== 'string') return null;

  return mapSupabaseIdentity({
    email: typeof email === 'string' ? email : null,
    id: sub
  });
}

export class SupabaseIdentityProvider implements IdentityProvider {
  public constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly passwordRecoveryExchange?: PasswordRecoveryExchangeOptions
  ) {}

  private async getClaimsIdentity(purpose: 'ordinary' | 'password-recovery') {
    const { data, error } = await this.client.auth.getClaims();

    if (error || !data?.claims) return null;

    const isRecovery = hasAuthenticationMethod(data.claims, 'recovery');
    if ((purpose === 'password-recovery') !== isRecovery) return null;

    return mapClaimsIdentity(data.claims);
  }

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

  public getCurrentIdentity() {
    return this.getClaimsIdentity('ordinary');
  }

  public getPasswordRecoveryIdentity() {
    return this.getClaimsIdentity('password-recovery');
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

  public async requestPasswordRecovery(email: string): Promise<PasswordRecoveryRequestResult> {
    const { error } = await this.client.auth.resetPasswordForEmail(email);

    if (!error) return { ok: true };

    if (isProviderUnavailable(error)) {
      return {
        ok: false,
        reason: 'provider-unavailable'
      };
    }

    // Account state, delivery throttling, and request throttling must not reveal account existence.
    return { ok: true };
  }

  public async resendEmailVerification(email: string): Promise<VerificationDeliveryResult> {
    const { error } = await this.client.auth.resend({
      email,
      type: 'signup'
    });

    if (!error) return { ok: true };

    if (RATE_LIMIT_CODES.has(error.code ?? '')) {
      return {
        ok: false,
        reason: 'rate-limited'
      };
    }

    if (isProviderUnavailable(error)) {
      return {
        ok: false,
        reason: 'provider-unavailable'
      };
    }

    // Account-state errors are deliberately indistinguishable from successful delivery.
    return { ok: true };
  }

  public async resetPassword(password: string): Promise<PasswordResetResult> {
    const recoveryIdentity = await this.getPasswordRecoveryIdentity();

    if (!recoveryIdentity) {
      return {
        ok: false,
        reason: 'invalid-recovery-session'
      };
    }

    const { error } = await this.client.auth.updateUser({ password });

    if (!error) return { ok: true };

    if (error.code === 'weak_password') {
      return {
        ok: false,
        reason: 'weak-password'
      };
    }

    if (error.code === 'same_password') {
      return {
        ok: false,
        reason: 'same-password'
      };
    }

    if (INVALID_RECOVERY_SESSION_CODES.has(error.code ?? '')) {
      return {
        ok: false,
        reason: 'invalid-recovery-session'
      };
    }

    return {
      ok: false,
      reason: 'provider-unavailable'
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

  public async verifyPasswordRecovery(
    tokenHash: string
  ): Promise<PasswordRecoveryVerificationResult> {
    if (!tokenHash.startsWith('pkce_') || !this.passwordRecoveryExchange) {
      return {
        ok: false,
        reason: 'invalid-code'
      };
    }

    const verifyUrl = new URL('/auth/v1/verify', this.passwordRecoveryExchange.projectUrl);
    verifyUrl.searchParams.set('token', tokenHash);
    verifyUrl.searchParams.set('type', 'recovery');

    let response: Response;
    try {
      response = await this.passwordRecoveryExchange.fetch(verifyUrl.toString(), {
        headers: {
          apikey: this.passwordRecoveryExchange.publishableKey
        },
        redirect: 'manual'
      });
    } catch {
      return {
        ok: false,
        reason: 'provider-unavailable'
      };
    }

    const location = response.headers.get('location');
    if (!location) {
      return {
        ok: false,
        reason: mapPasswordRecoveryVerificationFailure({ status: response.status })
      };
    }

    const redirectUrl = new URL(location, this.passwordRecoveryExchange.projectUrl);
    const redirectErrorCode = redirectUrl.searchParams.get('error_code');
    if (redirectUrl.searchParams.has('error') || redirectErrorCode) {
      return {
        ok: false,
        reason: mapPasswordRecoveryVerificationFailure({ code: redirectErrorCode ?? undefined })
      };
    }

    const authCode = redirectUrl.searchParams.get('code');
    if (!authCode) {
      return {
        ok: false,
        reason: 'invalid-code'
      };
    }

    const { error } = await this.client.auth.exchangeCodeForSession(authCode);
    if (error) {
      return {
        ok: false,
        reason: mapPasswordRecoveryVerificationFailure(error)
      };
    }

    const recoveryIdentity = await this.getPasswordRecoveryIdentity();
    if (!recoveryIdentity) {
      await this.client.auth.signOut({ scope: 'local' });
      return {
        ok: false,
        reason: 'invalid-code'
      };
    }

    return {
      identity: recoveryIdentity,
      ok: true
    };
  }
}
