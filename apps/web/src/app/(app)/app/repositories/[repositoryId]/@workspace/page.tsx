import {
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';
import Link from 'next/link';

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
            {repository.name} is the stable collaboration boundary. Pages are its first accepted
            collaborative Resource kind.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            className={buttonVariants()}
            href={`/app/repositories/${repository.id}/resources`}
          >
            Open Pages
          </Link>
        </CardContent>
      </Card>

      <Card className='border-dashed'>
        <CardHeader>
          <CardTitle>First executable work unit</CardTitle>
          <CardDescription>
            Page creation, reading, updating, Repository authority, optimistic concurrency, and
            immutable activity facts now form one verified collaboration loop. Additional Resource
            kinds remain deferred until they prove distinct behavior and lifecycle requirements.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
