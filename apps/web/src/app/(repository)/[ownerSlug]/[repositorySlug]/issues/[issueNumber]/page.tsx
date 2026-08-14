import { IssueDetailView } from '../../_components/issue-detail';
import { requireAccessibleIssueRoute } from '../../_queries/get-accessible-issue';

interface RepositoryIssueDetailProps {
  readonly params: Promise<{
    issueNumber: string;
    ownerSlug: string;
    repositorySlug: string;
  }>;
}

export default async function RepositoryIssueDetail({ params }: RepositoryIssueDetailProps) {
  const { issueNumber, ownerSlug, repositorySlug } = await params;
  const { issue } = await requireAccessibleIssueRoute(ownerSlug, repositorySlug, issueNumber);

  return <IssueDetailView issue={issue} showMetadata />;
}
