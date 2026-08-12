import { GetAccessibleRepositoryRouteById } from '@no-code-collaboration-platform/application';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';

import { createRequestServices } from '@/composition/create-request-services';
import { repositoryPagePath } from '@/routing/repository-routes';

interface LegacyPageWorkspaceProps {
  readonly params: Promise<{ pageId: string; repositoryId: string }>;
}

export default async function LegacyPageWorkspace({ params }: LegacyPageWorkspaceProps) {
  const { pageId, repositoryId } = await params;
  const parsed = z.object({ pageId: z.uuid(), repositoryId: z.uuid() }).safeParse({
    pageId,
    repositoryId
  });
  if (!parsed.success) notFound();

  const { repositoryRouteReader } = await createRequestServices();
  const route = await new GetAccessibleRepositoryRouteById(repositoryRouteReader).execute(
    parsed.data.repositoryId
  );
  if (!route) notFound();

  redirect(repositoryPagePath(route, parsed.data.pageId));
}
