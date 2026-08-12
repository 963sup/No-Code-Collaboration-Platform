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

const routeSlugSchema = z.string().min(2).max(64).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);

const createPageSchema = z.object({
  organizationSlug: routeSlugSchema,
  repositoryId: z.string().uuid(),
  repositorySlug: routeSlugSchema,
  title: z.string().trim().min(1).max(240)
});

const updatePageSchema = z.object({
  body: z.string(),
  expectedUpdatedAt: z.string().min(1),
  organizationSlug: routeSlugSchema,
  pageId: z.string().uuid(),
  repositoryId: z.string().uuid(),
  repositorySlug: routeSlugSchema,
  title: z.string().trim().min(1).max(240)
});

export async function createPage(formData: FormData) {
  const parsed = createPageSchema.safeParse({
    organizationSlug: String(formData.get('organizationSlug') ?? ''),
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
    services.repositoryAuthoritySourceReader,
    services.pageWriter
  )
    .execute(parsed.data)
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
  const parsed = updatePageSchema.safeParse({
    body: String(formData.get('body') ?? ''),
    expectedUpdatedAt: String(formData.get('expectedUpdatedAt') ?? ''),
    organizationSlug: String(formData.get('organizationSlug') ?? ''),
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
    services.repositoryAuthoritySourceReader,
    services.pageWriter
  )
    .execute(parsed.data)
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
