import { Button } from '@no-code-collaboration-platform/ui';
import { Boxes, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { createWebServerClient } from '@/lib/supabase/server';

import { signOut } from './actions';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  const supabase = await createWebServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) redirect('/sign-in?next=/app');

  const email = typeof data.claims.email === 'string' ? data.claims.email : 'Authenticated actor';

  return (
    <div className='min-h-dvh bg-muted/25'>
      <header className='border-b bg-background'>
        <div className='flex h-16 items-center justify-between px-6'>
          <Link className='font-semibold tracking-tight' href='/app'>
            No-Code Collaboration Platform
          </Link>
          <div className='flex items-center gap-3'>
            <span className='hidden text-sm text-muted-foreground sm:inline'>{email}</span>
            <form action={signOut}>
              <Button size='sm' type='submit' variant='ghost'>
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className='grid min-h-[calc(100dvh-4rem)] md:grid-cols-[15rem_1fr]'>
        <aside className='border-r bg-background p-4'>
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
        <main className='min-w-0 p-6 lg:p-10'>{children}</main>
      </div>
    </div>
  );
}
