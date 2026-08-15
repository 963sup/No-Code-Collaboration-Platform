import {
  ExplainCurrentRepositoryAccess,
  GetRepositoryGrantManagement
} from '@no-code-collaboration-platform/application';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label
} from '@no-code-collaboration-platform/ui';
import { notFound, redirect } from 'next/navigation';

import { createRequestServices } from '@/composition/create-request-services';
import { buildPath } from '@/routing/auth-routes';
import { repositorySettingsAccessPath } from '@/routing/repository-routes';

import { requireAccessibleRepositoryRoute } from '../../_queries/get-accessible-repository-route';
import { changeRepositoryGrantRole, grantRepositoryAccess, revokeRepositoryGrant } from './actions';

interface RepositoryAccessPageProps {
  readonly params: Promise<{ ownerSlug: string; repositorySlug: string }>;
  readonly searchParams: Promise<{ error?: string; saved?: string }>;
}

const errorMessages: Readonly<Record<string, string>> = {
  'already-granted': 'That User already has a Direct Repository Grant.',
  forbidden: 'The requested delegation is not allowed by your current Repository authority.',
  'provider-unavailable': 'Repository access storage is temporarily unavailable. Try again.',
  'repository-unavailable': 'The Repository is no longer available to the current Actor.',
  'state-changed':
    'That Grant changed after this page loaded. Review the current Role and try again.',
  'target-unavailable': 'No grantable User matches that target.'
};

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

function RouteFields({
  ownerSlug,
  repositoryId,
  repositorySlug
}: {
  readonly ownerSlug: string;
  readonly repositoryId: string;
  readonly repositorySlug: string;
}) {
  return (
    <>
      <input name='ownerSlug' type='hidden' value={ownerSlug} />
      <input name='repositoryId' type='hidden' value={repositoryId} />
      <input name='repositorySlug' type='hidden' value={repositorySlug} />
    </>
  );
}

export default async function RepositoryAccessPage({
  params,
  searchParams
}: RepositoryAccessPageProps) {
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

  const management = await new GetRepositoryGrantManagement(
    services.identityProvider,
    services.repositoryReader,
    services.repositoryAccessReader,
    services.repositoryGrantRepository
  ).execute(route.repository.id);
  const { error, saved } = await searchParams;
  const { explanation } = result;

  return (
    <section className='mx-auto max-w-4xl space-y-6'>
      <header className='space-y-3'>
        <div className='flex flex-wrap items-center gap-3'>
          <h1 className='text-3xl font-semibold tracking-tight'>Repository access</h1>
          <Badge variant='outline'>live</Badge>
        </div>
        <p className='max-w-3xl text-muted-foreground'>
          Effective authority is derived from ownership/governance, Direct Grants, and the public
          read baseline. Direct Grant changes use the same Domain delegation policy and independent
          database enforcement.
        </p>
      </header>

      {error && errorMessages[error] ? (
        <p
          aria-live='polite'
          className='rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive'
          role='alert'
        >
          {errorMessages[error]}
        </p>
      ) : null}
      {saved ? (
        <p
          aria-live='polite'
          className='rounded-md border border-border bg-muted/50 p-3 text-sm text-foreground'
          role='status'
        >
          {saved === 'unchanged'
            ? 'Repository Grant was already unchanged.'
            : 'Repository Grant updated.'}
        </p>
      ) : null}

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Your effective role</CardTitle>
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

      {management.ok ? (
        <Card>
          <CardHeader>
            <CardTitle>Direct collaborators</CardTitle>
            <CardDescription>
              Direct Grants are explicit User → Repository authority relationships. They are
              independent from Organization Membership and cannot target the acting User itself.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <form
              action={grantRepositoryAccess}
              className='grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end'
            >
              <RouteFields
                ownerSlug={ownerSlug}
                repositoryId={route.repository.id}
                repositorySlug={repositorySlug}
              />
              <div className='space-y-2'>
                <Label htmlFor='grant-username'>User username</Label>
                <Input
                  autoCapitalize='none'
                  autoComplete='off'
                  id='grant-username'
                  name='username'
                  pattern='[a-z0-9]+(?:-[a-z0-9]+)*'
                  placeholder='collaborator-name'
                  required
                  spellCheck={false}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='grant-role'>Role</Label>
                <select
                  className='flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'
                  id='grant-role'
                  name='role'
                  required
                >
                  {management.grantableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <Button disabled={management.grantableRoles.length === 0} type='submit'>
                Add collaborator
              </Button>
            </form>

            {management.grants.length === 0 ? (
              <p className='text-sm text-muted-foreground'>No Direct Repository Grants.</p>
            ) : (
              <ul className='divide-y rounded-md border'>
                {management.grants.map((grant) => (
                  <li className='space-y-3 p-4' key={grant.id}>
                    <div className='flex flex-wrap items-center justify-between gap-3'>
                      <div>
                        <p className='font-medium'>{grant.displayName ?? grant.username}</p>
                        <p className='text-sm text-muted-foreground'>@{grant.username}</p>
                      </div>
                      <Badge variant='secondary'>{grant.role}</Badge>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {grant.allowedRoles.length > 0 ? (
                        <form action={changeRepositoryGrantRole} className='flex flex-wrap gap-2'>
                          <RouteFields
                            ownerSlug={ownerSlug}
                            repositoryId={route.repository.id}
                            repositorySlug={repositorySlug}
                          />
                          <input name='targetUserId' type='hidden' value={grant.id} />
                          <select
                            aria-label={`New role for ${grant.username}`}
                            className='flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'
                            name='role'
                            required
                          >
                            {grant.allowedRoles.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                          <Button size='sm' type='submit' variant='outline'>
                            Change role
                          </Button>
                        </form>
                      ) : null}
                      {grant.canRevoke ? (
                        <form action={revokeRepositoryGrant}>
                          <RouteFields
                            ownerSlug={ownerSlug}
                            repositoryId={route.repository.id}
                            repositorySlug={repositorySlug}
                          />
                          <input name='targetUserId' type='hidden' value={grant.id} />
                          <Button size='sm' type='submit' variant='destructive'>
                            Revoke
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
