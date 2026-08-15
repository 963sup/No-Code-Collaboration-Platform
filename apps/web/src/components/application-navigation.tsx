'use client';

import {
  Badge,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@no-code-collaboration-platform/ui';
import {
  Bell,
  Boxes,
  CircleDot,
  Compass,
  FolderKanban,
  LayoutDashboard,
  Menu,
  MessagesSquare,
  Plug,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { globalSurfaces } from '@/navigation/surface-definitions';

const icons = {
  dashboard: LayoutDashboard,
  repositories: Boxes,
  issues: CircleDot,
  projects: FolderKanban,
  discussions: MessagesSquare,
  notifications: Bell,
  search: Search,
  explore: Compass,
  marketplace: Plug
} as const;

function navigationItems() {
  return globalSurfaces.filter(
    (surface) => surface.placement === 'primary' || surface.placement === 'discovery'
  );
}

export function ApplicationNavigationList({ onNavigate }: { readonly onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label='Application navigation' className='space-y-1'>
      {navigationItems().map((surface) => {
        const Icon = icons[surface.id as keyof typeof icons] ?? Boxes;
        const path = surface.href.split('?')[0];
        const active =
          pathname === path || (path !== '/dashboard' && pathname.startsWith(`${path}/`));
        return (
          <Link
            aria-current={active ? 'page' : undefined}
            className={
              active
                ? 'flex min-h-10 items-center gap-3 rounded-md bg-accent px-3 py-2 text-sm font-medium'
                : 'flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground'
            }
            href={surface.href}
            key={surface.id}
            onClick={onNavigate}
          >
            <Icon aria-hidden='true' className='size-4 shrink-0' />
            <span className='min-w-0 flex-1 truncate'>{surface.label}</span>
            {surface.availability === 'live' ? null : (
              <Badge variant={surface.availability}>{surface.availability}</Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileApplicationNavigation() {
  return (
    <Sheet>
      <SheetTrigger className='inline-flex size-9 items-center justify-center rounded-md text-shell-foreground hover:bg-shell-accent focus-visible:ring-2 focus-visible:ring-shell-ring md:hidden'>
        <Menu aria-hidden='true' className='size-5' />
        <span className='sr-only'>Open navigation</span>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>No-Code Collaboration</SheetTitle>
          <SheetDescription>Repository-centered collaboration surfaces.</SheetDescription>
        </SheetHeader>
        <ApplicationNavigationList />
      </SheetContent>
    </Sheet>
  );
}
