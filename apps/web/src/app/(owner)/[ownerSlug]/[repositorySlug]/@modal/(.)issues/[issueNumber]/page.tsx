import { IssueDetailView } from '../../../_components/issue-detail';
import { IssueRouteDialog } from '../../../_components/issue-route-dialog';
import { requireAccessibleIssueRoute } from '../../../_queries/get-accessible-issue';

interface RepositoryIssueModalProps {
  readonly params: Promise<{
    issueNumber: string;
    ownerSlug: string;
    repositorySlug: string;
  }>;
}

export default async function RepositoryIssueModal({ params }: RepositoryIssueModalProps) {
  const { issueNumber, ownerSlug, repositorySlug } = await params;
  const { issue } = await requireAccessibleIssueRoute(ownerSlug, repositorySlug, issueNumber);

  return (
    <IssueRouteDialog issueNumber={issue.issueNumber}>
      <IssueDetailView issue={issue} showMetadata />
    </IssueRouteDialog>
  );
}
