'use server';

import { CreatePage, UpdatePage } from '@no-code-collaboration-platform/application';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createRequestServices } from '@/composition/create-request-services';

const createPageSchema = z.object({
  repositoryId: z.string().uuid(),
  title: z.string().trim().min(1).max(240)
});

const updatePageSchema = z.object({
  body: z.string(),
  expectedUpdatedAt: z.string().min(1),
  pageId: z.string().uuid(),
  repositoryId: z.string().uuid(),
  title: z.string().trim().min(1).max(240)
});

function repositoryPath(repositoryId: string) {
  return `/app/repositories/${repositoryId}`;
}

function resourcesPath(repositoryId: string) {
  return `${repositoryPath(repositoryId)}/resources`;
}

function pagePath(repositoryId: string, pageId: string) {
  return `${resourcesPath(repositoryId)}/${pageId}`;
}

export async function createPage(formData: FormData) {
  const parsed = createPageSchema.safeParse({
    repositoryId: String(formData.get('repositoryId') ?? ''),
    title: String(formData.get('title') ?? '')
  });
  if (!parsed.success) redirect('/app?error=invalid-page-input');

  const services = await createRequestServices();
  const result = await new CreatePage(
    services.identityProvider,
    services.repositoryReader,
    services.repositoryAuthoritySourceReader,
    services.pageWriter
  )
    .execute(parsed.data)
    .catch(() => null);
  const destination = resourcesPath(parsed.data.repositoryId);

  if (result === null) redirect(`${destination}?error=provider-unavailable`);
  if (!result.ok) {
    if (result.reason === 'unauthenticated') {
      redirect(`/sign-in?next=${encodeURIComponent(destination)}`);
    }
    if (result.reason === 'repository-unavailable') redirect('/app');
    redirect(`${destination}?error=${result.reason}`);
  }

  revalidatePath(repositoryPath(parsed.data.repositoryId));
  revalidatePath(destination);
  redirect(pagePath(parsed.data.repositoryId, result.page.id));
}

export async function updatePage(formData: FormData) {
  const parsed = updatePageSchema.safeParse({
    body: String(formData.get('body') ?? ''),
    expectedUpdatedAt: String(formData.get('expectedUpdatedAt') ?? ''),
    pageId: String(formData.get('pageId') ?? ''),
    repositoryId: String(formData.get('repositoryId') ?? ''),
    title: String(formData.get('title') ?? '')
  });
  if (!parsed.success) redirect('/app?error=invalid-page-input');

  const services = await createRequestServices();
  const result = await new UpdatePage(
    services.identityProvider,
    services.repositoryReader,
    services.repositoryAuthoritySourceReader,
    services.pageWriter
  )
    .execute(parsed.data)
    .catch(() => null);
  const destination = pagePath(parsed.data.repositoryId, parsed.data.pageId);

  if (result === null) redirect(`${destination}?error=provider-unavailable`);
  if (!result.ok) {
    if (result.reason === 'unauthenticated') {
      redirect(`/sign-in?next=${encodeURIComponent(destination)}`);
    }
    if (result.reason === 'repository-unavailable') redirect('/app');
    redirect(`${destination}?error=${result.reason}`);
  }

  revalidatePath(repositoryPath(parsed.data.repositoryId));
  revalidatePath(resourcesPath(parsed.data.repositoryId));
  revalidatePath(destination);
  redirect(`${destination}?saved=1`);
}
