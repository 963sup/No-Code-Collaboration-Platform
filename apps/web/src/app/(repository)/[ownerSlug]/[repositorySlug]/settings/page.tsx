import { SurfaceFrame } from '@/components/surface-frame';
export default function RepositorySettingsPage() {
  return (
    <SurfaceFrame
      availability='preview'
      description='Repository collaboration settings intent. Preview controls cannot change visibility, ownership, Grants, Capabilities, or persistence.'
      emptyTitle='Repository settings are not live'
      title='Settings'
    />
  );
}
