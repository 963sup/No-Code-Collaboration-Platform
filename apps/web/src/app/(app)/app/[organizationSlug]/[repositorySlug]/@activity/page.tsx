import { ListRepositoryActivity } from '@no-code-collaboration-platform/application';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';
import Link from 'next/link';

import { createRequestServices } from '@/composition/create-request-services';
import { repositoryActivityPath } from '@/routing/repository-routes';

import { RepositoryActivityList } from '../_components/repository-activity-list';
import { requireAccessibleRepositoryRoute } from '../_queries/get-accessible-repository-route';

interface RepositoryActivityProps {
  readonly params: Promise<{ organizationSlug: string; repositorySlug: string }>;
}

export default async function RepositoryActivity({ params }: RepositoryActivityProps) {
  const { organizationSlug, repositorySlug } = await params;
  const route = await requireAccessibleRepositoryRoute(organizationSlug, repositorySlug);
  const { activityEventReader } = await createRequestServices();
  const events = await new ListRepositoryActivity(activityEventReader).execute({
    limit: 5,
    repositoryId: route.repository.id
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Recent activity</CardTitle>
        <CardDescription>Immutable Repository facts, projected for quick context.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <RepositoryActivityList emptyMessage='No activity facts are visible yet.' events={events} />
        <Link className='text-sm font-medium underline-offset-4 hover:underline' href={repositoryActivityPath(route)}>
          View all activity
        </Link>
      </CardContent>
    </Card>
  );
}
