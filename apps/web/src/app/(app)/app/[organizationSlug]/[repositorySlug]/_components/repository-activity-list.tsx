interface ActivityListItem {
  readonly eventType: string;
  readonly id: number;
  readonly occurredAt: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

function activityLabel(event: ActivityListItem) {
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

interface RepositoryActivityListProps {
  readonly emptyMessage: string;
  readonly events: readonly ActivityListItem[];
}

export function RepositoryActivityList({ emptyMessage, events }: RepositoryActivityListProps) {
  if (events.length === 0) {
    return <p className='text-sm text-muted-foreground'>{emptyMessage}</p>;
  }

  return (
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
  );
}
