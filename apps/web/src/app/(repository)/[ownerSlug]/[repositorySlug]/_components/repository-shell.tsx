import Link from 'next/link';
import type { ReactNode } from 'react';

interface RepositoryShellProps {
  readonly children: ReactNode;
  readonly ownerSlug: string;
  readonly repositorySlug: string;
  readonly repositoryName: string;
  readonly showActivity: boolean;
  readonly visibility: 'private' | 'public';
}

export function RepositoryShell({
  children,
  ownerSlug,
  repositorySlug,
  repositoryName,
  showActivity,
  visibility
}: RepositoryShellProps) {
  const basePath = `/${encodeURIComponent(ownerSlug)}/${encodeURIComponent(repositorySlug)}`;

  return (
    <main className='min-h-screen bg-background'>
      <header className='border-b bg-card'>
        <div className='mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8'>
          <div className='flex flex-wrap items-center justify-between gap-3 pb-4'>
            <div className='flex min-w-0 items-center gap-2 text-lg'>
              <span className='truncate text-muted-foreground'>{ownerSlug}</span>
              <span aria-hidden='true' className='text-muted-foreground'>/</span>
              <Link className='truncate font-semibold hover:underline' href={basePath}>
                {repositoryName}
              </Link>
            </div>
            <span className='rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground'>
              {visibility}
            </span>
          </div>
          <nav aria-label='Repository' className='flex gap-1 overflow-x-auto'>
            <Link className='px-3 py-2 text-sm font-medium' href={basePath}>
              Overview
            </Link>
            <Link className='px-3 py-2 text-sm font-medium' href={`${basePath}/pages`}>
              Pages
            </Link>
            {showActivity ? (
              <Link className='px-3 py-2 text-sm font-medium' href={`${basePath}/activity`}>
                Activity
              </Link>
            ) : null}
          </nav>
        </div>
      </header>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>{children}</div>
    </main>
  );
}
