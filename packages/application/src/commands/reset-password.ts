import type { IdentityProvider, PasswordResetResult } from '../ports/identity-provider';

export class ResetPassword {
  public constructor(private readonly identityProvider: IdentityProvider) {}

  public execute(password: string): Promise<PasswordResetResult> {
    return this.identityProvider.resetPassword(password);
  }
}
