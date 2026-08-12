import { ListAccessibleRepositoryRoutes } from '@no-code-collaboration-platform/application';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';
import type { Metadata } from 'next';
import Link from 'next/link';

import { createRequestServices } from '@/composition/create-request-services';
import { repositoryPath } from '@/routing/repository-routes';

export const metadata: Metadata = {
  title: 'Repositories'
};

export default async function AppHomePage() {
  const { repositoryRouteReader } = await createRequestServices();
  const routes = await new ListAccessibleRepositoryRoutes(repositoryRouteReader).execute();

  return (
    <div className='mx-auto max-w-6xl space-y-8'>
      <div className='space-y-2'>
        <p className='text-sm font-medium text-muted-foreground'>Collaboration containers</p>
        <h1 className='text-3xl font-semibold tracking-tight'>Repositories</h1>
        <p className='max-w-2xl text-muted-foreground'>
          Choose an Organization-owned Repository. Human-readable routes are resolved to stable
          Repository identities before authorization-sensitive work begins.
        </p>
      </div>

      {routes.length === 0 ? (
        <Card className='border-dashed'>
          <CardHeader>
            <CardTitle>No accessible repositories</CardTitle>
            <CardDescription>
              Authentication alone creates no collaboration authority. A Repository appears here only
              after an accepted authority source makes it accessible.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {routes.map((route) => (
            <Link
              className='block rounded-xl outline-none ring-offset-background transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              href={repositoryPath(route)}
              key={route.repository.id}
            >
              <Card className='h-full transition-colors hover:bg-accent/30'>
                <CardHeader>
                  <CardTitle>{route.repository.name}</CardTitle>
                  <CardDescription>
                    {route.organizationSlug}/{route.repository.slug}
                  </CardDescription>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground'>
                  Visibility: {route.repository.visibility}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
