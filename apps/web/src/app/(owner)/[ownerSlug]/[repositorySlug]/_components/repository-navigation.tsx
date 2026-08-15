'use client';

import {
  Activity,
  CircleDot,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { repositorySurfaces } from '@/navigation/surface-definitions';
import { Badge } from '@no-code-collaboration-platform/ui';

interface RepositoryNavigationProps {
  readonly ownerSlug: string;
  readonly repositorySlug: string;
}

export function RepositoryNavigation({ ownerSlug, repositorySlug }: RepositoryNavigationProps) {
  const pathname = usePathname();
  const repositoryRoute = { ownerSlug, repositorySlug };
  const iconById = {
    overview: LayoutDashboard,
    issues: CircleDot,
    projects: FolderKanban,
    discussions: MessagesSquare,
    wiki: FileText,
    activity: Activity,
    security: ShieldCheck,
    settings: Settings
  } as const;
  const items = repositorySurfaces(repositoryRoute).map((surface) => ({
    ...surface,
    active:
      pathname === surface.href ||
      (surface.id !== 'overview' && pathname.startsWith(`${surface.href}/`)),
    icon: iconById[surface.id as keyof typeof iconById]
  }));

  return (
    <nav aria-label='Repository' className='-mb-px flex min-w-max gap-1'>
      {items.map((item) => (
        <Link
          aria-current={item.active ? 'page' : undefined}
          className={
            item.active
              ? 'flex min-h-12 items-center gap-2 border-b-2 border-accent-emphasis px-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
              : 'flex min-h-12 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:border-border hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
          }
          href={item.href}
          key={item.href}
        >
          <item.icon aria-hidden='true' className='size-4' />
          {item.label}
          {item.availability === 'live' ? null : (
            <Badge variant={item.availability}>{item.availability}</Badge>
          )}
        </Link>
      ))}
    </nav>
  );
}
