import type { Metadata } from 'next';
import Link from 'next/link';

import {
  getAccessibleRepository,
  requireAccessibleRepository
} from './_queries/get-accessible-repository';

interface RepositoryPageProps {
  readonly params: Promise<{ repositoryId: string }>;
}

export async function generateMetadata({ params }: RepositoryPageProps): Promise<Metadata> {
  const { repositoryId } = await params;
  const repository = await getAccessibleRepository(repositoryId);

  return {
    title: repository ? repository.name : 'Repository unavailable'
  };
}

export default async function RepositoryPage({ params }: RepositoryPageProps) {
  const { repositoryId } = await params;
  const repository = await requireAccessibleRepository(repositoryId);

  return (
    <div className='space-y-3'>
      <nav aria-label='Breadcrumb' className='flex items-center gap-2 text-sm text-muted-foreground'>
        <Link className='hover:text-foreground' href='/app'>
          Repositories
        </Link>
        <span aria-hidden='true'>/</span>
        <span className='text-foreground'>{repository.name}</span>
      </nav>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>{repository.name}</h1>
          <p className='max-w-3xl text-sm text-muted-foreground'>
            {repository.description ??
              'A no-code collaboration container for resources, permissions, workflows, and activity.'}
          </p>
        </div>
        <span className='rounded-full border bg-muted px-3 py-1 text-xs font-medium capitalize'>
          {repository.visibility}
        </span>
      </div>
    </div>
  );
}
