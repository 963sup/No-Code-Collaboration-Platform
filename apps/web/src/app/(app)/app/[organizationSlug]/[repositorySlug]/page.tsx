import type { Metadata } from 'next';
import Link from 'next/link';

import {
  getAccessibleRepositoryRoute,
  requireAccessibleRepositoryRoute
} from './_queries/get-accessible-repository-route';

interface RepositoryPageProps {
  readonly params: Promise<{ organizationSlug: string; repositorySlug: string }>;
}

export async function generateMetadata({ params }: RepositoryPageProps): Promise<Metadata> {
  const { organizationSlug, repositorySlug } = await params;
  const route = await getAccessibleRepositoryRoute(organizationSlug, repositorySlug);

  return {
    title: route ? route.repository.name : 'Repository unavailable'
  };
}

export default async function RepositoryPage({ params }: RepositoryPageProps) {
  const { organizationSlug, repositorySlug } = await params;
  const route = await requireAccessibleRepositoryRoute(organizationSlug, repositorySlug);
  const { repository } = route;

  return (
    <div className='space-y-3'>
      <nav
        aria-label='Breadcrumb'
        className='flex items-center gap-2 text-sm text-muted-foreground'
      >
        <Link className='hover:text-foreground' href='/app'>
          Repositories
        </Link>
        <span aria-hidden='true'>/</span>
        <span>{route.organizationSlug}</span>
        <span aria-hidden='true'>/</span>
        <span className='text-foreground'>{repository.name}</span>
      </nav>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>{repository.name}</h1>
          <p className='max-w-3xl text-sm text-muted-foreground'>
            {repository.description ??
              'A no-code collaboration container for Pages, permissions, workflows, and activity.'}
          </p>
        </div>
        <span className='rounded-full border bg-muted px-3 py-1 text-xs font-medium capitalize'>
          {repository.visibility}
        </span>
      </div>
    </div>
  );
}
