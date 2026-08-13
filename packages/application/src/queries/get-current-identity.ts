import type { ActorIdentity, IdentityProvider } from '../ports/identity-provider';

export class GetCurrentIdentity {
  public constructor(private readonly identityProvider: IdentityProvider) {}

  public execute(): Promise<ActorIdentity | null> {
    return this.identityProvider.getCurrentIdentity();
  }
}
