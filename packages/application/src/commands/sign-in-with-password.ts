import type {
  AuthenticationResult,
  IdentityProvider,
  PasswordCredentials
} from '../ports/identity-provider';

export class SignInWithPassword {
  public constructor(private readonly identityProvider: IdentityProvider) {}

  public execute(credentials: PasswordCredentials): Promise<AuthenticationResult> {
    return this.identityProvider.authenticateWithPassword(credentials);
  }
}
