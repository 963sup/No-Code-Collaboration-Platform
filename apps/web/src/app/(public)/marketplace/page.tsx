import { Tabs, TabsContent, TabsList, TabsTrigger } from '@no-code-collaboration-platform/ui';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { SurfaceFrame } from '@/components/surface-frame';
import {
  canonicalSurfaceHref,
  normalizeSurfaceQuery,
  type SurfaceSearchParams
} from '@/routing/normalize-surface-query';

export const metadata: Metadata = { title: 'Marketplace' };

export default async function MarketplacePage({
  searchParams
}: {
  readonly searchParams: Promise<SurfaceSearchParams>;
}) {
  const normalized = normalizeSurfaceQuery(await searchParams, {
    category: { kind: 'enum', values: ['all', 'mcp', 'data', 'delivery'], defaultValue: 'all' },
    page: { kind: 'page' }
  });
  if (normalized.changed) redirect(canonicalSurfaceHref('/marketplace', normalized));
  return (
    <main className='px-4 py-8 sm:px-6 lg:px-8'>
      <SurfaceFrame
        availability='preview'
        description='A provider-neutral catalog projected onto the observed GitHub Marketplace URL. There is no Install, Connect, OAuth, credential, App Principal, Repository binding, arbitrary endpoint, package download, server startup, or script execution.'
        title='Marketplace'
      >
        <Tabs defaultValue={normalized.values.category ?? 'all'}>
          <TabsList className='max-w-full overflow-x-auto'>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='mcp'>MCP</TabsTrigger>
            <TabsTrigger value='data'>Data</TabsTrigger>
            <TabsTrigger value='delivery'>Delivery</TabsTrigger>
          </TabsList>
          <TabsContent
            className='rounded-lg border border-dashed p-6 text-sm text-muted-foreground'
            value={normalized.values.category ?? 'all'}
          >
            No connector entry is published until its metadata and scopes are reviewed. Connection
            lifecycle remains deferred.
          </TabsContent>
        </Tabs>
      </SurfaceFrame>
    </main>
  );
}
