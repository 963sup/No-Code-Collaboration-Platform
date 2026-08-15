import { GetCurrentIdentity } from '@no-code-collaboration-platform/application';
import type { ReactNode } from 'react';

import { signOut } from '@/actions/sign-out';
import { createRequestServices } from '@/composition/create-request-services';

import { RepositoryShell } from './_components/repository-shell';
import { requireAccessibleRepositoryRoute } from './_queries/get-accessible-repository-route';
import { updateRepositoryNotificationPreferenceAction } from './notification-actions';

interface RepositoryLayoutProps {
  readonly children: ReactNode;
  readonly modal: ReactNode;
  readonly params: Promise<{ ownerSlug: string; repositorySlug: string }>;
  readonly sidebar: ReactNode;
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

  return (
    <RepositoryShell
      isAuthenticated={Boolean(identity)}
      identityLabel={identity?.email ?? undefined}
      ownerSlug={route.ownerSlug}
      repositoryName={route.repository.name}
      repositorySlug={route.repository.slug}
      signOutAction={signOut}
      updateNotificationPreferenceAction={updateRepositoryNotificationPreferenceAction.bind(
        null,
        route.ownerSlug,
        route.repository.slug
      )}
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
