import { Card, CardContent, Skeleton } from '@no-code-collaboration-platform/ui';

export function SurfaceLoading() {
  return (
    <div className='mx-auto max-w-6xl space-y-6' aria-label='Loading surface'>
      <Skeleton className='h-9 w-56' />
      <Skeleton className='h-5 w-full max-w-xl' />
      <Card>
        <CardContent className='grid gap-3 p-4 sm:grid-cols-3'>
          <Skeleton className='h-9' />
          <Skeleton className='h-9' />
          <Skeleton className='h-9' />
        </CardContent>
      </Card>
      <Skeleton className='h-48 w-full' />
    </div>
  );
}
