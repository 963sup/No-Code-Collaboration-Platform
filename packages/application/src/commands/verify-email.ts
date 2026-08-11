import type {
  EmailVerificationProof,
  EmailVerificationResult,
  IdentityProvider
} from '../ports/identity-provider';

export class VerifyEmail {
  public constructor(private readonly identityProvider: IdentityProvider) {}

  public execute(proof: EmailVerificationProof): Promise<EmailVerificationResult> {
    return this.identityProvider.verifyEmail(proof);
  }
}
