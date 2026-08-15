import { GetAccessibleIssue } from '@no-code-collaboration-platform/application';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { createRequestServices } from '@/composition/create-request-services';

import { requireAccessibleRepositoryRoute } from './get-accessible-repository-route';

export const getAccessibleIssueRoute = cache(
  async (ownerSlug: string, repositorySlug: string, issueNumberValue: string) => {
    const issueNumber = Number(issueNumberValue);

    const route = await requireAccessibleRepositoryRoute(ownerSlug, repositorySlug);
    const services = await createRequestServices();
    const issue = await new GetAccessibleIssue(services.issueReader).execute({
      issueNumber,
      repositoryId: route.repository.id
    });

    return issue ? { issue, route } : null;
  }
);

export async function requireAccessibleIssueRoute(
  ownerSlug: string,
  repositorySlug: string,
  issueNumber: string
) {
  const result = await getAccessibleIssueRoute(ownerSlug, repositorySlug, issueNumber);
  if (!result) notFound();
  return result;
}
