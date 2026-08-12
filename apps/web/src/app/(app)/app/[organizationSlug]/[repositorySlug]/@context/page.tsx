import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';

import { requireAccessibleRepositoryRoute } from '../_queries/get-accessible-repository-route';

interface RepositoryContextProps {
  readonly params: Promise<{ organizationSlug: string; repositorySlug: string }>;
}

export default async function RepositoryContext({ params }: RepositoryContextProps) {
  const { organizationSlug, repositorySlug } = await params;
  const route = await requireAccessibleRepositoryRoute(organizationSlug, repositorySlug);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Repository context</CardTitle>
        <CardDescription>
          Presentation context explains scope; it never changes authorization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className='space-y-4 text-sm'>
          <div>
            <dt className='text-muted-foreground'>Organization</dt>
            <dd className='mt-1 font-medium'>{route.organizationSlug}</dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>Repository</dt>
            <dd className='mt-1 font-medium'>{route.repository.slug}</dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>Visibility</dt>
            <dd className='mt-1 font-medium capitalize'>{route.repository.visibility}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
