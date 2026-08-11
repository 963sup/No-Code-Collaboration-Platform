import type {
  IdentityProvider,
  VerificationDeliveryResult
} from '../ports/identity-provider';

export class ResendEmailVerification {
  public constructor(private readonly identityProvider: IdentityProvider) {}

  public execute(email: string): Promise<VerificationDeliveryResult> {
    return this.identityProvider.resendEmailVerification(email);
  }
}
