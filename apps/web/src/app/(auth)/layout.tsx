import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className='grid min-h-dvh place-items-center bg-muted/35 px-6 py-12'>
      <div className='w-full max-w-md space-y-6'>
        <Link className='block text-center text-sm font-medium text-muted-foreground' href='/'>
          No-Code Collaboration Platform
        </Link>
        {children}
      </div>
    </main>
  );
}
