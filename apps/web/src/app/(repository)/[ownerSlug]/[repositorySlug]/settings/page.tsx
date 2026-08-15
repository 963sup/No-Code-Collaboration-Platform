import { Card, CardDescription, CardHeader, CardTitle } from '@no-code-collaboration-platform/ui';
import Link from 'next/link';

import { SurfaceFrame } from '@/components/surface-frame';
import { repositorySettingsAccessPath } from '@/routing/repository-routes';

interface RepositorySettingsPageProps {
  readonly params: Promise<{ ownerSlug: string; repositorySlug: string }>;
}

export default async function RepositorySettingsPage({ params }: RepositorySettingsPageProps) {
  const { ownerSlug, repositorySlug } = await params;

  return (
    <SurfaceFrame
      availability='preview'
      description='Repository collaboration settings intent. Mutation controls remain unavailable until their Product and authorization contracts are accepted.'
      title='Settings'
    >
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Your Repository access</CardTitle>
          <CardDescription>
            Inspect the current Actor&apos;s effective Role, Capabilities, and accepted authority sources.
          </CardDescription>
          <Link
            className='pt-2 text-sm font-medium underline underline-offset-4'
            href={repositorySettingsAccessPath({ ownerSlug, repositorySlug })}
          >
            View access explanation
          </Link>
        </CardHeader>
      </Card>
    </SurfaceFrame>
  );
}
