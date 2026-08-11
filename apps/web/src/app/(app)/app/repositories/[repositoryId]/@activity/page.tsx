import { Card, CardDescription, CardHeader, CardTitle } from '@no-code-collaboration-platform/ui';

import { requireAccessibleRepository } from '../_queries/get-accessible-repository';

interface RepositoryActivityProps {
  readonly params: Promise<{ repositoryId: string }>;
}

export default async function RepositoryActivity({ params }: RepositoryActivityProps) {
  const { repositoryId } = await params;
  await requireAccessibleRepository(repositoryId);

  return (
    <Card id='activity'>
      <CardHeader>
        <CardTitle className='text-base'>Activity</CardTitle>
        <CardDescription>
          No activity projection is loaded yet. This surface will render immutable event facts, not
          infer history from current state.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
