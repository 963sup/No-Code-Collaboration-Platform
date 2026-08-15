import { Button, Input } from '@no-code-collaboration-platform/ui';

import { IssueDetailView } from '../../_components/issue-detail';
import { requireAccessibleIssueRoute } from '../../_queries/get-accessible-issue';
import { updateIssueAction } from '../actions';

interface RepositoryIssueDetailProps {
  readonly params: Promise<{
    issueNumber: string;
    ownerSlug: string;
    repositorySlug: string;
  }>;
}

export default async function RepositoryIssueDetail({ params }: RepositoryIssueDetailProps) {
  const { issueNumber, ownerSlug, repositorySlug } = await params;
  const { issue } = await requireAccessibleIssueRoute(ownerSlug, repositorySlug, issueNumber);
  const action = updateIssueAction.bind(null, ownerSlug, repositorySlug, issueNumber);

  return (
    <div className='space-y-6'>
      <IssueDetailView issue={issue} showMetadata />

      <section aria-labelledby='issue-actions' className='grid gap-4 lg:grid-cols-2'>
        <h2 className='sr-only' id='issue-actions'>
          Issue actions
        </h2>
        <form action={action} className='space-y-3 rounded-xl border bg-card p-4'>
          <h3 className='font-semibold'>Add comment</h3>
          <input name='expectedVersion' type='hidden' value={issue.version} />
          <input name='intent' type='hidden' value='comment' />
          <textarea
            className='min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm'
            name='body'
            required
          />
          <Button type='submit'>Comment</Button>
        </form>

        <details className='rounded-xl border bg-card p-4'>
          <summary className='cursor-pointer font-semibold'>Edit issue</summary>
          <form action={action} className='mt-3 space-y-3'>
            <input name='expectedVersion' type='hidden' value={issue.version} />
            <input name='intent' type='hidden' value='edit' />
            <Input defaultValue={issue.title} maxLength={240} name='title' required />
            <textarea
              className='min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm'
              defaultValue={issue.body}
              name='body'
            />
            <Button type='submit' variant='outline'>
              Save changes
            </Button>
          </form>
        </details>

        <form
          action={action}
          className='flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4'
        >
          <input name='expectedVersion' type='hidden' value={issue.version} />
          {issue.status === 'open' ? (
            <>
              <label className='grid gap-1 text-sm'>
                Close reason
                <select
                  className='h-9 rounded-md border bg-background px-3'
                  defaultValue='completed'
                  name='closeReason'
                >
                  <option value='completed'>Completed</option>
                  <option value='cancelled'>Cancelled</option>
                </select>
              </label>
              <Button name='intent' type='submit' value='close' variant='outline'>
                Close issue
              </Button>
            </>
          ) : (
            <Button name='intent' type='submit' value='reopen' variant='outline'>
              Reopen issue
            </Button>
          )}
        </form>

        <details className='rounded-xl border bg-card p-4'>
          <summary className='cursor-pointer font-semibold'>Relationships</summary>
          <div className='mt-3 grid gap-4'>
            <form action={action} className='flex flex-wrap items-end gap-2'>
              <input name='expectedVersion' type='hidden' value={issue.version} />
              <label className='grid min-w-64 flex-1 gap-1 text-sm'>
                Assignee User ID
                <Input name='assigneeId' placeholder='User UUID' required />
              </label>
              <Button name='intent' type='submit' value='assign' variant='outline'>
                Assign
              </Button>
              <Button name='intent' type='submit' value='unassign' variant='outline'>
                Unassign
              </Button>
            </form>
            <form action={action} className='flex flex-wrap items-end gap-2'>
              <input name='expectedVersion' type='hidden' value={issue.version} />
              <label className='grid min-w-64 flex-1 gap-1 text-sm'>
                Repository label ID
                <Input name='labelId' placeholder='Label UUID' required />
              </label>
              <Button name='intent' type='submit' value='label' variant='outline'>
                Add label
              </Button>
              <Button name='intent' type='submit' value='unlabel' variant='outline'>
                Remove label
              </Button>
            </form>
            <p className='text-xs text-muted-foreground'>
              Assignment records responsibility only; it never grants Repository access.
            </p>
          </div>
        </details>
      </section>
    </div>
  );
}
