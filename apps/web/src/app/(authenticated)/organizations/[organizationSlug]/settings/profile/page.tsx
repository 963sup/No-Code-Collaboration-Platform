import { SurfaceFrame } from '@/components/surface-frame';

export default function OrganizationSettingsProfilePage() {
  return (
    <SurfaceFrame
      availability='preview'
      description='Organization administration intent aligned to the observed /organizations/{organization}/settings/profile URL. It remains separate from Repository collaboration and authority.'
      emptyTitle='Organization settings are not live'
      title='General Organization Settings'
    />
  );
}
