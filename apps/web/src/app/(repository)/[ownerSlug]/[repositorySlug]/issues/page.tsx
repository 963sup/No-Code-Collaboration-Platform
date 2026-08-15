import { ListAccessibleIssues } from '@no-code-collaboration-platform/application';
import {
  Button,
  Card,
  CardContent,
  Input,
  buttonVariants
} from '@no-code-collaboration-platform/ui';
import { CircleDot, Search } from 'lucide-react';
import Link from 'next/link';

import { createRequestServices } from '@/composition/create-request-services';
import { repositoryIssuePath, repositoryIssuesPath } from '@/routing/repository-routes';

import { IssueState } from '../_components/issue-state';
import { requireAccessibleRepositoryRoute } from '../_queries/get-accessible-repository-route';
import { createIssueAction } from './actions';

interface RepositoryIssuesProps {
  readonly params: Promise<{ ownerSlug: string; repositorySlug: string }>;
  readonly searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}

function issuesQueryPath(
  basePath: string,
  current: { readonly q: string; readonly status: string },
  changes: { readonly page?: number; readonly status?: string }
) {
  const query = new URLSearchParams();
  if (current.q) query.set('q', current.q);
  const status = changes.status ?? current.status;
  if (status !== 'open') query.set('status', status);
  if (changes.page && changes.page > 1) query.set('page', changes.page.toString());
  const value = query.toString();
  return value ? `${basePath}?${value}` : basePath;
}

export default async function RepositoryIssues({ params, searchParams }: RepositoryIssuesProps) {
  const { ownerSlug, repositorySlug } = await params;
  const route = await requireAccessibleRepositoryRoute(ownerSlug, repositorySlug);
  const requested = await searchParams;
  const requestedPage = Number(requested.page ?? '1');
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const q = requested.q?.trim() ?? '';
  const status =
    requested.status === 'all' || requested.status === 'closed' ? requested.status : 'open';
  const services = await createRequestServices();
  const collection = await new ListAccessibleIssues(services.issueReader).execute({
    page,
    query: q,
    repositoryId: route.repository.id,
    status
  });
  const basePath = repositoryIssuesPath(route);
  const currentPage = page;
  const lastPage = Math.max(1, Math.ceil(collection.total / 25));

  return (
    <section className='space-y-4'>
      <header className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>All issues</h1>
          <p className='text-sm text-muted-foreground'>Actionable work in this Repository.</p>
        </div>
        <details className='rounded-md border bg-card px-3 py-2'>
          <summary className='cursor-pointer text-sm font-semibold'>New issue</summary>
          <form
            action={createIssueAction.bind(null, ownerSlug, repositorySlug)}
            className='mt-3 grid min-w-[min(32rem,75vw)] gap-3'
          >
            <Input maxLength={240} name='title' placeholder='Issue title' required />
            <textarea
              className='min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm'
              name='body'
              placeholder='Describe the actionable work'
            />
            <Button className='justify-self-end' type='submit'>
              Create issue
            </Button>
          </form>
        </details>
      </header>

      <form action={basePath} className='flex gap-2' method='get' role='search'>
        {status !== 'open' ? <input name='status' type='hidden' value={status} /> : null}
        <Input aria-label='Search issues' defaultValue={q} name='q' placeholder='Search issues' />
        <Button aria-label='Submit issue search' size='icon' type='submit' variant='outline'>
          <Search aria-hidden='true' className='size-4' />
        </Button>
      </form>

      <Card className='overflow-hidden py-0'>
        <div className='flex min-h-12 items-center gap-1 border-b bg-muted/40 px-3'>
          {(['open', 'closed', 'all'] as const).map((item) => (
            <Link
              aria-current={status === item ? 'page' : undefined}
              className={
                status === item
                  ? 'rounded-md bg-background px-3 py-1.5 text-sm font-semibold shadow-xs'
                  : 'rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground'
              }
              href={issuesQueryPath(basePath, { q, status }, { status: item })}
              key={item}
            >
              {item[0]?.toUpperCase()}
              {item.slice(1)}
            </Link>
          ))}
        </div>

        {collection.issues.length === 0 ? (
          <CardContent className='flex min-h-36 flex-col items-center justify-center gap-2 text-center'>
            <CircleDot aria-hidden='true' className='size-7 text-muted-foreground' />
            <p className='font-medium'>No issues match this view</p>
            <p className='text-sm text-muted-foreground'>Adjust the search or status filter.</p>
          </CardContent>
        ) : (
          <ul className='divide-y'>
            {collection.issues.map((issue) => (
              <li className='px-4 py-3' key={issue.id}>
                <div className='flex items-start gap-3'>
                  <span
                    aria-label={issue.status}
                    className={
                      issue.status === 'open' ? 'mt-1 text-emerald-600' : 'mt-1 text-violet-600'
                    }
                  >
                    <CircleDot aria-hidden='true' className='size-4' />
                  </span>
                  <div className='min-w-0 flex-1'>
                    <Link
                      className='font-semibold hover:text-link hover:underline'
                      href={repositoryIssuePath(route, issue.issueNumber)}
                    >
                      {issue.title}
                    </Link>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      #{issue.issueNumber} updated{' '}
                      <time dateTime={issue.updatedAt}>
                        {new Date(issue.updatedAt).toLocaleDateString()}
                      </time>
                    </p>
                  </div>
                  <IssueState status={issue.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {lastPage > 1 ? (
        <nav aria-label='Issue pagination' className='flex justify-center gap-2'>
          {currentPage > 1 ? (
            <Link
              className={buttonVariants({ variant: 'outline' })}
              href={issuesQueryPath(basePath, { q, status }, { page: currentPage - 1 })}
            >
              Previous
            </Link>
          ) : (
            <Button disabled variant='outline'>
              Previous
            </Button>
          )}
          {currentPage < lastPage ? (
            <Link
              className={buttonVariants({ variant: 'outline' })}
              href={issuesQueryPath(basePath, { q, status }, { page: currentPage + 1 })}
            >
              Next
            </Link>
          ) : (
            <Button disabled variant='outline'>
              Next
            </Button>
          )}
        </nav>
      ) : null}
    </section>
  );
}
