import type { ReactNode } from 'react';

import { RepositoryShell } from './_components/repository-shell';
import { requireAccessibleRepositoryRoute } from './_queries/get-accessible-repository-route';

interface RepositoryLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<{ ownerSlug: string; repositorySlug: string }>;
}

export default async function RepositoryLayout({ children, params }: RepositoryLayoutProps) {
  const { ownerSlug, repositorySlug } = await params;
  const route = await requireAccessibleRepositoryRoute(ownerSlug, repositorySlug);

  return (
    <RepositoryShell
      ownerSlug={route.ownerSlug}
      repositoryName={route.repository.name}
      repositorySlug={route.repository.slug}
      visibility={route.repository.visibility}
    >
      {children}
    </RepositoryShell>
  );
}
