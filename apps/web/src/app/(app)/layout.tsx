import { GetCurrentIdentity } from '@no-code-collaboration-platform/application';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { signOut } from '@/actions/sign-out';
import { AppHeaderControls } from '@/components/app-header-controls';
import { ApplicationNavigationList } from '@/components/application-navigation';
import { SiteHeader } from '@/components/site-header';
import { createRequestServices } from '@/composition/create-request-services';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { identityProvider } = await createRequestServices();
  const identity = await new GetCurrentIdentity(identityProvider).execute();

  if (!identity) redirect('/sign-in?next=/dashboard');

  const email = identity.email ?? 'Authenticated actor';

  return (
    <div className='min-h-dvh bg-muted/25'>
      <SiteHeader
        actions={<AppHeaderControls identityLabel={email} signOutAction={signOut} />}
        homeHref='/dashboard'
      />
      <div className='grid min-h-[calc(100dvh-4rem)] md:grid-cols-[15rem_1fr]'>
        <aside className='hidden border-r bg-background p-4 md:block'>
          <ApplicationNavigationList />
        </aside>
        <main className='min-w-0 p-4 sm:p-6 lg:p-10'>{children}</main>
      </div>
    </div>
  );
}
