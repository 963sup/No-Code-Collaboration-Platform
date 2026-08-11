import { ListAccessibleRepositories } from '@no-code-collaboration-platform/application';
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

export const metadata: Metadata = {
  title: 'Workspace'
};

export default async function AppHomePage() {
  const { repositoryReader } = await createRequestServices();
  const repositories = await new ListAccessibleRepositories(repositoryReader).execute();

  return (
    <div className='mx-auto max-w-6xl space-y-8'>
      <div className='space-y-2'>
        <p className='text-sm font-medium text-muted-foreground'>
          Authenticated application context
        </p>
        <h1 className='text-3xl font-semibold tracking-tight'>Repositories</h1>
        <p className='max-w-2xl text-muted-foreground'>
          RLS exposes only the no-code collaboration containers available to the current actor.
        </p>
      </div>

      {repositories.length === 0 ? (
        <Card className='border-dashed'>
          <CardHeader>
            <CardTitle>No accessible repositories</CardTitle>
            <CardDescription>
              The first product slice will create an Organization, Repository, Page resource, and
              explicit grant.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {repositories.map((repository) => (
            <Link
              className='block rounded-xl outline-none ring-offset-background transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              href={`/app/repositories/${repository.id}`}
              key={repository.id}
            >
              <Card className='h-full transition-colors hover:bg-accent/30'>
                <CardHeader>
                  <CardTitle>{repository.name}</CardTitle>
                  <CardDescription>{repository.description ?? repository.slug}</CardDescription>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground'>
                  Visibility: {repository.visibility}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
