import Link from 'next/link';
import type { ReactNode } from 'react';

import { globalSurfaces } from '@/navigation/surface-definitions';

export default function SettingsLayout({ children }: { readonly children: ReactNode }) {
  const settings = globalSurfaces.filter((surface) => surface.placement === 'settings');
  return (
    <div className='grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]'>
      <aside>
        <h2 className='mb-3 text-sm font-semibold'>Personal settings</h2>
        <nav
          aria-label='Settings'
          className='flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible'
        >
          {settings.map((surface) => (
            <Link
              className='min-w-max rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground'
              href={surface.href}
              key={surface.id}
            >
              {surface.label}
              <span className='ml-2 text-xs'>({surface.availability})</span>
            </Link>
          ))}
        </nav>
      </aside>
      <div className='min-w-0'>{children}</div>
    </div>
  );
}
