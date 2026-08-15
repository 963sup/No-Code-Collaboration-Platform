import { ListAccessibleRepositoryRoutes } from '@no-code-collaboration-platform/application';
import {
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';
import { Building2, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { createRequestServices } from '@/composition/create-request-services';
import { repositoryPath } from '@/routing/repository-routes';

export const metadata: Metadata = {
  title: 'Dashboard'
};

export default async function DashboardPage() {
  const { repositoryRouteReader } = await createRequestServices();
  const routes = await new ListAccessibleRepositoryRoutes(repositoryRouteReader).execute();

  return (
    <div className='mx-auto max-w-6xl space-y-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='space-y-2'>
          <p className='text-sm font-medium text-muted-foreground'>Dashboard</p>
          <h1 className='text-3xl font-semibold tracking-tight'>Repositories</h1>
          <p className='max-w-2xl text-muted-foreground'>
            Choose a Repository you can access. Owner and Repository names resolve to stable
            Repository identity before authorization-sensitive work begins.
          </p>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <Link className={buttonVariants({ variant: 'outline' })} href='/organizations/new'>
            <Building2 aria-hidden='true' className='size-4' />
            New Organization
          </Link>
          <Link className={buttonVariants()} href='/new'>
            <Plus aria-hidden='true' className='size-4' />
            New Repository
          </Link>
        </div>
      </div>

      {routes.length === 0 ? (
        <Card className='border-dashed'>
          <CardHeader>
            <CardTitle>No accessible repositories</CardTitle>
            <CardDescription>
              Authentication alone creates no collaboration authority. A Repository appears here
              only after ownership, governance, an explicit Grant, or accepted visibility makes it
              accessible.
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
      )}
    </div>
  );
}
