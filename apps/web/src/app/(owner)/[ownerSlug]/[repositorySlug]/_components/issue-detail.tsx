import type { IssueDetail } from '@no-code-collaboration-platform/application';
import { Badge, Card, CardContent, CardHeader } from '@no-code-collaboration-platform/ui';

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
          Opened by {issue.createdBy}
        </CardHeader>
        <CardContent className='min-h-40 whitespace-pre-wrap py-5 text-sm leading-6'>
          {issue.body || 'No description was provided.'}
        </CardContent>
      </Card>

      {issue.labels.length || issue.assignees.length ? (
        <div className='flex flex-wrap gap-2'>
          {issue.labels.map((label) => (
            <Badge key={label.id} variant='outline'>
              {label.name}
            </Badge>
          ))}
          {issue.assignees.map((assignee) => (
            <Badge key={assignee.id} variant='secondary'>
              Assigned {assignee.id}
            </Badge>
          ))}
        </div>
      ) : null}

      <section aria-labelledby='issue-conversation' className='space-y-3'>
        <h2 className='text-lg font-semibold' id='issue-conversation'>
          Conversation
        </h2>
        {issue.comments.length === 0 ? (
          <p className='rounded-md border border-dashed p-4 text-sm text-muted-foreground'>
            No comments yet.
          </p>
        ) : (
          issue.comments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader className='border-b py-3 text-xs text-muted-foreground'>
                {comment.createdBy} commented on{' '}
                <time dateTime={comment.createdAt}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </time>
              </CardHeader>
              <CardContent className='whitespace-pre-wrap py-5 text-sm'>{comment.body}</CardContent>
            </Card>
          ))
        )}
      </section>
    </article>
  );
}

export { IssueMetadata };
