export interface ActorIdentity {
  readonly email: string | null;
  readonly id: string;
}

export interface PasswordCredentials {
  readonly email: string;
  readonly password: string;
}

export type RegistrationCredentials = PasswordCredentials;

export type AuthenticationFailureReason =
  | 'email-verification-required'
  | 'invalid-credentials'
  | 'provider-unavailable';

export type AuthenticationResult =
  | {
      readonly identity: ActorIdentity;
      readonly ok: true;
    }
  | {
      readonly ok: false;
      readonly reason: AuthenticationFailureReason;
    };

export type RegistrationFailureReason =
  | 'provider-unavailable'
  | 'rate-limited'
  | 'registration-disabled'
  | 'weak-password';

export type RegistrationResult =
  | {
      readonly identity: ActorIdentity;
      readonly ok: true;
      readonly status: 'authenticated';
    }
  | {
      readonly ok: true;
      readonly status: 'email-verification-required';
    }
  | {
      readonly ok: false;
      readonly reason: RegistrationFailureReason;
    };

export type EmailVerificationProof =
  | {
      readonly code: string;
      readonly email: string;
      readonly kind: 'code';
    }
  | {
      readonly kind: 'token-hash';
      readonly tokenHash: string;
    };

export type EmailVerificationFailureReason =
  | 'expired-code'
  | 'invalid-code'
  | 'provider-unavailable'
  | 'rate-limited';

export type EmailVerificationResult =
  | {
      readonly identity: ActorIdentity;
      readonly ok: true;
    }
  | {
      readonly ok: false;
      readonly reason: EmailVerificationFailureReason;
    };

export type VerificationDeliveryFailureReason = 'provider-unavailable' | 'rate-limited';

export type VerificationDeliveryResult =
  | {
      readonly ok: true;
    }
  | {
      readonly ok: false;
      readonly reason: VerificationDeliveryFailureReason;
    };

export type SignOutScope = 'all-sessions' | 'current-session' | 'other-sessions';

export interface IdentityProvider {
  authenticateWithPassword(credentials: PasswordCredentials): Promise<AuthenticationResult>;
  getCurrentIdentity(): Promise<ActorIdentity | null>;
  registerWithPassword(credentials: RegistrationCredentials): Promise<RegistrationResult>;
  resendEmailVerification(email: string): Promise<VerificationDeliveryResult>;
  signOut(scope: SignOutScope): Promise<void>;
  verifyEmail(proof: EmailVerificationProof): Promise<EmailVerificationResult>;
}
