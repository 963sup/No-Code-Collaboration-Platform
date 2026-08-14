'use client';

import { Activity, FileText, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  repositoryActivityPath,
  repositoryPagesPath,
  repositoryPath
} from '@/routing/repository-routes';

interface RepositoryNavigationProps {
  readonly ownerSlug: string;
  readonly repositorySlug: string;
  readonly showActivity: boolean;
}

export function RepositoryNavigation({
  ownerSlug,
  repositorySlug,
  showActivity
}: RepositoryNavigationProps) {
  const pathname = usePathname();
  const repositoryRoute = { ownerSlug, repositorySlug };
  const overviewPath = repositoryPath(repositoryRoute);
  const pagesPath = repositoryPagesPath(repositoryRoute);
  const activityPath = repositoryActivityPath(repositoryRoute);
  const items = [
    {
      active: pathname === overviewPath,
      href: overviewPath,
      icon: <LayoutDashboard aria-hidden='true' className='size-4' />,
      label: 'Overview'
    },
    {
      active: pathname === pagesPath || pathname.startsWith(`${pagesPath}/`),
      href: pagesPath,
      icon: <FileText aria-hidden='true' className='size-4' />,
      label: 'Pages'
    },
    ...(showActivity
      ? [
          {
            active: pathname === activityPath,
            href: activityPath,
            icon: <Activity aria-hidden='true' className='size-4' />,
            label: 'Activity'
          }
        ]
      : [])
  ];

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
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
