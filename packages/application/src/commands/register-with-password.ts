import type {
  IdentityProvider,
  RegistrationCredentials,
  RegistrationResult
} from '../ports/identity-provider';

export class RegisterWithPassword {
  public constructor(private readonly identityProvider: IdentityProvider) {}

  public execute(credentials: RegistrationCredentials): Promise<RegistrationResult> {
    return this.identityProvider.registerWithPassword(credentials);
  }
}
