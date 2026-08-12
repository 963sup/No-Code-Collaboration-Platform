import { ListRepositoryActivity } from '@no-code-collaboration-platform/application';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';

import { createRequestServices } from '@/composition/create-request-services';

import { RepositoryActivityList } from '../../_components/repository-activity-list';
import { requireAccessibleRepositoryRoute } from '../../_queries/get-accessible-repository-route';

interface RepositoryActivityPageProps {
  readonly params: Promise<{ organizationSlug: string; repositorySlug: string }>;
}

export default async function RepositoryActivityPage({ params }: RepositoryActivityPageProps) {
  const { organizationSlug, repositorySlug } = await params;
  const route = await requireAccessibleRepositoryRoute(organizationSlug, repositorySlug);
  const { activityEventReader } = await createRequestServices();
  const events = await new ListRepositoryActivity(activityEventReader).execute({
    limit: 50,
    repositoryId: route.repository.id
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>
          Repository activity is a projection of immutable historical facts, not a second source of
          truth.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RepositoryActivityList emptyMessage='No activity facts are visible yet.' events={events} />
      </CardContent>
    </Card>
  );
}
