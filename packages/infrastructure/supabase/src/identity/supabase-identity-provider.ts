import type {
  AuthenticationResult,
  IdentityProvider,
  PasswordCredentials
} from '@no-code-collaboration-platform/application';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';
import { mapSupabaseIdentity } from '../mappers/supabase-identity-mapper';

const INVALID_CREDENTIAL_CODES = new Set([
  'email_not_confirmed',
  'invalid_credentials',
  'user_not_found'
]);

export class SupabaseIdentityProvider implements IdentityProvider {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async authenticateWithPassword(
    credentials: PasswordCredentials
  ): Promise<AuthenticationResult> {
    const { data, error } = await this.client.auth.signInWithPassword(credentials);

    if (error) {
      return {
        ok: false,
        reason: INVALID_CREDENTIAL_CODES.has(error.code ?? '')
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

  public async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();

    if (error) throw new Error('Unable to sign out from the identity provider.', { cause: error });
  }
}
