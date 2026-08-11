import { describe, expect, it } from 'vitest';

import {
  GetCurrentIdentity,
  SignInWithPassword,
  SignOut,
  type ActorIdentity,
  type AuthenticationResult,
  type IdentityProvider,
  type PasswordCredentials
} from '../src/index';

class FakeIdentityProvider implements IdentityProvider {
  public currentIdentity: ActorIdentity | null = null;
  public credentials: PasswordCredentials | null = null;
  public signOutCalls = 0;

  public async authenticateWithPassword(
    credentials: PasswordCredentials
  ): Promise<AuthenticationResult> {
    this.credentials = credentials;
    return {
      identity: {
        email: credentials.email,
        id: 'actor-1'
      },
      ok: true
    };
  }

  public async getCurrentIdentity(): Promise<ActorIdentity | null> {
    return this.currentIdentity;
  }

  public async signOut(): Promise<void> {
    this.signOutCalls += 1;
  }
}

describe('identity use cases', () => {
  it('delegates password authentication through the neutral identity port', async () => {
    const identityProvider = new FakeIdentityProvider();
    const credentials = {
      email: 'actor@example.com',
      password: 'correct-horse-battery-staple'
    };

    const result = await new SignInWithPassword(identityProvider).execute(credentials);

    expect(result).toEqual({
      identity: {
        email: 'actor@example.com',
        id: 'actor-1'
      },
      ok: true
    });
    expect(identityProvider.credentials).toEqual(credentials);
  });

  it('reads and clears the current identity through the same port', async () => {
    const identityProvider = new FakeIdentityProvider();
    identityProvider.currentIdentity = {
      email: 'actor@example.com',
      id: 'actor-1'
    };

    await expect(new GetCurrentIdentity(identityProvider).execute()).resolves.toEqual(
      identityProvider.currentIdentity
    );

    await new SignOut(identityProvider).execute();
    expect(identityProvider.signOutCalls).toBe(1);
  });
});
