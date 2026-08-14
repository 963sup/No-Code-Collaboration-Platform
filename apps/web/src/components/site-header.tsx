import { Boxes } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface SiteHeaderProps {
  readonly actions?: ReactNode;
  readonly homeHref: string;
}

export function SiteHeader({ actions, homeHref }: SiteHeaderProps) {
  return (
    <header className='border-b border-shell-border bg-shell text-shell-foreground'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8'>
        <Link
          aria-label='No-Code Collaboration Platform home'
          className='flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-shell-ring'
          href={homeHref}
        >
          <span className='flex size-8 shrink-0 items-center justify-center rounded-full bg-shell-foreground text-shell'>
            <Boxes aria-hidden='true' className='size-5' />
          </span>
          <span className='hidden truncate text-sm font-semibold tracking-tight sm:inline'>
            No-Code Collaboration
          </span>
        </Link>
        {actions ? <div className='flex min-w-0 items-center gap-2 sm:gap-3'>{actions}</div> : null}
      </div>
    </header>
  );
}
