import type { Metadata } from 'next';

import { SurfaceFrame } from '@/components/surface-frame';

export const metadata: Metadata = { title: 'Repositories' };

export default function RepositoriesPage() {
  return (
    <SurfaceFrame
      availability='preview'
      description='Accessible Repository discovery aligned to the observed GitHub /repos information architecture. The live Dashboard remains the authoritative list until this route receives the same provider-neutral projection.'
      emptyDescription='Open Dashboard to use the live accessible Repository list. This preview does not duplicate or invent Repository rows.'
      emptyTitle='Repository discovery preview'
      title='Repositories'
    />
  );
}
