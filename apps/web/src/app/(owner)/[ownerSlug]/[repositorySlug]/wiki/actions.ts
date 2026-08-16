'use server';

import { CreatePage, UpdatePage } from '@no-code-collaboration-platform/application';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { databaseUuidSchema } from '@/app/_validation/database-id';
import { createRequestServices } from '@/composition/create-request-services';
import {
  repositoryPath,
  repositoryWikiPagePath,
  repositoryWikiPath
} from '@/routing/repository-routes';

const slugSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);

const createSchema = z.object({
  ownerSlug: slugSchema,
  repositoryId: databaseUuidSchema,
  repositorySlug: slugSchema,
  title: z.string().trim().min(1).max(240)
});

const updateSchema = z.object({
  body: z.string(),
  expectedUpdatedAt: z.string().min(1),
  ownerSlug: slugSchema,
  pageId: databaseUuidSchema,
  repositoryId: databaseUuidSchema,
  repositorySlug: slugSchema,
  title: z.string().trim().min(1).max(240)
});

export async function createPage(formData: FormData) {
  const parsed = createSchema.safeParse({
    ownerSlug: String(formData.get('ownerSlug') ?? ''),
    repositoryId: String(formData.get('repositoryId') ?? ''),
    repositorySlug: String(formData.get('repositorySlug') ?? ''),
    title: String(formData.get('title') ?? '')
  });
  if (!parsed.success) redirect('/dashboard?error=invalid-page-input');

  const route = parsed.data;
  const destination = repositoryWikiPath(route);
  const services = await createRequestServices();
  const result = await new CreatePage(
    services.identityProvider,
    services.repositoryReader,
    services.repositoryAccessReader,
    services.pageWriter
  )
    .execute({ repositoryId: route.repositoryId, title: route.title })
    .catch(() => null);

  if (result === null) redirect(`${destination}?error=provider-unavailable`);
  if (!result.ok) {
    if (result.reason === 'unauthenticated') {
      redirect(`/sign-in?next=${encodeURIComponent(destination)}`);
    }
    if (result.reason === 'repository-unavailable') redirect('/dashboard');
    redirect(`${destination}?error=${result.reason}`);
  }

  revalidatePath(repositoryPath(route));
  revalidatePath(destination);
  redirect(repositoryWikiPagePath(route, result.page.id));
}

export async function updatePage(formData: FormData) {
  const parsed = updateSchema.safeParse({
    body: String(formData.get('body') ?? ''),
    expectedUpdatedAt: String(formData.get('expectedUpdatedAt') ?? ''),
    ownerSlug: String(formData.get('ownerSlug') ?? ''),
    pageId: String(formData.get('pageId') ?? ''),
    repositoryId: String(formData.get('repositoryId') ?? ''),
    repositorySlug: String(formData.get('repositorySlug') ?? ''),
    title: String(formData.get('title') ?? '')
  });
  if (!parsed.success) redirect('/dashboard?error=invalid-page-input');

  const route = parsed.data;
  const destination = repositoryWikiPagePath(route, route.pageId);
  const services = await createRequestServices();
  const result = await new UpdatePage(
    services.identityProvider,
    services.repositoryReader,
    services.repositoryAccessReader,
    services.pageWriter
  )
    .execute({
      body: route.body,
      expectedUpdatedAt: route.expectedUpdatedAt,
      pageId: route.pageId,
      repositoryId: route.repositoryId,
      title: route.title
    })
    .catch(() => null);

  if (result === null) redirect(`${destination}?error=provider-unavailable`);
  if (!result.ok) {
    if (result.reason === 'unauthenticated') {
      redirect(`/sign-in?next=${encodeURIComponent(destination)}`);
    }
    if (result.reason === 'repository-unavailable') redirect('/dashboard');
    redirect(`${destination}?error=${result.reason}`);
  }

  revalidatePath(repositoryPath(route));
  revalidatePath(repositoryWikiPath(route));
  revalidatePath(destination);
  redirect(`${destination}?saved=1`);
}
