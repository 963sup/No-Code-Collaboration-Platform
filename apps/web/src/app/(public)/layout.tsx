import { buttonVariants, cn } from '@no-code-collaboration-platform/ui';
import Link from 'next/link';
import type { ReactNode } from 'react';

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className='min-h-dvh'>
      <header className='border-b bg-background/90 backdrop-blur'>
        <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-6'>
          <Link className='font-semibold tracking-tight' href='/'>
            No-Code Collaboration Platform
          </Link>
          <nav aria-label='Public navigation' className='flex items-center gap-2'>
            <Link className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden sm:inline-flex')} href='/explore'>Explore</Link>
            <Link className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden md:inline-flex')} href='/marketplace'>Marketplace</Link>
            <Link className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden sm:inline-flex')} href='/search'>Search</Link>
            <Link className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))} href='/sign-in'>Sign in</Link>
            <Link className={cn(buttonVariants({ size: 'sm' }))} href='/dashboard'>Dashboard</Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
