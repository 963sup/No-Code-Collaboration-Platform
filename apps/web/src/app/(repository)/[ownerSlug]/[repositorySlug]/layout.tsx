import {
  CanReadRepositoryActivity,
  GetCurrentIdentity
} from '@no-code-collaboration-platform/application';
import type { ReactNode } from 'react';

import { createRequestServices } from '@/composition/create-request-services';

import { RepositoryShell } from './_components/repository-shell';
import { requireAccessibleRepositoryRoute } from './_queries/get-accessible-repository-route';

interface RepositoryLayoutProps {
  readonly children: ReactNode;
  readonly modal?: ReactNode;
  readonly params: Promise<{ ownerSlug: string; repositorySlug: string }>;
  readonly sidebar?: ReactNode;
}

export default async function RepositoryLayout({
  children,
  modal,
  params,
  sidebar
}: RepositoryLayoutProps) {
  const { ownerSlug, repositorySlug } = await params;
  const route = await requireAccessibleRepositoryRoute(ownerSlug, repositorySlug);
  const services = await createRequestServices();
  const identity = await new GetCurrentIdentity(services.identityProvider).execute();
  const showActivity = identity
    ? await new CanReadRepositoryActivity(services.repositoryAccessReader).execute({
        actorId: identity.id,
        repositoryId: route.repository.id
      })
    : false;

  return (
    <RepositoryShell
      isAuthenticated={Boolean(identity)}
      ownerSlug={route.ownerSlug}
      repositoryName={route.repository.name}
      repositorySlug={route.repository.slug}
      showActivity={showActivity}
      visibility={route.repository.visibility}
    >
      <div className='repository-route-composition'>
        <main className='min-w-0'>{children}</main>
        {sidebar}
      </div>
      {modal}
    </RepositoryShell>
  );
}
