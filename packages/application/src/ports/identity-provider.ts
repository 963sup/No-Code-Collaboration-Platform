export interface ActorIdentity {
  readonly email: string | null;
  readonly id: string;
}

export interface PasswordCredentials {
  readonly email: string;
  readonly password: string;
}

export type AuthenticationFailureReason = 'invalid-credentials' | 'provider-unavailable';

export type AuthenticationResult =
  | {
      readonly identity: ActorIdentity;
      readonly ok: true;
    }
  | {
      readonly ok: false;
      readonly reason: AuthenticationFailureReason;
    };

export interface IdentityProvider {
  authenticateWithPassword(credentials: PasswordCredentials): Promise<AuthenticationResult>;
  getCurrentIdentity(): Promise<ActorIdentity | null>;
  signOut(): Promise<void>;
}
