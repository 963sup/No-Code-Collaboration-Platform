import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';

import { requireAccessibleRepository } from '../_queries/get-accessible-repository';

interface RepositoryContextProps {
  readonly params: Promise<{ repositoryId: string }>;
}

export default async function RepositoryContext({ params }: RepositoryContextProps) {
  const { repositoryId } = await params;
  const repository = await requireAccessibleRepository(repositoryId);

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
            <dt className='text-muted-foreground'>Slug</dt>
            <dd className='mt-1 font-medium'>{repository.slug}</dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>Visibility</dt>
            <dd className='mt-1 font-medium capitalize'>{repository.visibility}</dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>Ownership boundary</dt>
            <dd className='mt-1 break-all font-mono text-xs'>{repository.organizationId}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
