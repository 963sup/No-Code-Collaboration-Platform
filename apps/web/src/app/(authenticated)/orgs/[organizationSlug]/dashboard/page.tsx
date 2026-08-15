import { SurfaceFrame } from '@/components/surface-frame';

export default function OrganizationDashboardPage() {
  return (
    <SurfaceFrame
      availability='preview'
      description='Organization-level administration and discovery projection aligned to the observed GitHub /orgs/{organization}/dashboard URL. It does not become a Repository collaboration or authorization boundary.'
      emptyTitle='Organization dashboard is not live'
      title='Organization dashboard'
    />
  );
}
