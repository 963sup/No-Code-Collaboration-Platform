import type { IdentityProvider, SignOutScope } from '../ports/identity-provider';

export class SignOut {
  public constructor(private readonly identityProvider: IdentityProvider) {}

  public execute(scope: SignOutScope): Promise<void> {
    return this.identityProvider.signOut(scope);
  }
}
