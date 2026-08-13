import { ListRepositoryActivity } from '@no-code-collaboration-platform/application';
import { Card, CardContent, CardHeader, CardTitle } from '@no-code-collaboration-platform/ui';

import { createRequestServices } from '@/composition/create-request-services';

import { RepositoryShell } from '../_components/repository-shell';
import { requireAccessibleRepositoryRoute } from '../_queries/get-accessible-repository-route';

interface RepositoryActivityProps {
  readonly params: Promise<{ ownerSlug: string; repositorySlug: string }>;
}

export default async function RepositoryActivity({ params }: RepositoryActivityProps) {
  const { ownerSlug, repositorySlug } = await params;
  const route = await requireAccessibleRepositoryRoute(ownerSlug, repositorySlug);
  const { activityEventReader } = await createRequestServices();
  const events = await new ListRepositoryActivity(activityEventReader).execute({
    limit: 50,
    repositoryId: route.repository.id
  });

  return (
    <RepositoryShell
      ownerSlug={route.ownerSlug}
      repositoryName={route.repository.name}
      repositorySlug={route.repository.slug}
      visibility={route.repository.visibility}
    >
      <section className='space-y-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Activity</h1>
          <p className='text-sm text-muted-foreground'>Immutable Repository-scoped collaboration facts.</p>
        </div>

        {events.length === 0 ? (
          <Card className='border-dashed'>
            <CardContent className='py-8 text-sm text-muted-foreground'>
              No activity facts are visible yet.
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-3'>
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium'>{event.eventType}</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground'>
                  <p>{event.occurredAt}</p>
                  <p>
                    {event.subjectType} · {event.subjectId}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </RepositoryShell>
  );
}
