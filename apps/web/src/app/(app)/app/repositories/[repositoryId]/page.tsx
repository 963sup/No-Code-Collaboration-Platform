import { GetAccessibleRepositoryRouteById } from '@no-code-collaboration-platform/application';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';

import { createRequestServices } from '@/composition/create-request-services';
import { repositoryPath } from '@/routing/repository-routes';

interface LegacyRepositoryPageProps {
  readonly params: Promise<{ repositoryId: string }>;
}

export default async function LegacyRepositoryPage({ params }: LegacyRepositoryPageProps) {
  const { repositoryId } = await params;
  const parsedRepositoryId = z.uuid().safeParse(repositoryId);
  if (!parsedRepositoryId.success) notFound();

  const { repositoryRouteReader } = await createRequestServices();
  const route = await new GetAccessibleRepositoryRouteById(repositoryRouteReader).execute(
    parsedRepositoryId.data
  );
  if (!route) notFound();

  redirect(repositoryPath(route));
}
