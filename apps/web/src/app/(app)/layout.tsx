import { GetCurrentIdentity } from '@no-code-collaboration-platform/application';
import { Button } from '@no-code-collaboration-platform/ui';
import { Boxes, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { createRequestServices } from '@/composition/create-request-services';
import { SiteHeader } from '@/components/site-header';

import { signOut } from './actions';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { identityProvider } = await createRequestServices();
  const identity = await new GetCurrentIdentity(identityProvider).execute();

  if (!identity) redirect('/sign-in?next=/app');

  const email = identity.email ?? 'Authenticated actor';

  return (
    <div className='min-h-dvh bg-muted/25'>
      <SiteHeader
        actions={
          <>
            <span className='hidden max-w-64 truncate text-sm text-shell-muted sm:inline'>
              {email}
            </span>
            <form action={signOut}>
              <Button
                className='border-shell-border text-shell-foreground hover:bg-shell-accent hover:text-shell-foreground'
                size='sm'
                type='submit'
                variant='ghost'
              >
                Sign out
              </Button>
            </form>
          </>
        }
        homeHref='/app'
      />
      <div className='grid min-h-[calc(100dvh-4rem)] md:grid-cols-[15rem_1fr]'>
        <aside className='hidden border-r bg-background p-4 md:block'>
          <nav aria-label='Application navigation' className='space-y-1'>
            <Link
              className='flex items-center gap-3 rounded-md bg-accent px-3 py-2 text-sm font-medium'
              href='/app'
            >
              <LayoutDashboard aria-hidden='true' className='size-4' />
              Overview
            </Link>
            <span className='flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground'>
              <Boxes aria-hidden='true' className='size-4' />
              Repositories
            </span>
          </nav>
        </aside>
        <main className='min-w-0 p-4 sm:p-6 lg:p-10'>{children}</main>
      </div>
    </div>
  );
}
