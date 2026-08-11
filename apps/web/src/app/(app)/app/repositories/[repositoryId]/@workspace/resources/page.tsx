import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';

import { RepositoryResourceKindGrid } from '../../_components/repository-resource-kind-grid';
import { requireAccessibleRepository } from '../../_queries/get-accessible-repository';

interface RepositoryResourcesProps {
  readonly params: Promise<{ repositoryId: string }>;
}

export default async function RepositoryResources({ params }: RepositoryResourcesProps) {
  const { repositoryId } = await params;
  const repository = await requireAccessibleRepository(repositoryId);

  return (
    <div className='mx-auto max-w-5xl space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>
            {repository.name} contains collaboration resources under one stable authorization
            boundary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RepositoryResourceKindGrid />
        </CardContent>
      </Card>

      <Card className='border-dashed'>
        <CardHeader>
          <CardTitle>No resource projection yet</CardTitle>
          <CardDescription>
            This route is independently addressable without inventing data. A resource list appears
            only after an Application read model and its authorization tests exist.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
