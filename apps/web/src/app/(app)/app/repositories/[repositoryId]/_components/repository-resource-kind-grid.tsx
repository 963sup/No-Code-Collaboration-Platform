import { FileText, ListTodo, TableProperties, Workflow } from 'lucide-react';

const resourceKinds = [
  {
    description: 'Structured knowledge and collaborative writing.',
    icon: FileText,
    label: 'Document'
  },
  {
    description: 'User-defined records with explicit fields and views.',
    icon: TableProperties,
    label: 'Collection'
  },
  {
    description: 'Trackable work with ownership, state, and due dates.',
    icon: ListTodo,
    label: 'Task'
  },
  {
    description: 'Event-driven automation with observable runs.',
    icon: Workflow,
    label: 'Workflow'
  }
] as const;

export function RepositoryResourceKindGrid() {
  return (
    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      {resourceKinds.map(({ description, icon: Icon, label }) => (
        <div className='rounded-lg border border-dashed p-4' key={label}>
          <Icon aria-hidden='true' className='mb-3 size-5 text-muted-foreground' />
          <p className='text-sm font-medium'>{label}</p>
          <p className='mt-1 text-xs text-muted-foreground'>{description}</p>
        </div>
      ))}
    </div>
  );
}
