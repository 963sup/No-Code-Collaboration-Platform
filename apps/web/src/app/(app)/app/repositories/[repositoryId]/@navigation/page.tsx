import { ArrowLeft, History, LayoutGrid, Shapes } from 'lucide-react';
import Link from 'next/link';

import { requireAccessibleRepository } from '../_queries/get-accessible-repository';

interface RepositoryNavigationProps {
  readonly params: Promise<{ repositoryId: string }>;
}

export default async function RepositoryNavigation({ params }: RepositoryNavigationProps) {
  const { repositoryId } = await params;
  const repository = await requireAccessibleRepository(repositoryId);
  const repositoryPath = `/app/repositories/${repository.id}`;

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
          {repository.slug}
        </p>
        <Link
          className='flex items-center gap-3 rounded-md bg-accent px-3 py-2 text-sm font-medium'
          href={`${repositoryPath}#workspace`}
        >
          <LayoutGrid aria-hidden='true' className='size-4' />
          Workspace
        </Link>
        <Link
          className='flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground'
          href={`${repositoryPath}#resources`}
        >
          <Shapes aria-hidden='true' className='size-4' />
          Resources
        </Link>
        <Link
          className='flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground'
          href={`${repositoryPath}#activity`}
        >
          <History aria-hidden='true' className='size-4' />
          Activity
        </Link>
      </div>
    </nav>
  );
}
