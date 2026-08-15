'use server';

import { CreateOrganization } from '@no-code-collaboration-platform/application';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createRequestServices } from '@/composition/create-request-services';
import { buildPath } from '@/routing/auth-routes';

const organizationSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
});

export async function createOrganization(formData: FormData) {
  const parsed = organizationSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    slug: String(formData.get('slug') ?? '')
  });
  if (!parsed.success) redirect('/organizations/new?error=invalid-input');

  const services = await createRequestServices();
  const result = await new CreateOrganization(
    services.identityProvider,
    services.organizationWriter
  )
    .execute(parsed.data)
    .catch(() => null);

  if (result === null) redirect('/organizations/new?error=provider-unavailable');
  if (!result.ok) {
    if (result.reason === 'unauthenticated') {
      redirect('/sign-in?next=%2Forganizations%2Fnew');
    }
    redirect(`/organizations/new?error=${result.reason}`);
  }

  revalidatePath('/app');
  redirect(
    buildPath('/new', {
      notice: 'organization-created',
      owner: `organization:${result.organization.id}`
    })
  );
}
