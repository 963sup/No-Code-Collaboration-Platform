import { buttonVariants } from '@no-code-collaboration-platform/ui';
import Link from 'next/link';

export default function RepositoryNotFound() {
  return (
    <div className='mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center space-y-4 text-center'>
      <p className='text-sm font-medium text-muted-foreground'>Repository unavailable</p>
      <h1 className='text-2xl font-semibold tracking-tight'>
        This collaboration container is not accessible.
      </h1>
      <p className='text-sm text-muted-foreground'>
        It may not exist, or the current actor may not have a Repository view capability. These
        cases intentionally share one response so the UI does not disclose hidden resources.
      </p>
      <Link className={buttonVariants()} href='/app'>
        Return to repositories
      </Link>
    </div>
  );
}
