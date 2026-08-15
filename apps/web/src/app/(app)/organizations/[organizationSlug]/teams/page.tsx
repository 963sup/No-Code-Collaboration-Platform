import { SurfaceFrame } from '@/components/surface-frame';
export default function OrganizationTeamsPage() {
  return (
    <SurfaceFrame
      availability='deferred'
      description='Team is explicitly not established: no Principal, Membership, Grant, detail route, or table exists.'
      emptyTitle='Team admission is deferred'
      title='Organization teams'
    />
  );
}
