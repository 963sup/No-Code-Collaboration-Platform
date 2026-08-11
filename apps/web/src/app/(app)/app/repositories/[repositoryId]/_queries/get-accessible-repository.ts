import { GetAccessibleRepository } from '@no-code-collaboration-platform/application';
import type { RepositorySummary } from '@no-code-collaboration-platform/domain';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { z } from 'zod';

import { createRequestServices } from '@/composition/create-request-services';

const repositoryIdSchema = z.uuid();

export const getAccessibleRepository = cache(
  async (repositoryId: string): Promise<RepositorySummary | null> => {
    const parsedRepositoryId = repositoryIdSchema.safeParse(repositoryId);
    if (!parsedRepositoryId.success) return null;

    const { repositoryReader } = await createRequestServices();
    return new GetAccessibleRepository(repositoryReader).execute(parsedRepositoryId.data);
  }
);

export async function requireAccessibleRepository(
  repositoryId: string
): Promise<RepositorySummary> {
  const repository = await getAccessibleRepository(repositoryId);
  if (!repository) notFound();
  return repository;
}
