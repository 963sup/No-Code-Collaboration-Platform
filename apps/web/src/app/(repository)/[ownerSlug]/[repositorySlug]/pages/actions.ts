'use server';

import { CreatePage, UpdatePage } from '@no-code-collaboration-platform/application';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createRequestServices } from '@/composition/create-request-services';
import {
  repositoryPagePath,
  repositoryPagesPath,
  repositoryPath
} from '@/routing/repository-routes';

const slugSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);

const createSchema = z.object({
  ownerSlug: slugSchema,
  repositoryId: z.string().uuid(),
  repositorySlug: slugSchema,
  title: z.string().trim().min(1).max(240)
});

const updateSchema = z.object({
  body: z.string(),
  expectedUpdatedAt: z.string().min(1),
  ownerSlug: slugSchema,
  pageId: z.string().uuid(),
  repositoryId: z.string().uuid(),
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
  if (!parsed.success) redirect('/app?error=invalid-page-input');

  const route = parsed.data;
  const destination = repositoryPagesPath(route);
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
    if (result.reason === 'repository-unavailable') redirect('/app');
    redirect(`${destination}?error=${result.reason}`);
  }

  revalidatePath(repositoryPath(route));
  revalidatePath(destination);
  redirect(repositoryPagePath(route, result.page.id));
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
  if (!parsed.success) redirect('/app?error=invalid-page-input');

  const route = parsed.data;
  const destination = repositoryPagePath(route, route.pageId);
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
    if (result.reason === 'repository-unavailable') redirect('/app');
    redirect(`${destination}?error=${result.reason}`);
  }

  revalidatePath(repositoryPath(route));
  revalidatePath(repositoryPagesPath(route));
  revalidatePath(destination);
  redirect(`${destination}?saved=1`);
}
