'use client';

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogRoot,
  DialogTitle
} from '@no-code-collaboration-platform/ui';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

interface IssueRouteDialogProps {
  readonly children: ReactNode;
  readonly issueNumber: number;
}

export function IssueRouteDialog({ children, issueNumber }: IssueRouteDialogProps) {
  const router = useRouter();

  return (
    <DialogRoot
      defaultOpen
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    >
      <DialogContent className='max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-5xl max-sm:left-0 max-sm:top-0 max-sm:h-dvh max-sm:max-h-none max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none'>
        <DialogHeader className='sr-only'>
          <DialogTitle>Issue #{issueNumber}</DialogTitle>
          <DialogDescription>Quick view of the canonical Issue resource.</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </DialogRoot>
  );
}
