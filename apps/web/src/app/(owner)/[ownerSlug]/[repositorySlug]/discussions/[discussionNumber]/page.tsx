import { GetAccessibleDiscussion } from '@no-code-collaboration-platform/application';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input
} from '@no-code-collaboration-platform/ui';
import { notFound } from 'next/navigation';

import { SurfaceFrame } from '@/components/surface-frame';
import { createRequestServices } from '@/composition/create-request-services';

import { requireAccessibleRepositoryRoute } from '../../_queries/get-accessible-repository-route';
import { updateDiscussionAction } from '../actions';

export default async function DiscussionDetailPage({
  params
}: {
  readonly params: Promise<{ discussionNumber: string; ownerSlug: string; repositorySlug: string }>;
}) {
  const address = await params;
  const route = await requireAccessibleRepositoryRoute(address.ownerSlug, address.repositorySlug);
  const services = await createRequestServices();
  const discussion = await new GetAccessibleDiscussion(services.discussionReader).execute({
    discussionNumber: Number(address.discussionNumber),
    repositoryId: route.repository.id
  });
  if (!discussion) notFound();
  const action = updateDiscussionAction.bind(
    null,
    address.ownerSlug,
    address.repositorySlug,
    address.discussionNumber
  );
  return (
    <SurfaceFrame
      availability='live'
      description='Repository-contained shared understanding. Answer selection is valid only for question Discussions.'
      title={`${discussion.title} #${discussion.discussionNumber}`}
    >
      <div className='space-y-4'>
        <div className='flex flex-wrap gap-2'>
          <Badge variant='outline'>{discussion.category}</Badge>
          <Badge variant='outline'>{discussion.status}</Badge>
          {discussion.isLocked ? <Badge variant='deferred'>locked</Badge> : null}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Opening context</CardTitle>
          </CardHeader>
          <CardContent className='whitespace-pre-wrap text-sm'>
            {discussion.body || 'No description was provided.'}
          </CardContent>
        </Card>
        {discussion.comments.map((comment) => (
          <Card className={comment.isAnswer ? 'border-emerald-500' : undefined} key={comment.id}>
            <CardHeader className='flex-row items-center justify-between'>
              <CardTitle className='text-sm'>Comment</CardTitle>
              {comment.isAnswer ? <Badge>Answer</Badge> : null}
            </CardHeader>
            <CardContent className='space-y-3'>
              <p className='whitespace-pre-wrap text-sm'>{comment.body}</p>
              {discussion.category === 'question' && !comment.isAnswer ? (
                <form action={action}>
                  <input name='commentId' type='hidden' value={comment.id} />
                  <input name='expectedVersion' type='hidden' value={discussion.version} />
                  <Button
                    name='intent'
                    size='sm'
                    type='submit'
                    value='select-answer'
                    variant='outline'
                  >
                    Select answer
                  </Button>
                </form>
              ) : null}
            </CardContent>
          </Card>
        ))}
        <section aria-labelledby='discussion-actions' className='grid gap-4 lg:grid-cols-2'>
          <h2 className='sr-only' id='discussion-actions'>
            Discussion actions
          </h2>
          {discussion.status === 'open' && !discussion.isLocked ? (
            <form action={action} className='space-y-3 rounded-xl border bg-card p-4'>
              <h3 className='font-semibold'>Add comment</h3>
              <input name='expectedVersion' type='hidden' value={discussion.version} />
              <input name='intent' type='hidden' value='comment' />
              <textarea
                className='min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm'
                name='body'
                required
              />
              <Button type='submit'>Comment</Button>
            </form>
          ) : (
            <p className='rounded-xl border border-dashed p-4 text-sm text-muted-foreground'>
              New comments are unavailable while this Discussion is{' '}
              {discussion.isLocked ? 'locked' : 'closed'}.
            </p>
          )}
          <details className='rounded-xl border bg-card p-4'>
            <summary className='cursor-pointer font-semibold'>Edit Discussion</summary>
            <form action={action} className='mt-3 space-y-3'>
              <input name='expectedVersion' type='hidden' value={discussion.version} />
              <input name='intent' type='hidden' value='edit' />
              <Input defaultValue={discussion.title} maxLength={240} name='title' required />
              <textarea
                className='min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm'
                defaultValue={discussion.body}
                name='body'
              />
              <Button type='submit' variant='outline'>
                Save changes
              </Button>
            </form>
          </details>
          <form action={action} className='flex flex-wrap gap-2 rounded-xl border bg-card p-4'>
            <input name='expectedVersion' type='hidden' value={discussion.version} />
            <Button
              name='intent'
              type='submit'
              value={discussion.status === 'open' ? 'close' : 'reopen'}
              variant='outline'
            >
              {discussion.status === 'open' ? 'Close' : 'Reopen'}
            </Button>
            <Button
              name='intent'
              type='submit'
              value={discussion.isLocked ? 'unlock' : 'lock'}
              variant='outline'
            >
              {discussion.isLocked ? 'Unlock' : 'Lock'}
            </Button>
            {discussion.answerCommentId ? (
              <Button name='intent' type='submit' value='clear-answer' variant='outline'>
                Clear answer
              </Button>
            ) : null}
          </form>
        </section>
      </div>
    </SurfaceFrame>
  );
}
