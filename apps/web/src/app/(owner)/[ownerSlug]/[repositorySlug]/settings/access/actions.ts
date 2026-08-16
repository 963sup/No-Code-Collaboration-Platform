'use server';

import {
  ExecuteRepositoryGrantCommand,
  type RepositoryGrantCommand
} from '@no-code-collaboration-platform/application';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { databaseUuidSchema } from '@/app/_validation/database-id';
import { createRequestServices } from '@/composition/create-request-services';
import { repositoryPath, repositorySettingsAccessPath } from '@/routing/repository-routes';

const routeSchema = z.object({
  ownerSlug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
  repositoryId: databaseUuidSchema,
  repositorySlug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
});

const roleSchema = z.enum(['read', 'triage', 'write', 'maintain', 'admin']);

function destination(route: z.infer<typeof routeSchema>) {
  return repositorySettingsAccessPath(route);
}

async function executeGrantCommand(
  route: z.infer<typeof routeSchema>,
  command: RepositoryGrantCommand
) {
  const services = await createRequestServices();
  const result = await new ExecuteRepositoryGrantCommand(
    services.identityProvider,
    services.repositoryReader,
    services.repositoryAccessReader,
    services.repositoryGrantRepository
  )
    .execute(command)
    .catch(() => null);

  const target = destination(route);
  if (result === null) redirect(`${target}?error=provider-unavailable`);
  if (!result.ok) {
    if (result.reason === 'unauthenticated') {
      redirect(`/sign-in?next=${encodeURIComponent(target)}`);
    }
    redirect(`${target}?error=${result.reason}`);
  }

  revalidatePath(repositoryPath(route));
  revalidatePath(target);
  revalidatePath('/dashboard');
  redirect(`${target}?saved=${result.changed ? '1' : 'unchanged'}`);
}

export async function grantRepositoryAccess(formData: FormData) {
  const route = routeSchema.safeParse({
    ownerSlug: String(formData.get('ownerSlug') ?? ''),
    repositoryId: String(formData.get('repositoryId') ?? ''),
    repositorySlug: String(formData.get('repositorySlug') ?? '')
  });
  const role = roleSchema.safeParse(String(formData.get('role') ?? ''));
  const username = z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
    .safeParse(String(formData.get('username') ?? ''));
  if (!route.success || !role.success || !username.success) {
    redirect('/dashboard?error=invalid-grant-input');
  }

  return executeGrantCommand(route.data, {
    repositoryId: route.data.repositoryId,
    role: role.data,
    type: 'grant',
    username: username.data
  });
}

export async function changeRepositoryGrantRole(formData: FormData) {
  const route = routeSchema.safeParse({
    ownerSlug: String(formData.get('ownerSlug') ?? ''),
    repositoryId: String(formData.get('repositoryId') ?? ''),
    repositorySlug: String(formData.get('repositorySlug') ?? '')
  });
  const role = roleSchema.safeParse(String(formData.get('role') ?? ''));
  const targetUserId = databaseUuidSchema.safeParse(String(formData.get('targetUserId') ?? ''));
  if (!route.success || !role.success || !targetUserId.success) {
    redirect('/dashboard?error=invalid-grant-input');
  }

  return executeGrantCommand(route.data, {
    repositoryId: route.data.repositoryId,
    role: role.data,
    targetUserId: targetUserId.data,
    type: 'change-role'
  });
}

export async function revokeRepositoryGrant(formData: FormData) {
  const route = routeSchema.safeParse({
    ownerSlug: String(formData.get('ownerSlug') ?? ''),
    repositoryId: String(formData.get('repositoryId') ?? ''),
    repositorySlug: String(formData.get('repositorySlug') ?? '')
  });
  const targetUserId = databaseUuidSchema.safeParse(String(formData.get('targetUserId') ?? ''));
  if (!route.success || !targetUserId.success) {
    redirect('/dashboard?error=invalid-grant-input');
  }

  return executeGrantCommand(route.data, {
    repositoryId: route.data.repositoryId,
    targetUserId: targetUserId.data,
    type: 'revoke'
  });
}
