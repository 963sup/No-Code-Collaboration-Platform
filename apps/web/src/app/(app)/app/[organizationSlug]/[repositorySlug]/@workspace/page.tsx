import {
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';
import Link from 'next/link';

import { repositoryPagesPath } from '@/routing/repository-routes';

import { requireAccessibleRepositoryRoute } from '../_queries/get-accessible-repository-route';

interface RepositoryWorkspaceProps {
  readonly params: Promise<{ organizationSlug: string; repositorySlug: string }>;
}

export default async function RepositoryWorkspace({ params }: RepositoryWorkspaceProps) {
  const { organizationSlug, repositorySlug } = await params;
  const route = await requireAccessibleRepositoryRoute(organizationSlug, repositorySlug);

  return (
    <div className='mx-auto max-w-5xl space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Repository overview</CardTitle>
          <CardDescription>
            {route.repository.name} is the stable collaboration boundary. Pages are its first
            accepted collaborative Resource kind.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link className={buttonVariants()} href={repositoryPagesPath(route)}>
            Open Pages
          </Link>
        </CardContent>
      </Card>

      <Card className='border-dashed'>
        <CardHeader>
          <CardTitle>First executable work unit</CardTitle>
          <CardDescription>
            Page creation, reading, updating, Repository authority, optimistic concurrency, and
            immutable activity facts form one verified collaboration loop. Additional Resource kinds
            remain deferred until they prove distinct behavior and lifecycle requirements.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
