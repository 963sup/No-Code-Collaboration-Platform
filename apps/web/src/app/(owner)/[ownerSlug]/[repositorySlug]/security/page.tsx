import { SurfaceFrame } from '@/components/surface-frame';
export default function RepositorySecurityPage() {
  return (
    <SurfaceFrame
      availability='preview'
      description='Repository access posture and governance Evidence only. Code scanning, dependency scanning, secret scanning, and software supply-chain surfaces are excluded.'
      emptyTitle='Repository security posture is not live'
      title='Security'
    />
  );
}
