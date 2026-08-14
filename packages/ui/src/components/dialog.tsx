'use client';

import { XIcon } from 'lucide-react';
import { Close, Content, Description, Overlay, Portal, Root, Title } from '@radix-ui/react-dialog';
import type { ComponentProps } from 'react';

import { cn } from '../lib/utils';

export function DialogRoot(props: ComponentProps<typeof Root>) {
  return <Root data-slot='dialog' {...props} />;
}

export function DialogOverlay({ className, ...props }: ComponentProps<typeof Overlay>) {
  return (
    <Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      data-slot='dialog-overlay'
      {...props}
    />
  );
}

export function DialogContent({
  children,
  className,
  showCloseButton = true,
  ...props
}: ComponentProps<typeof Content> & { readonly showCloseButton?: boolean }) {
  return (
    <Portal data-slot='dialog-portal'>
      <DialogOverlay />
      <Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg outline-none duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:max-w-lg',
          className
        )}
        data-slot='dialog-content'
        {...props}
      >
        {children}
        {showCloseButton ? (
          <Close
            className='absolute right-4 top-4 rounded-xs opacity-70 outline-none ring-offset-background transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none'
            data-slot='dialog-close'
          >
            <XIcon aria-hidden='true' className='size-4' />
            <span className='sr-only'>Close</span>
          </Close>
        ) : null}
      </Content>
    </Portal>
  );
}

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      data-slot='dialog-header'
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof Title>) {
  return (
    <Title
      className={cn('text-lg font-semibold leading-none', className)}
      data-slot='dialog-title'
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: ComponentProps<typeof Description>) {
  return (
    <Description
      className={cn('text-sm text-muted-foreground', className)}
      data-slot='dialog-description'
      {...props}
    />
  );
}
