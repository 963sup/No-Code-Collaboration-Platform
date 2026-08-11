import { ListRepositoryActivity } from '@no-code-collaboration-platform/application';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';

import { createRequestServices } from '@/composition/create-request-services';

import { requireAccessibleRepository } from '../_queries/get-accessible-repository';

interface RepositoryActivityProps {
  readonly params: Promise<{ repositoryId: string }>;
}

function activityLabel(event: {
  readonly eventType: string;
  readonly payload: Readonly<Record<string, unknown>>;
}) {
  const title = typeof event.payload.title === 'string' ? ` “${event.payload.title}”` : '';

  switch (event.eventType) {
    case 'repository.created':
      return `Repository${title} created`;
    case 'resource.created':
      return `Page${title} created`;
    case 'resource.updated':
      return `Page${title} updated`;
    default:
      return event.eventType;
  }
}

export default async function RepositoryActivity({ params }: RepositoryActivityProps) {
  const { repositoryId } = await params;
  const repository = await requireAccessibleRepository(repositoryId);
  const { activityEventReader } = await createRequestServices();
  const events = await new ListRepositoryActivity(activityEventReader).execute({
    repositoryId: repository.id
  });

  return (
    <Card id='activity'>
      <CardHeader>
        <CardTitle className='text-base'>Activity</CardTitle>
        <CardDescription>
          This projection is rebuilt from immutable Repository-scoped historical facts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No activity facts are visible yet.</p>
        ) : (
          <ol className='space-y-3'>
            {events.map((event) => (
              <li className='border-l-2 pl-3 text-sm' key={event.id}>
                <p className='font-medium'>{activityLabel(event)}</p>
                <time className='text-xs text-muted-foreground' dateTime={event.occurredAt}>
                  {new Date(event.occurredAt).toLocaleString('en-US', { timeZone: 'UTC' })} UTC
                </time>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
