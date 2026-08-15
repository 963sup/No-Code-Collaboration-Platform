import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';
import Link from 'next/link';

export interface ProjectionListItem {
  readonly description?: string;
  readonly href: string;
  readonly id: string;
  readonly metadata?: string;
  readonly title: string;
  readonly type?: string;
}

export function ProjectionList({ items }: { readonly items: readonly ProjectionListItem[] }) {
  return (
    <ul className='grid gap-3'>
      {items.map((item) => (
        <li key={`${item.type ?? 'item'}:${item.id}`}>
          <Link
            className='block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring'
            href={item.href}
          >
            <Card className='transition-colors hover:bg-accent/30'>
              <CardHeader className='gap-2'>
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <CardTitle className='text-lg'>{item.title}</CardTitle>
                  {item.type ? <Badge variant='outline'>{item.type}</Badge> : null}
                </div>
                {item.metadata ? (
                  <p className='text-xs text-muted-foreground'>{item.metadata}</p>
                ) : null}
              </CardHeader>
              {item.description ? (
                <CardContent className='line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground'>
                  {item.description}
                </CardContent>
              ) : null}
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
