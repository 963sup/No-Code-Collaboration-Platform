import { GetAccessiblePage } from '@no-code-collaboration-platform/application';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label
} from '@no-code-collaboration-platform/ui';
import { notFound } from 'next/navigation';

import { createRequestServices } from '@/composition/create-request-services';

import { requireAccessibleRepository } from '../../../_queries/get-accessible-repository';
import { updatePage } from '../actions';

interface PageWorkspaceProps {
  readonly params: Promise<{ pageId: string; repositoryId: string }>;
  readonly searchParams: Promise<{ error?: string; saved?: string }>;
}

const errorMessages = {
  forbidden: 'Your current Repository authority does not allow Page updates.',
  'invalid-page': 'The Page title or update evidence is invalid.',
  'provider-unavailable': 'The Page could not be saved. No change was reported as successful.',
  'state-changed': 'The Page or its authority changed after loading. Refresh before saving again.'
} as const;

export default async function PageWorkspace({ params, searchParams }: PageWorkspaceProps) {
  const [{ pageId, repositoryId }, parameters] = await Promise.all([params, searchParams]);
  const repository = await requireAccessibleRepository(repositoryId);
  const { pageReader } = await createRequestServices();
  const page = await new GetAccessiblePage(pageReader).execute({
    pageId,
    repositoryId: repository.id
  });
  if (page === null) notFound();

  const error = parameters.error as keyof typeof errorMessages | undefined;
  const message = error ? errorMessages[error] : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Page</CardTitle>
        <CardDescription>
          Saving checks Repository authority again, uses optimistic concurrency evidence, and
          records an immutable Resource update fact in the same transaction.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updatePage} className='space-y-5'>
          <input name='expectedUpdatedAt' type='hidden' value={page.updatedAt} />
          <input name='pageId' type='hidden' value={page.id} />
          <input name='repositoryId' type='hidden' value={repository.id} />
          <div className='space-y-2'>
            <Label htmlFor='page-title'>Title</Label>
            <Input
              defaultValue={page.title}
              id='page-title'
              maxLength={240}
              name='title'
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='page-body'>Content</Label>
            <textarea
              className='min-h-72 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring'
              defaultValue={page.content.body}
              id='page-body'
              name='body'
            />
          </div>
          {message ? (
            <p aria-live='polite' className='text-sm text-destructive' role='alert'>
              {message}
            </p>
          ) : null}
          {parameters.saved === '1' ? (
            <p aria-live='polite' className='text-sm text-muted-foreground'>
              Page saved.
            </p>
          ) : null}
          <Button type='submit'>Save Page</Button>
        </form>
      </CardContent>
    </Card>
  );
}
