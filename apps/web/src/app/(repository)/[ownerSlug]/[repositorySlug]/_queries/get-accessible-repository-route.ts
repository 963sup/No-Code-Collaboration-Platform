import { GetAccessibleRepositoryRoute } from '@no-code-collaboration-platform/application';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { z } from 'zod';

import { createRequestServices } from '@/composition/create-request-services';

const routeSlugSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);

export const getAccessibleRepositoryRoute = cache(
  async (ownerSlug: string, repositorySlug: string) => {
    const parsed = z
      .object({ ownerSlug: routeSlugSchema, repositorySlug: routeSlugSchema })
      .safeParse({ ownerSlug, repositorySlug });
    if (!parsed.success) return null;

    const { repositoryRouteReader } = await createRequestServices();
    return new GetAccessibleRepositoryRoute(repositoryRouteReader).execute(parsed.data);
  }
);

export async function requireAccessibleRepositoryRoute(ownerSlug: string, repositorySlug: string) {
  const route = await getAccessibleRepositoryRoute(ownerSlug, repositorySlug);
  if (!route) notFound();
  return route;
}
