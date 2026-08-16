'use server';

import { ExecuteNotificationCommand } from '@no-code-collaboration-platform/application';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { databaseUuidSchema } from '@/app/_validation/database-id';
import { createRequestServices } from '@/composition/create-request-services';

const notificationCommandSchema = z.object({
  intent: z.enum(['archive', 'mark-read', 'mark-unread']),
  notificationId: databaseUuidSchema
});

async function executeNotification(command: Parameters<ExecuteNotificationCommand['execute']>[0]) {
  const services = await createRequestServices();
  return new ExecuteNotificationCommand(services.identityProvider, services.notificationWriter)
    .execute(command)
    .catch(() => null);
}

export async function updateNotificationAction(formData: FormData) {
  const parsed = notificationCommandSchema.safeParse({
    intent: formData.get('intent'),
    notificationId: formData.get('notificationId')
  });
  if (!parsed.success) redirect('/notifications?command=invalid-command');
  const result = await executeNotification({
    notificationId: parsed.data.notificationId,
    type: parsed.data.intent
  });
  if (result === null) redirect('/notifications?command=provider-unavailable');
  if (!result.ok) redirect(`/notifications?command=${encodeURIComponent(result.reason)}`);
  revalidatePath('/notifications');
  redirect('/notifications?command=saved');
}

export async function markAllNotificationsReadAction() {
  const result = await executeNotification({ type: 'mark-all-read' });
  if (result === null) redirect('/notifications?command=provider-unavailable');
  if (!result.ok) redirect(`/notifications?command=${encodeURIComponent(result.reason)}`);
  revalidatePath('/notifications');
  redirect('/notifications?status=read&command=saved');
}
