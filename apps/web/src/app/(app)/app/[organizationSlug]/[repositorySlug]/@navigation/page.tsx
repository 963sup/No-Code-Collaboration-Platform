import { ArrowLeft, FileText, History, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

import {
  repositoryActivityPath,
  repositoryPagesPath,
  repositoryPath
} from '@/routing/repository-routes';

import { requireAccessibleRepositoryRoute } from '../_queries/get-accessible-repository-route';

interface RepositoryNavigationProps {
  readonly params: Promise<{ organizationSlug: string; repositorySlug: string }>;
}

export default async function RepositoryNavigation({ params }: RepositoryNavigationProps) {
  const { organizationSlug, repositorySlug } = await params;
  const route = await requireAccessibleRepositoryRoute(organizationSlug, repositorySlug);
  const canonicalPath = repositoryPath(route);

  return (
    <nav aria-label='Repository workspace' className='space-y-6'>
      <Link
        className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground'
        href='/app'
      >
        <ArrowLeft aria-hidden='true' className='size-4' />
        All repositories
      </Link>
      <div className='space-y-1'>
        <p className='px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          {route.organizationSlug}/{route.repository.slug}
        </p>
        <Link
          className='flex items-center gap-3 rounded-md bg-accent px-3 py-2 text-sm font-medium'
          href={canonicalPath}
        >
          <LayoutGrid aria-hidden='true' className='size-4' />
          Overview
        </Link>
        <Link
          className='flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground'
          href={repositoryPagesPath(route)}
        >
          <FileText aria-hidden='true' className='size-4' />
          Pages
        </Link>
        <Link
          className='flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground'
          href={repositoryActivityPath(route)}
        >
          <History aria-hidden='true' className='size-4' />
          Activity
        </Link>
      </div>
    </nav>
  );
}
