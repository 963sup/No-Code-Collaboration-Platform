import { Card, CardContent, CardHeader, CardTitle } from '@no-code-collaboration-platform/ui';
import { BookOpenText, FileText, Globe2, LockKeyhole } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { repositoryWikiPath } from '@/routing/repository-routes';

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
  const wikiPath = repositoryWikiPath(route);
  const VisibilityIcon = route.repository.visibility === 'public' ? Globe2 : LockKeyhole;

  return (
    <section className='space-y-6'>
      <div className='space-y-1'>
        <p className='text-sm font-medium text-muted-foreground'>Repository overview</p>
        <h1 className='text-2xl font-semibold tracking-tight'>{route.repository.name}</h1>
      </div>

      <div className='grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(17rem,1fr)]'>
        <Card className='shadow-none'>
          <CardHeader className='border-b p-5 sm:p-6'>
            <div className='flex items-start gap-3'>
              <span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground'>
                <BookOpenText aria-hidden='true' className='size-5' />
              </span>
              <div className='min-w-0 space-y-1'>
                <CardTitle className='text-lg'>Collaborate in one place</CardTitle>
                <p className='text-sm leading-6 text-muted-foreground'>
                  {route.repository.description ??
                    'A shared no-code collaboration container for durable resources and activity.'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            <Link
              className='flex items-center gap-3 px-5 py-4 outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-6'
              href={wikiPath}
            >
              <FileText aria-hidden='true' className='size-5 shrink-0 text-muted-foreground' />
              <span className='min-w-0 flex-1'>
                <span className='block text-sm font-semibold'>Wiki</span>
                <span className='block text-sm text-muted-foreground'>
                  Create and maintain shared Repository knowledge.
                </span>
              </span>
              <span aria-hidden='true' className='text-muted-foreground'>
                →
              </span>
            </Link>
          </CardContent>
        </Card>

        <aside aria-label='Repository details' className='space-y-4'>
          <Card className='shadow-none'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>About</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-sm'>
              <div className='flex items-start gap-3'>
                <VisibilityIcon
                  aria-hidden='true'
                  className='mt-0.5 size-4 shrink-0 text-muted-foreground'
                />
                <div>
                  <p className='font-medium capitalize'>{route.repository.visibility}</p>
                  <p className='text-muted-foreground'>Repository visibility</p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <BookOpenText
                  aria-hidden='true'
                  className='mt-0.5 size-4 shrink-0 text-muted-foreground'
                />
                <div className='min-w-0'>
                  <p className='truncate font-medium'>
                    {route.ownerSlug}/{route.repository.slug}
                  </p>
                  <p className='text-muted-foreground'>Canonical Repository identity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}
