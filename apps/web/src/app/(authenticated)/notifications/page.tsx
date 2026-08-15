import { ListNotifications } from '@no-code-collaboration-platform/application';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@no-code-collaboration-platform/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { QueryControls } from '@/components/query-controls';
import { SurfaceFrame } from '@/components/surface-frame';
import { createRequestServices } from '@/composition/create-request-services';
import {
  canonicalSurfaceHref,
  normalizeSurfaceQuery,
  type SurfaceSearchParams
} from '@/routing/normalize-surface-query';

import { markAllNotificationsReadAction, updateNotificationAction } from './actions';

export const metadata: Metadata = { title: 'Notifications' };

export default async function NotificationsPage({
  searchParams
}: {
  readonly searchParams: Promise<SurfaceSearchParams>;
}) {
  const normalized = normalizeSurfaceQuery(await searchParams, {
    status: {
      kind: 'enum',
      values: ['unread', 'read', 'archived', 'all'],
      defaultValue: 'unread'
    },
    page: { kind: 'page' }
  });
  if (normalized.changed) redirect(canonicalSurfaceHref('/notifications', normalized));
  const services = await createRequestServices();
  const page = await new ListNotifications(services.notificationReader).execute({
    page: Number(normalized.values.page),
    state: normalized.values.status
  });
  return (
    <SurfaceFrame
      availability='live'
      controls={
        <div className='flex flex-wrap items-end gap-3'>
          <QueryControls
            action='/notifications'
            controls={[
              {
                kind: 'select',
                name: 'status',
                label: 'Delivery state',
                value: normalized.values.status,
                options: [
                  { label: 'Unread', value: 'unread' },
                  { label: 'Read', value: 'read' },
                  { label: 'Archived', value: 'archived' },
                  { label: 'All', value: 'all' }
                ]
              }
            ]}
          />
          <form action={markAllNotificationsReadAction}>
            <Button type='submit' variant='outline'>
              Mark all read
            </Button>
          </form>
        </div>
      }
      description='Actor-specific in-app delivery derived from Activity Evidence. Every read revalidates Repository access before exposing any thread content.'
      emptyDescription='Email, push, webhook, and connector delivery are outside v1.'
      emptyTitle='No accessible notification threads'
      title={`Notifications${page.total ? ` · ${page.total}` : ''}`}
    >
      {page.notifications.length ? (
        <div className='grid gap-3'>
          {page.notifications.map((notification) => (
            <Card key={notification.id}>
              <CardHeader>
                <CardTitle className='text-base'>
                  <Link className='hover:text-link hover:underline' href={notification.href}>
                    {notification.title}
                  </Link>
                </CardTitle>
                <p className='text-xs text-muted-foreground'>
                  {notification.reason} · {notification.state} · {notification.eventCount} event
                  {notification.eventCount === 1 ? '' : 's'}
                </p>
              </CardHeader>
              <CardContent>
                <form action={updateNotificationAction} className='flex flex-wrap gap-2'>
                  <input name='notificationId' type='hidden' value={notification.id} />
                  <Button
                    name='intent'
                    size='sm'
                    type='submit'
                    value={notification.state === 'unread' ? 'mark-read' : 'mark-unread'}
                    variant='outline'
                  >
                    Mark {notification.state === 'unread' ? 'read' : 'unread'}
                  </Button>
                  <Button name='intent' size='sm' type='submit' value='archive' variant='outline'>
                    Archive
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : undefined}
    </SurfaceFrame>
  );
}
