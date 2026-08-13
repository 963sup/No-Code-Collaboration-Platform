import type { IdentityProvider } from '../ports/identity-provider';

export class GetPasswordRecoveryIdentity {
  public constructor(private readonly identityProvider: IdentityProvider) {}

  public execute() {
    return this.identityProvider.getPasswordRecoveryIdentity();
  }
}
