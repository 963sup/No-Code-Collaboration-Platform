import { SurfaceFrame } from '@/components/surface-frame';

export default function OrganizationPeoplePage() {
  return (
    <SurfaceFrame
      availability='preview'
      description='Organization Membership governance aligned to the observed GitHub /orgs/{organization}/people URL. Membership does not imply Repository access.'
      emptyTitle='People administration is not live'
      title='People'
    />
  );
}
