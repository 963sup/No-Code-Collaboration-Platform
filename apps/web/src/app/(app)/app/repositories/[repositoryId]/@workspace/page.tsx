import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';
import { FileText, ListTodo, TableProperties, Workflow } from 'lucide-react';

import { requireAccessibleRepository } from '../_queries/get-accessible-repository';

interface RepositoryWorkspaceProps {
  readonly params: Promise<{ repositoryId: string }>;
}

const resourceKinds = [
  { icon: FileText, label: 'Document' },
  { icon: TableProperties, label: 'Collection' },
  { icon: ListTodo, label: 'Task' },
  { icon: Workflow, label: 'Workflow' }
] as const;

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
        <CardContent className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4' id='resources'>
          {resourceKinds.map(({ icon: Icon, label }) => (
            <div className='rounded-lg border border-dashed p-4' key={label}>
              <Icon aria-hidden='true' className='mb-3 size-5 text-muted-foreground' />
              <p className='text-sm font-medium'>{label}</p>
              <p className='mt-1 text-xs text-muted-foreground'>No read model loaded yet.</p>
            </div>
          ))}
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
