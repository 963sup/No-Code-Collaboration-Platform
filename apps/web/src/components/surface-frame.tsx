import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator
} from '@no-code-collaboration-platform/ui';
import { CircleDashed, Info } from 'lucide-react';
import type { ReactNode } from 'react';

import type { SurfaceAvailability } from '@/routing/surface-definitions';

interface SurfaceFrameProps {
  readonly title: string;
  readonly description: string;
  readonly availability: SurfaceAvailability;
  readonly children?: ReactNode;
  readonly controls?: ReactNode;
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
}

export function SurfaceFrame({
  title,
  description,
  availability,
  children,
  controls,
  emptyTitle = 'No available data',
  emptyDescription = 'This surface does not fabricate rows while its provider-neutral read contract is not live.'
}: SurfaceFrameProps) {
  return (
    <div className='mx-auto max-w-6xl space-y-6'>
      <header className='space-y-3'>
        <div className='flex flex-wrap items-center gap-3'>
          <h1 className='text-3xl font-semibold tracking-tight'>{title}</h1>
          <Badge variant={availability === 'live' ? 'outline' : availability}>{availability}</Badge>
        </div>
        <p className='max-w-3xl text-muted-foreground'>{description}</p>
      </header>
      {availability === 'live' ? null : (
        <div className='flex gap-3 rounded-lg border border-dashed bg-muted/30 p-4 text-sm'>
          <Info aria-hidden='true' className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
          <p>
            <span className='font-medium capitalize'>{availability}</span> exposes responsive
            composition, URL state, and control intent only. It never simulates authorization,
            persisted data, or a successful mutation.
          </p>
        </div>
      )}
      {controls ? (
        <Card>
          <CardContent className='p-4'>{controls}</CardContent>
        </Card>
      ) : null}
      <Separator />
      {children ?? (
        <Card className='border-dashed'>
          <CardHeader className='items-start'>
            <CircleDashed aria-hidden='true' className='size-5 text-muted-foreground' />
            <CardTitle className='pt-2 text-lg'>{emptyTitle}</CardTitle>
            <CardDescription>{emptyDescription}</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
