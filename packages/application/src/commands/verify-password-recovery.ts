import type {
  IdentityProvider,
  PasswordRecoveryVerificationResult
} from '../ports/identity-provider';

export class VerifyPasswordRecovery {
  public constructor(private readonly identityProvider: IdentityProvider) {}

  public execute(tokenHash: string): Promise<PasswordRecoveryVerificationResult> {
    return this.identityProvider.verifyPasswordRecovery(tokenHash);
  }
}
