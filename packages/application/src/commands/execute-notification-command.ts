import type { NotificationCommand, NotificationWriter } from '../ports/collaboration-projections';
import type { IdentityProvider } from '../ports/identity-provider';

export class ExecuteNotificationCommand {
  public constructor(
    private readonly identityProvider: IdentityProvider,
    private readonly writer: NotificationWriter
  ) {}

  public async execute(command: NotificationCommand) {
    if ((await this.identityProvider.getCurrentIdentity()) === null) {
      return { ok: false as const, reason: 'unauthenticated' as const };
    }
    const updated = await this.writer.executeNotificationCommand(command);
    return updated
      ? { ok: true as const }
      : { ok: false as const, reason: 'notification-unavailable' as const };
  }
}
