'use server';

import { ExecuteNotificationCommand } from '@no-code-collaboration-platform/application';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createRequestServices } from '@/composition/create-request-services';
import { repositoryPath } from '@/routing/repository-routes';

import { requireAccessibleRepositoryRoute } from './_queries/get-accessible-repository-route';

const preferenceSchema = z.object({ intent: z.enum(['mute', 'watch']) });

export async function updateRepositoryNotificationPreferenceAction(
  ownerSlug: string,
  repositorySlug: string,
  formData: FormData
) {
  const route = await requireAccessibleRepositoryRoute(ownerSlug, repositorySlug);
  const destination = repositoryPath(route);
  const parsed = preferenceSchema.safeParse({ intent: formData.get('intent') });
  if (!parsed.success) redirect(`${destination}?notification=invalid-command`);

  const services = await createRequestServices();
  const result = await new ExecuteNotificationCommand(
    services.identityProvider,
    services.notificationWriter
  )
    .execute({
      repositoryId: route.repository.id,
      subjectId: route.repository.id,
      subjectType: 'repository',
      type: parsed.data.intent
    })
    .catch(() => null);
  if (result === null) redirect(`${destination}?notification=provider-unavailable`);
  if (!result.ok) redirect(`${destination}?notification=${encodeURIComponent(result.reason)}`);

  revalidatePath(destination);
  revalidatePath('/notifications');
  redirect(`${destination}?notification=${parsed.data.intent}`);
}
