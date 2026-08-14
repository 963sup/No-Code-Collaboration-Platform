import { CircleDot, ListFilter } from 'lucide-react';
import Link from 'next/link';

import { repositoryIssuesPath } from '@/routing/repository-routes';

interface IssuesSidebarProps {
  readonly params: Promise<{ ownerSlug: string; repositorySlug: string }>;
}

function IssueLinks({ basePath }: { readonly basePath: string }) {
  return (
    <nav aria-label='Issue views' className='grid gap-1 text-sm'>
      <Link className='rounded-md bg-muted px-3 py-2 font-medium' href={basePath}>
        All issues
      </Link>
      <Link className='rounded-md px-3 py-2 text-muted-foreground hover:bg-muted' href={basePath}>
        Open
      </Link>
      <Link
        className='rounded-md px-3 py-2 text-muted-foreground hover:bg-muted'
        href={`${basePath}?status=closed`}
      >
        Closed
      </Link>
    </nav>
  );
}

export default async function IssuesSidebar({ params }: IssuesSidebarProps) {
  const route = await params;
  const basePath = repositoryIssuesPath(route);

  return (
    <aside
      aria-label='Issue navigation'
      className='order-first md:sticky md:top-6 md:order-none md:self-start'
      data-sidebar-placement='left'
    >
      <div className='hidden space-y-4 md:block'>
        <div className='flex items-center gap-2 px-3 text-sm font-semibold'>
          <CircleDot aria-hidden='true' className='size-4' />
          Issues
        </div>
        <IssueLinks basePath={basePath} />
      </div>
      <details className='rounded-md border bg-card p-3 md:hidden'>
        <summary className='flex cursor-pointer list-none items-center gap-2 font-medium'>
          <ListFilter aria-hidden='true' className='size-4' />
          Issue views
        </summary>
        <div className='mt-3 border-t pt-3'>
          <IssueLinks basePath={basePath} />
        </div>
      </details>
    </aside>
  );
}
