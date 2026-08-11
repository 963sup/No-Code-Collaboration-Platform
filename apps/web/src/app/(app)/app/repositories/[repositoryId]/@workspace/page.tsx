import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';

import { RepositoryResourceKindGrid } from '../_components/repository-resource-kind-grid';
import { requireAccessibleRepository } from '../_queries/get-accessible-repository';

interface RepositoryWorkspaceProps {
  readonly params: Promise<{ repositoryId: string }>;
}

export default async function RepositoryWorkspace({ params }: RepositoryWorkspaceProps) {
  const { repositoryId } = await params;
  const repository = await requireAccessibleRepository(repositoryId);

  return (
    <div className='mx-auto max-w-5xl space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Repository workspace</CardTitle>
          <CardDescription>
            {repository.name} is the stable collaboration boundary. Resource capabilities can evolve
            without changing its identity.
          </CardDescription>
        </CardHeader>
        <CardContent id='resources'>
          <RepositoryResourceKindGrid />
        </CardContent>
      </Card>

      <Card className='border-dashed'>
        <CardHeader>
          <CardTitle>Minimum sufficient surface</CardTitle>
          <CardDescription>
            This slot intentionally contains no fabricated resources. The next vertical slice must
            add a real Application query, an authorization rule, and a discriminating test before a
            resource type appears here.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
