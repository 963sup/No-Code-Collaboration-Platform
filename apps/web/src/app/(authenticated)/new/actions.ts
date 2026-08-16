'use server';

import {
  CreateRepository,
  RepositoryCreationAccessPolicy
} from '@no-code-collaboration-platform/application';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { databaseUuidSchema } from '@/app/_validation/database-id';
import { createRequestServices } from '@/composition/create-request-services';
import { repositoryPath } from '@/routing/repository-routes';

const repositorySchema = z.object({
  description: z.string(),
  name: z.string().trim().min(1).max(160),
  ownerId: databaseUuidSchema,
  ownerKind: z.enum(['organization', 'user']),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
  visibility: z.enum(['private', 'public'])
});

export async function createRepository(formData: FormData) {
  const owner = String(formData.get('owner') ?? '');
  const separator = owner.indexOf(':');
  const parsed = repositorySchema.safeParse({
    description: String(formData.get('description') ?? ''),
    name: String(formData.get('name') ?? ''),
    ownerId: separator === -1 ? '' : owner.slice(separator + 1),
    ownerKind: separator === -1 ? '' : owner.slice(0, separator),
    slug: String(formData.get('slug') ?? ''),
    visibility: String(formData.get('visibility') ?? '')
  });
  if (!parsed.success) redirect('/new?error=invalid-input');

  const selectedOwner =
    parsed.data.ownerKind === 'user'
      ? { kind: 'user' as const, userId: parsed.data.ownerId }
      : { kind: 'organization' as const, organizationId: parsed.data.ownerId };
  const services = await createRequestServices();
  const accessPolicy = new RepositoryCreationAccessPolicy(services.repositoryCreationAccessReader);
  const result = await new CreateRepository(
    services.identityProvider,
    accessPolicy,
    services.repositoryWriter
  )
    .execute({
      description: parsed.data.description,
      name: parsed.data.name,
      owner: selectedOwner,
      slug: parsed.data.slug,
      visibility: parsed.data.visibility
    })
    .catch(() => null);

  if (result === null) redirect('/new?error=provider-unavailable');
  if (!result.ok) {
    if (result.reason === 'unauthenticated') redirect('/sign-in?next=%2Fnew');
    redirect(`/new?error=${result.reason}`);
  }

  revalidatePath('/dashboard');
  redirect(repositoryPath({ ownerSlug: result.ownerSlug, repository: result.repository }));
}
