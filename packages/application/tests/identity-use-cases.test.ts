import { describe, expect, it } from 'vitest';

import {
  GetCurrentIdentity,
  GetPasswordRecoveryIdentity,
  RegisterWithPassword,
  RequestPasswordRecovery,
  ResendEmailVerification,
  ResetPassword,
  SignInWithPassword,
  SignOut,
  VerifyEmail,
  VerifyPasswordRecovery,
  type ActorIdentity,
  type AuthenticationResult,
  type EmailVerificationProof,
  type EmailVerificationResult,
  type IdentityProvider,
  type PasswordCredentials,
  type PasswordRecoveryRequestResult,
  type PasswordRecoveryVerificationResult,
  type PasswordResetResult,
  type RegistrationCredentials,
  type RegistrationResult,
  type SignOutScope,
  type VerificationDeliveryResult
} from '../src/index';

class FakeIdentityProvider implements IdentityProvider {
  public currentIdentity: ActorIdentity | null = null;
  public credentials: PasswordCredentials | null = null;
  public passwordRecoveryEmail: string | null = null;
  public passwordRecoveryIdentity: ActorIdentity | null = null;
  public passwordRecoveryTokenHash: string | null = null;
  public registrationCredentials: RegistrationCredentials | null = null;
  public resendEmail: string | null = null;
  public resetPasswordValue: string | null = null;
  public signOutScope: SignOutScope | null = null;
  public verificationProof: EmailVerificationProof | null = null;

  public async authenticateWithPassword(
    credentials: PasswordCredentials
  ): Promise<AuthenticationResult> {
    this.credentials = credentials;
    return {
      identity: {
        email: credentials.email,
        id: 'actor-1'
      },
      ok: true
    };
  }

  public async getCurrentIdentity(): Promise<ActorIdentity | null> {
    return this.currentIdentity;
  }

  public async getPasswordRecoveryIdentity(): Promise<ActorIdentity | null> {
    return this.passwordRecoveryIdentity;
  }

  public async registerWithPassword(
    credentials: RegistrationCredentials
  ): Promise<RegistrationResult> {
    this.registrationCredentials = credentials;
    return {
      ok: true,
      status: 'email-verification-required'
    };
  }

  public async requestPasswordRecovery(email: string): Promise<PasswordRecoveryRequestResult> {
    this.passwordRecoveryEmail = email;
    return { ok: true };
  }

  public async resendEmailVerification(email: string): Promise<VerificationDeliveryResult> {
    this.resendEmail = email;
    return { ok: true };
  }

  public async resetPassword(password: string): Promise<PasswordResetResult> {
    this.resetPasswordValue = password;
    return { ok: true };
  }

  public async signOut(scope: SignOutScope): Promise<void> {
    this.signOutScope = scope;
  }

  public async verifyEmail(proof: EmailVerificationProof): Promise<EmailVerificationResult> {
    this.verificationProof = proof;
    return {
      identity: {
        email: proof.kind === 'code' ? proof.email : 'actor@example.com',
        id: 'actor-1'
      },
      ok: true
    };
  }

  public async verifyPasswordRecovery(
    tokenHash: string
  ): Promise<PasswordRecoveryVerificationResult> {
    this.passwordRecoveryTokenHash = tokenHash;
    return {
      identity: {
        email: 'actor@example.com',
        id: 'actor-1'
      },
      ok: true
    };
  }
}

describe('identity use cases', () => {
  it('delegates password authentication through the neutral identity port', async () => {
    const identityProvider = new FakeIdentityProvider();
    const credentials = {
      email: 'actor@example.com',
      password: 'correct-horse-battery-staple'
    };

    const result = await new SignInWithPassword(identityProvider).execute(credentials);

    expect(result).toEqual({
      identity: {
        email: 'actor@example.com',
        id: 'actor-1'
      },
      ok: true
    });
    expect(identityProvider.credentials).toEqual(credentials);
  });

  it('keeps registration separate from authenticated product access', async () => {
    const identityProvider = new FakeIdentityProvider();
    const credentials = {
      email: 'new-actor@example.com',
      password: 'correct-horse-battery-staple'
    };

    await expect(new RegisterWithPassword(identityProvider).execute(credentials)).resolves.toEqual({
      ok: true,
      status: 'email-verification-required'
    });
    expect(identityProvider.registrationCredentials).toEqual(credentials);
  });

  it('delegates both code and token-hash email proofs without exposing a provider API', async () => {
    const identityProvider = new FakeIdentityProvider();
    const codeProof = {
      code: '123456',
      email: 'actor@example.com',
      kind: 'code'
    } as const;
    const tokenHashProof = {
      kind: 'token-hash',
      tokenHash: 'opaque-token-hash'
    } as const;

    await new VerifyEmail(identityProvider).execute(codeProof);
    expect(identityProvider.verificationProof).toEqual(codeProof);

    await new VerifyEmail(identityProvider).execute(tokenHashProof);
    expect(identityProvider.verificationProof).toEqual(tokenHashProof);
  });

  it('resends verification through the same provider-neutral boundary', async () => {
    const identityProvider = new FakeIdentityProvider();

    await expect(
      new ResendEmailVerification(identityProvider).execute('actor@example.com')
    ).resolves.toEqual({ ok: true });
    expect(identityProvider.resendEmail).toBe('actor@example.com');
  });

  it('keeps password recovery proof distinct from an ordinary product identity', async () => {
    const identityProvider = new FakeIdentityProvider();
    identityProvider.passwordRecoveryIdentity = {
      email: 'actor@example.com',
      id: 'actor-1'
    };

    await expect(
      new RequestPasswordRecovery(identityProvider).execute('actor@example.com')
    ).resolves.toEqual({ ok: true });
    expect(identityProvider.passwordRecoveryEmail).toBe('actor@example.com');

    await expect(
      new VerifyPasswordRecovery(identityProvider).execute('opaque-recovery-token-hash')
    ).resolves.toEqual({
      identity: {
        email: 'actor@example.com',
        id: 'actor-1'
      },
      ok: true
    });
    expect(identityProvider.passwordRecoveryTokenHash).toBe('opaque-recovery-token-hash');

    await expect(new GetPasswordRecoveryIdentity(identityProvider).execute()).resolves.toEqual(
      identityProvider.passwordRecoveryIdentity
    );
  });

  it('resets the credential through the recovery-specific provider boundary', async () => {
    const identityProvider = new FakeIdentityProvider();

    await expect(
      new ResetPassword(identityProvider).execute('new-secure-password')
    ).resolves.toEqual({
      ok: true
    });
    expect(identityProvider.resetPasswordValue).toBe('new-secure-password');
  });

  it('reads and clears the current identity through the same port with explicit session scope', async () => {
    const identityProvider = new FakeIdentityProvider();
    identityProvider.currentIdentity = {
      email: 'actor@example.com',
      id: 'actor-1'
    };

    await expect(new GetCurrentIdentity(identityProvider).execute()).resolves.toEqual(
      identityProvider.currentIdentity
    );

    await new SignOut(identityProvider).execute('current-session');
    expect(identityProvider.signOutScope).toBe('current-session');
  });
});
