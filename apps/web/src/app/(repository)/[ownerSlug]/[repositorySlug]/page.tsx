import type { Metadata } from 'next';

import {
  getAccessibleRepositoryRoute,
  requireAccessibleRepositoryRoute
} from './_queries/get-accessible-repository-route';

interface RepositoryPageProps {
  readonly params: Promise<{ ownerSlug: string; repositorySlug: string }>;
}

export async function generateMetadata({ params }: RepositoryPageProps): Promise<Metadata> {
  const { ownerSlug, repositorySlug } = await params;
  const route = await getAccessibleRepositoryRoute(ownerSlug, repositorySlug);

  return {
    title: route ? `${route.ownerSlug}/${route.repository.name}` : 'Repository unavailable'
  };
}

export default async function RepositoryPage({ params }: RepositoryPageProps) {
  const { ownerSlug, repositorySlug } = await params;
  const route = await requireAccessibleRepositoryRoute(ownerSlug, repositorySlug);

  return (
    <section className='space-y-3'>
      <h1 className='text-2xl font-semibold tracking-tight'>Overview</h1>
      <p className='max-w-3xl text-sm text-muted-foreground'>
        {route.repository.description ??
          'A no-code collaboration Repository for shared Resources, processes, authority, and history.'}
      </p>
    </section>
  );
}
