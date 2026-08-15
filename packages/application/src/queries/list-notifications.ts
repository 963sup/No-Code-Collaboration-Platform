import { notificationStates, type NotificationReader } from '../ports/collaboration-projections';

export class ListNotifications {
  public constructor(private readonly reader: NotificationReader) {}

  public execute(input: { readonly page?: number; readonly state?: string }) {
    return this.reader.listAccessibleNotifications({
      page:
        Number.isSafeInteger(input.page) && input.page && input.page > 0
          ? Math.min(input.page, 10_000)
          : 1,
      state:
        input.state === 'all' || notificationStates.includes(input.state as never)
          ? (input.state as 'all' | (typeof notificationStates)[number])
          : 'unread'
    });
  }
}
