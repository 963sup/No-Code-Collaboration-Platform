import type { IdentityProvider } from '../ports/identity-provider';

export class SignOut {
  public constructor(private readonly identityProvider: IdentityProvider) {}

  public execute(): Promise<void> {
    return this.identityProvider.signOut();
  }
}
