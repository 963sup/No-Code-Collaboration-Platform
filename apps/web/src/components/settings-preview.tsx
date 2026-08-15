import type { SurfaceAvailability } from '@/routing/surface-definitions';

import { SurfaceFrame } from './surface-frame';

export function SettingsPreview({
  title,
  description,
  availability = 'preview'
}: {
  readonly title: string;
  readonly description: string;
  readonly availability?: SurfaceAvailability;
}) {
  return (
    <SurfaceFrame
      availability={availability}
      description={description}
      emptyDescription='This settings surface exposes information architecture and control intent only. It does not persist fabricated preferences, authority, credentials, or provider state.'
      emptyTitle={`${title} controls are not live`}
      title={title}
    />
  );
}
