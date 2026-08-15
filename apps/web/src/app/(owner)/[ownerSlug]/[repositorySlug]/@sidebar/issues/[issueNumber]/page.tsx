import { Card, CardContent, CardHeader, CardTitle } from '@no-code-collaboration-platform/ui';

import { IssueMetadata } from '../../../_components/issue-detail';
import { getAccessibleIssueRoute } from '../../../_queries/get-accessible-issue';

interface IssueMetadataSidebarProps {
  readonly params: Promise<{
    issueNumber: string;
    ownerSlug: string;
    repositorySlug: string;
  }>;
}

export default async function IssueMetadataSidebar({ params }: IssueMetadataSidebarProps) {
  const { issueNumber, ownerSlug, repositorySlug } = await params;
  const result = await getAccessibleIssueRoute(ownerSlug, repositorySlug, issueNumber);
  if (!result) return null;

  return (
    <aside
      aria-label='Issue metadata'
      className='hidden md:sticky md:top-6 md:block md:self-start'
      data-sidebar-placement='right'
    >
      <Card>
        <CardHeader>
          <CardTitle className='text-sm'>About this issue</CardTitle>
        </CardHeader>
        <CardContent>
          <IssueMetadata issue={result.issue} />
        </CardContent>
      </Card>
    </aside>
  );
}
