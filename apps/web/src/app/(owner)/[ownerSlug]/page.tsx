import {
  GetOwnerProfile,
  ListOwnerRepositoryRoutes
} from '@no-code-collaboration-platform/application';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { SurfaceFrame } from '@/components/surface-frame';
import { createRequestServices } from '@/composition/create-request-services';
import {
  normalizeOwnerProfileTab,
  ownerPath,
  ownerTabPath,
  type OwnerProfileTab
} from '@/routing/owner-routes';
import { repositoryPath } from '@/routing/repository-routes';

interface OwnerProfilePageProps {
  readonly params: Promise<{ ownerSlug: string }>;
  readonly searchParams: Promise<{ tab?: string | string[] }>;
}

function OwnerTabs({
  activeTab,
  kind,
  ownerSlug
}: {
  readonly activeTab: OwnerProfileTab;
  readonly kind: 'organization' | 'user';
  readonly ownerSlug: string;
}) {
  const tabs: readonly { label: string; tab: OwnerProfileTab }[] =
    kind === 'user'
      ? [
          { label: 'Overview', tab: 'overview' },
          { label: 'Repositories', tab: 'repositories' },
          { label: 'Stars', tab: 'stars' },
          { label: 'Projects', tab: 'projects' }
        ]
      : [
          { label: 'Overview', tab: 'overview' },
          { label: 'Repositories', tab: 'repositories' },
          { label: 'Projects', tab: 'projects' }
        ];

  return (
    <nav aria-label='Owner profile' className='flex gap-1 overflow-x-auto border-b'>
      {tabs.map(({ label, tab }) => (
        <Link
          aria-current={activeTab === tab ? 'page' : undefined}
          className={
            activeTab === tab
              ? 'min-w-max border-b-2 border-accent-emphasis px-3 py-3 text-sm font-semibold text-foreground'
              : 'min-w-max border-b-2 border-transparent px-3 py-3 text-sm text-muted-foreground hover:text-foreground'
          }
          href={tab === 'overview' ? ownerPath(ownerSlug) : ownerTabPath(ownerSlug, tab)}
          key={tab}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

function RepositoryCards({
  repositories
}: {
  readonly repositories: Awaited<ReturnType<ListOwnerRepositoryRoutes['execute']>>;
}) {
  if (repositories.length === 0) {
    return (
      <Card className='border-dashed'>
        <CardHeader>
          <CardTitle>No visible repositories</CardTitle>
          <CardDescription>
            This profile exists independently from Repository visibility. Only Repositories the
            current viewer may read are projected here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {repositories.map((route) => (
        <Link href={repositoryPath(route)} key={route.repository.id}>
          <Card className='h-full transition-colors hover:bg-accent/30'>
            <CardHeader>
              <CardTitle>{route.repository.name}</CardTitle>
              <CardDescription>
                {route.ownerSlug}/{route.repository.slug}
              </CardDescription>
            </CardHeader>
            <CardContent className='text-sm text-muted-foreground'>
              Visibility: {route.repository.visibility}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default async function OwnerProfilePage({ params, searchParams }: OwnerProfilePageProps) {
  const { ownerSlug } = await params;
  const normalizedTab = normalizeOwnerProfileTab((await searchParams).tab);
  if (normalizedTab.changed) redirect(ownerPath(ownerSlug));

  const services = await createRequestServices();
  const profile = await new GetOwnerProfile(services.ownerProfileReader).execute(ownerSlug);
  if (!profile) notFound();

  if (profile.kind === 'organization' && normalizedTab.tab === 'stars') {
    redirect(ownerPath(profile.slug));
  }

  const shouldLoadRepositories =
    normalizedTab.tab === 'overview' || normalizedTab.tab === 'repositories';
  const repositories = shouldLoadRepositories
    ? await new ListOwnerRepositoryRoutes(services.ownerProfileReader).execute(profile.slug)
    : [];

  return (
    <main className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8'>
      <header className='space-y-2'>
        <div className='flex flex-wrap items-center gap-3'>
          <h1 className='text-3xl font-semibold tracking-tight'>
            {profile.displayName ?? profile.slug}
          </h1>
          <Badge variant='outline'>{profile.kind === 'user' ? 'User' : 'Organization'}</Badge>
        </div>
        <p className='text-sm text-muted-foreground'>@{profile.slug}</p>
      </header>

      <OwnerTabs activeTab={normalizedTab.tab} kind={profile.kind} ownerSlug={profile.slug} />

      {normalizedTab.tab === 'overview' ? (
        <section className='space-y-4'>
          <div>
            <h2 className='text-xl font-semibold'>Overview</h2>
            <p className='text-sm text-muted-foreground'>
              Stable Owner identity projection. Owner kind is resolved from the shared namespace,
              never inferred from the URL shape.
            </p>
          </div>
          <RepositoryCards repositories={repositories.slice(0, 6)} />
        </section>
      ) : null}

      {normalizedTab.tab === 'repositories' ? (
        <section className='space-y-4'>
          <h2 className='text-xl font-semibold'>Repositories</h2>
          <RepositoryCards repositories={repositories} />
        </section>
      ) : null}

      {normalizedTab.tab === 'stars' ? (
        <SurfaceFrame
          availability='deferred'
          description='The GitHub profile URL is preserved, but Star is not yet an admitted Product relationship or persistence contract.'
          emptyTitle='Stars are not established'
          title='Stars'
        />
      ) : null}

      {normalizedTab.tab === 'projects' ? (
        <SurfaceFrame
          availability='preview'
          description='Owner-scoped planning is a non-owning Projection. The URL is established without inventing a Project entity or independent authority boundary.'
          emptyTitle='Owner Project projection is not live'
          title='Projects'
        />
      ) : null}
    </main>
  );
}
