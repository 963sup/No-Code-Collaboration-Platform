import type { Metadata } from 'next';

import { SurfaceFrame } from '@/components/surface-frame';

export const metadata: Metadata = { title: 'Repositories' };

export default function RepositoriesPage() {
  return (
    <SurfaceFrame
      availability='preview'
      description='A dedicated accessible-Repository discovery URL. The live dashboard remains the authoritative list until this route receives the same provider-neutral projection.'
      emptyDescription='Open Dashboard to use the live accessible Repository list. This preview does not duplicate or invent Repository rows.'
      emptyTitle='Repository discovery preview'
      title='Repositories'
    />
  );
}
