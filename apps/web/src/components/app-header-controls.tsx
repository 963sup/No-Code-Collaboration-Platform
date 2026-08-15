'use client';

import {
  Avatar,
  AvatarFallback,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@no-code-collaboration-platform/ui';
import {
  Bell,
  Building2,
  ChevronDown,
  CirclePlus,
  Compass,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  UserRound
} from 'lucide-react';
import Link from 'next/link';
import { useTransition } from 'react';

import { MobileApplicationNavigation } from './application-navigation';

interface AppHeaderControlsProps {
  readonly identityLabel?: string;
  readonly signOutAction?: () => Promise<void>;
  readonly signInNext?: string;
}

export function AppHeaderControls({
  identityLabel,
  signOutAction,
  signInNext = '/app'
}: AppHeaderControlsProps) {
  const [isSigningOut, startSignOut] = useTransition();

  if (!identityLabel || !signOutAction) {
    return (
      <div className='flex items-center gap-1'>
        <Link
          className='hidden rounded-md px-3 py-2 text-sm text-shell-muted hover:bg-shell-accent hover:text-shell-foreground sm:inline-flex'
          href='/explore'
        >
          <Compass aria-hidden='true' className='mr-2 size-4' />
          Explore
        </Link>
        <Link
          className='hidden rounded-md px-3 py-2 text-sm text-shell-muted hover:bg-shell-accent hover:text-shell-foreground sm:inline-flex'
          href='/search'
        >
          <Search aria-hidden='true' className='mr-2 size-4' />
          Search
        </Link>
        <Link
          className='inline-flex h-8 items-center rounded-md border border-shell-border px-3 text-xs font-medium text-shell-foreground hover:bg-shell-accent'
          href={`/sign-in?next=${encodeURIComponent(signInNext)}`}
        >
          Sign in
        </Link>
      </div>
    );
  }

  const initial = identityLabel.trim().charAt(0).toUpperCase() || 'U';

  return (
    <TooltipProvider>
      <div className='flex items-center gap-1'>
        <MobileApplicationNavigation />
        <DropdownMenu>
          <DropdownMenuTrigger className='hidden h-9 items-center gap-2 rounded-md px-3 text-sm text-shell-muted hover:bg-shell-accent hover:text-shell-foreground focus-visible:ring-2 focus-visible:ring-shell-ring lg:inline-flex'>
            All repositories <ChevronDown aria-hidden='true' className='size-3.5' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='w-72'>
            <DropdownMenuLabel>Presentation context</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href='/app'>
                <LayoutDashboard aria-hidden='true' className='size-4' />
                All accessible repositories
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <p className='px-2 py-1.5 text-xs leading-5 text-muted-foreground'>
              Context filters navigation only. It never changes effective authorization.
            </p>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger className='inline-flex size-9 items-center justify-center rounded-md text-shell-foreground hover:bg-shell-accent focus-visible:ring-2 focus-visible:ring-shell-ring'>
                <CirclePlus aria-hidden='true' className='size-5' />
                <span className='sr-only'>Create</span>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Create</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Create</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href='/new'>
                <Plus aria-hidden='true' className='size-4' />
                New Repository
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href='/organizations/new'>
                <Building2 aria-hidden='true' className='size-4' />
                New Organization
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              className='inline-flex size-9 items-center justify-center rounded-md text-shell-foreground hover:bg-shell-accent focus-visible:ring-2 focus-visible:ring-shell-ring'
              href='/search'
            >
              <Search aria-hidden='true' className='size-5' />
              <span className='sr-only'>Search</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Search no-code collaboration</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              className='relative inline-flex size-9 items-center justify-center rounded-md text-shell-foreground hover:bg-shell-accent focus-visible:ring-2 focus-visible:ring-shell-ring'
              href='/notifications'
            >
              <Bell aria-hidden='true' className='size-5' />
              <Badge
                className='absolute right-0.5 top-0.5 size-2 border-0 p-0'
                aria-label='Notifications inbox status'
              />
              <span className='sr-only'>Notifications</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger className='ml-1 rounded-full focus-visible:ring-2 focus-visible:ring-shell-ring'>
            <Avatar>
              <AvatarFallback className='bg-shell-accent text-shell-foreground'>
                {initial}
              </AvatarFallback>
            </Avatar>
            <span className='sr-only'>User menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-64'>
            <DropdownMenuLabel className='truncate'>{identityLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href='/settings/profile'>
                <UserRound aria-hidden='true' className='size-4' />
                Profile settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href='/settings/organizations'>
                <Settings aria-hidden='true' className='size-4' />
                Organization settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isSigningOut}
              onSelect={() => {
                startSignOut(() => {
                  void signOutAction();
                });
              }}
            >
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
