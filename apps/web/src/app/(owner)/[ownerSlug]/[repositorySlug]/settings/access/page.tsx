import { ExplainCurrentRepositoryAccess } from '@no-code-collaboration-platform/application';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';
import { notFound, redirect } from 'next/navigation';

import { createRequestServices } from '@/composition/create-request-services';
import { buildPath } from '@/routing/auth-routes';
import { repositorySettingsAccessPath } from '@/routing/repository-routes';

import { requireAccessibleRepositoryRoute } from '../../_queries/get-accessible-repository-route';

interface RepositoryAccessPageProps {
  readonly params: Promise<{ ownerSlug: string; repositorySlug: string }>;
}

function sourceLabel(source: { readonly kind: string; readonly role?: string }) {
  switch (source.kind) {
    case 'direct-grant':
      return `Direct Repository Grant · ${source.role}`;
    case 'governance-derived':
      return `Ownership / governance relationship · ${source.role}`;
    case 'public-visibility':
      return 'Public visibility read baseline';
    default:
      return 'Unknown source';
  }
}

export default async function RepositoryAccessPage({ params }: RepositoryAccessPageProps) {
  const { ownerSlug, repositorySlug } = await params;
  const routeAddress = { ownerSlug, repositorySlug };
  const route = await requireAccessibleRepositoryRoute(ownerSlug, repositorySlug);
  const services = await createRequestServices();
  const result = await new ExplainCurrentRepositoryAccess(
    services.identityProvider,
    services.repositoryReader,
    services.repositoryAccessReader
  ).execute(route.repository.id);

  if (!result.ok) {
    if (result.reason === 'unauthenticated') {
      redirect(
        buildPath('/sign-in', {
          next: repositorySettingsAccessPath(routeAddress)
        })
      );
    }
    notFound();
  }

  const { explanation } = result;

  return (
    <section className='mx-auto max-w-4xl space-y-6'>
      <header className='space-y-3'>
        <div className='flex flex-wrap items-center gap-3'>
          <h1 className='text-3xl font-semibold tracking-tight'>Your Repository access</h1>
          <Badge variant='outline'>live</Badge>
        </div>
        <p className='max-w-3xl text-muted-foreground'>
          Read-only explanation derived from the same authority inputs used by Repository commands.
          This view cannot create, change, or revoke authority.
        </p>
      </header>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Effective role</CardTitle>
            <CardDescription>
              Role is an explanation bundle; Capability remains decision truth.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <p className='font-medium'>{explanation.effectiveRole ?? 'No assigned role'}</p>
            <p className='text-muted-foreground'>Visibility: {explanation.visibility}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Authority sources</CardTitle>
            <CardDescription>
              Only sources proven by the current authority projection are shown.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {explanation.sources.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                No accepted authority source is present.
              </p>
            ) : (
              <ul className='space-y-2 text-sm'>
                {explanation.sources.map((source) => (
                  <li key={`${source.kind}-${'role' in source ? source.role : 'baseline'}`}>
                    {sourceLabel(source)}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Effective capabilities</CardTitle>
          <CardDescription>
            Public visibility may contribute read capabilities, but never manufactures mutation
            authority.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2'>
          {explanation.effectiveCapabilities.map((capability) => (
            <Badge key={capability} variant='secondary'>
              {capability}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
