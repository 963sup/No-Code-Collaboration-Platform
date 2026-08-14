import type {
  AccessibleIssueQuery,
  IssueCollection,
  IssueCollectionQuery,
  IssueReader
} from '@no-code-collaboration-platform/application';
import type { IssueDetail } from '@no-code-collaboration-platform/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';
import { mapSupabaseIssueRow, mapSupabaseIssueSummaryRow } from '../mappers/supabase-issue-mapper';

const issueDetailProjection =
  'id, repository_id, issue_number, title, body, status, created_by, created_at, updated_at, closed_at';
const issueSummaryProjection =
  'id, repository_id, issue_number, title, status, created_by, created_at, updated_at, closed_at';

function literalLikePattern(value: string) {
  return `%${value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`;
}

export class SupabaseIssueReader implements IssueReader {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async findAccessibleIssue(query: AccessibleIssueQuery): Promise<IssueDetail | null> {
    const { data, error } = await this.client
      .from('issues')
      .select(issueDetailProjection)
      .eq('repository_id', query.repositoryId)
      .eq('issue_number', query.issueNumber)
      .maybeSingle();

    if (error) throw new Error('Unable to load the accessible Issue.', { cause: error });
    return data ? mapSupabaseIssueRow(data) : null;
  }

  public async listAccessibleIssues(query: IssueCollectionQuery): Promise<IssueCollection> {
    const first = (query.page - 1) * query.pageSize;
    const last = first + query.pageSize - 1;
    let request = this.client
      .from('issues')
      .select(issueSummaryProjection, { count: 'exact' })
      .eq('repository_id', query.repositoryId);

    if (query.status !== 'all') request = request.eq('status', query.status);
    if (query.query) request = request.ilike('title', literalLikePattern(query.query));

    const { count, data, error } = await request
      .order('updated_at', { ascending: false })
      .order('issue_number', { ascending: false })
      .range(first, last);

    if (error) throw new Error('Unable to list accessible Issues.', { cause: error });
    return {
      issues: data.map(mapSupabaseIssueSummaryRow),
      total: count ?? 0
    };
  }
}
