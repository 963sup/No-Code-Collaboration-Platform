import { ListAccessibleRepositories } from '@no-code-collaboration-platform/application';
import { SupabaseRepositoryReader } from '@no-code-collaboration-platform/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@no-code-collaboration-platform/ui';
import type { Metadata } from 'next';

import { createWebServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Workspace'
};

export default async function AppHomePage() {
  const supabase = await createWebServerClient();
  const repositories = await new ListAccessibleRepositories(
    new SupabaseRepositoryReader(supabase)
  ).execute();

  return (
    <div className='mx-auto max-w-6xl space-y-8'>
      <div className='space-y-2'>
        <p className='text-sm font-medium text-muted-foreground'>Authenticated application context</p>
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
              The first product slice will create an Organization, Repository, Page resource, and explicit grant.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {repositories.map((repository) => (
            <Card key={repository.id}>
              <CardHeader>
                <CardTitle>{repository.name}</CardTitle>
                <CardDescription>{repository.description ?? repository.slug}</CardDescription>
              </CardHeader>
              <CardContent className='text-sm text-muted-foreground'>
                Visibility: {repository.visibility}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
