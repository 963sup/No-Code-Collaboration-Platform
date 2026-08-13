import type { IdentityProvider, PasswordRecoveryRequestResult } from '../ports/identity-provider';

export class RequestPasswordRecovery {
  public constructor(private readonly identityProvider: IdentityProvider) {}

  public execute(email: string): Promise<PasswordRecoveryRequestResult> {
    return this.identityProvider.requestPasswordRecovery(email);
  }
}
