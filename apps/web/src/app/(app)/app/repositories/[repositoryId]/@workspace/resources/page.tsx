import { GetAccessibleRepositoryRouteById } from '@no-code-collaboration-platform/application';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';

import { createRequestServices } from '@/composition/create-request-services';
import { repositoryPagesPath } from '@/routing/repository-routes';

interface LegacyRepositoryPagesProps {
  readonly params: Promise<{ repositoryId: string }>;
}

export default async function LegacyRepositoryPages({ params }: LegacyRepositoryPagesProps) {
  const { repositoryId } = await params;
  const parsedRepositoryId = z.uuid().safeParse(repositoryId);
  if (!parsedRepositoryId.success) notFound();

  const { repositoryRouteReader } = await createRequestServices();
  const route = await new GetAccessibleRepositoryRouteById(repositoryRouteReader).execute(
    parsedRepositoryId.data
  );
  if (!route) notFound();

  redirect(repositoryPagesPath(route));
}
