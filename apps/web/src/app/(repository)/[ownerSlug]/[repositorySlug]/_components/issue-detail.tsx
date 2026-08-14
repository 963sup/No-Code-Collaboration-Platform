import type { IssueDetail } from '@no-code-collaboration-platform/application';
import { Card, CardContent, CardHeader } from '@no-code-collaboration-platform/ui';

import { IssueState } from './issue-state';

interface IssueDetailProps {
  readonly issue: IssueDetail;
  readonly showMetadata?: boolean;
}

function IssueMetadata({ issue }: { readonly issue: IssueDetail }) {
  return (
    <dl className='grid gap-4 text-sm sm:grid-cols-3'>
      <div>
        <dt className='font-medium text-muted-foreground'>Status</dt>
        <dd className='mt-1 capitalize'>{issue.status}</dd>
      </div>
      <div>
        <dt className='font-medium text-muted-foreground'>Issue</dt>
        <dd className='mt-1'>#{issue.issueNumber}</dd>
      </div>
      <div>
        <dt className='font-medium text-muted-foreground'>Updated</dt>
        <dd className='mt-1'>
          <time dateTime={issue.updatedAt}>{new Date(issue.updatedAt).toLocaleDateString()}</time>
        </dd>
      </div>
    </dl>
  );
}

export function IssueDetailView({ issue, showMetadata = false }: IssueDetailProps) {
  return (
    <article className='space-y-5'>
      <header className='space-y-3 border-b pb-5'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <h1 className='min-w-0 text-2xl font-semibold tracking-tight sm:text-3xl'>
            {issue.title}{' '}
            <span className='font-light text-muted-foreground'>#{issue.issueNumber}</span>
          </h1>
          <IssueState status={issue.status} />
        </div>
        <p className='text-sm text-muted-foreground'>
          Opened{' '}
          <time dateTime={issue.createdAt}>{new Date(issue.createdAt).toLocaleDateString()}</time>
        </p>
      </header>

      {showMetadata ? (
        <Card className='md:hidden'>
          <CardContent>
            <IssueMetadata issue={issue} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className='border-b py-3 text-xs text-muted-foreground'>
          Collaborator opened this Issue
        </CardHeader>
        <CardContent className='min-h-40 whitespace-pre-wrap py-5 text-sm leading-6'>
          {issue.body || 'No description was provided.'}
        </CardContent>
      </Card>

      <div className='rounded-md border border-dashed p-4 text-sm text-muted-foreground'>
        Conversation commands remain unavailable until comment attribution, moderation, and evidence
        contracts are executable.
      </div>
    </article>
  );
}

export { IssueMetadata };
