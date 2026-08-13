import { GetAccessibleRepositoryRouteById } from '@no-code-collaboration-platform/application';
import { notFound, redirect } from 'next/navigation';
import { z } from 'zod';

import { createRequestServices } from '@/composition/create-request-services';
import {
  repositoryPagePath,
  repositoryPagesPath,
  repositoryPath
} from '@/routing/repository-routes';

interface LegacyRepositoryCompatibilityPageProps {
  readonly params: Promise<{
    legacyPath?: string[];
    repositoryId: string;
  }>;
}

export default async function LegacyRepositoryCompatibilityPage({
  params
}: LegacyRepositoryCompatibilityPageProps) {
  const { legacyPath = [], repositoryId } = await params;
  const parsedRepositoryId = z.uuid().safeParse(repositoryId);
  if (!parsedRepositoryId.success) notFound();

  let pageId: string | undefined;
  if (legacyPath.length === 0) {
    // Repository root compatibility alias.
  } else if (legacyPath.length === 1 && legacyPath[0] === 'resources') {
    // Legacy Resource collection maps to the concrete Page collection.
  } else if (legacyPath.length === 2 && legacyPath[0] === 'resources') {
    const parsedPageId = z.uuid().safeParse(legacyPath[1]);
    if (!parsedPageId.success) notFound();
    pageId = parsedPageId.data;
  } else {
    notFound();
  }

  const { repositoryRouteReader } = await createRequestServices();
  const route = await new GetAccessibleRepositoryRouteById(repositoryRouteReader).execute(
    parsedRepositoryId.data
  );
  if (!route) notFound();

  if (pageId) redirect(repositoryPagePath(route, pageId));
  if (legacyPath.length === 1) redirect(repositoryPagesPath(route));
  redirect(repositoryPath(route));
}
