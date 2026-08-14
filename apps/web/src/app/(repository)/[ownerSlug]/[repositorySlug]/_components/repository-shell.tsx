import { BookOpenText, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { SiteHeader } from '@/components/site-header';
import { repositoryPath } from '@/routing/repository-routes';

import { RepositoryNavigation } from './repository-navigation';

interface RepositoryShellProps {
  readonly children: ReactNode;
  readonly isAuthenticated: boolean;
  readonly ownerSlug: string;
  readonly repositorySlug: string;
  readonly repositoryName: string;
  readonly showActivity: boolean;
  readonly visibility: 'private' | 'public';
}

export function RepositoryShell({
  children,
  isAuthenticated,
  ownerSlug,
  repositorySlug,
  repositoryName,
  showActivity,
  visibility
}: RepositoryShellProps) {
  const repositoryRoute = { ownerSlug, repositorySlug };
  const basePath = repositoryPath(repositoryRoute);

  return (
    <div className='min-h-dvh bg-background'>
      <SiteHeader
        actions={
          <Link
            className='inline-flex h-8 items-center justify-center gap-2 rounded-md border border-shell-border px-3 text-xs font-medium text-shell-foreground outline-none transition-colors hover:bg-shell-accent focus-visible:ring-2 focus-visible:ring-shell-ring'
            href={isAuthenticated ? '/app' : `/sign-in?next=${encodeURIComponent(basePath)}`}
          >
            <LayoutDashboard aria-hidden='true' className='size-3.5' />
            {isAuthenticated ? 'Dashboard' : 'Sign in'}
          </Link>
        }
        homeHref={isAuthenticated ? '/app' : '/'}
      />
      <div className='border-b bg-repository-header'>
        <div className='mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8'>
          <div className='flex min-w-0 items-center gap-2 pb-3 text-lg'>
            <BookOpenText aria-hidden='true' className='size-4 shrink-0 text-muted-foreground' />
            <span className='truncate text-link'>{ownerSlug}</span>
            <span aria-hidden='true' className='text-muted-foreground'>
              /
            </span>
            <Link className='truncate font-semibold text-link hover:underline' href={basePath}>
              {repositoryName}
            </Link>
            <span className='rounded-full border bg-background px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground'>
              {visibility}
            </span>
          </div>
          <div className='overflow-x-auto'>
            <RepositoryNavigation
              ownerSlug={ownerSlug}
              repositorySlug={repositorySlug}
              showActivity={showActivity}
            />
          </div>
        </div>
      </div>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>{children}</div>
    </div>
  );
}
