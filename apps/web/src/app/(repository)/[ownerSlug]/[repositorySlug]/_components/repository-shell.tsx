import { BookOpenText } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button } from '@no-code-collaboration-platform/ui';

import { AppHeaderControls } from '@/components/app-header-controls';
import { SiteHeader } from '@/components/site-header';
import { repositoryPath } from '@/routing/repository-routes';

import { RepositoryNavigation } from './repository-navigation';

interface RepositoryShellProps {
  readonly children: ReactNode;
  readonly isAuthenticated: boolean;
  readonly identityLabel?: string;
  readonly ownerSlug: string;
  readonly repositorySlug: string;
  readonly repositoryName: string;
  readonly signOutAction: () => Promise<void>;
  readonly updateNotificationPreferenceAction: (formData: FormData) => Promise<void>;
  readonly visibility: 'private' | 'public';
}

export function RepositoryShell({
  children,
  isAuthenticated,
  identityLabel,
  ownerSlug,
  repositorySlug,
  repositoryName,
  signOutAction,
  updateNotificationPreferenceAction,
  visibility
}: RepositoryShellProps) {
  const repositoryRoute = { ownerSlug, repositorySlug };
  const basePath = repositoryPath(repositoryRoute);

  return (
    <div className='min-h-dvh bg-background'>
      <SiteHeader
        actions={
          <AppHeaderControls
            identityLabel={isAuthenticated ? identityLabel : undefined}
            signInNext={basePath}
            signOutAction={isAuthenticated ? signOutAction : undefined}
          />
        }
        homeHref={isAuthenticated ? '/app' : '/'}
      />
      <div className='border-b bg-repository-header'>
        <div className='mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8'>
          <div className='flex min-w-0 items-center gap-2 pb-3 text-lg'>
            <BookOpenText aria-hidden='true' className='size-4 shrink-0 text-muted-foreground' />
            <span className='truncate text-link'>{ownerSlug}</span>
            <span aria-hidden='true' className='text-muted-foreground'>
              /
            </span>
            <Link className='truncate font-semibold text-link hover:underline' href={basePath}>
              {repositoryName}
            </Link>
            <span className='rounded-full border bg-background px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground'>
              {visibility}
            </span>
            {isAuthenticated ? (
              <form action={updateNotificationPreferenceAction} className='ml-auto flex gap-1'>
                <Button name='intent' size='sm' type='submit' value='watch' variant='outline'>
                  Watch
                </Button>
                <Button name='intent' size='sm' type='submit' value='mute' variant='ghost'>
                  Mute
                </Button>
              </form>
            ) : null}
          </div>
          <div className='overflow-x-auto'>
            <RepositoryNavigation ownerSlug={ownerSlug} repositorySlug={repositorySlug} />
          </div>
        </div>
      </div>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8'>{children}</div>
    </div>
  );
}
