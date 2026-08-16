import type {
  AccessibleIssueByIdQuery,
  AccessibleIssueQuery,
  IssueCollection,
  IssueCollectionQuery,
  IssueCommandPersistenceResult,
  IssueReader,
  IssueWriter
} from '@no-code-collaboration-platform/application';
import type { IssueCommand, IssueDetail } from '@no-code-collaboration-platform/domain/resource';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';
import {
  mapSupabaseIssueRow,
  mapSupabaseIssueSummaryRow,
  type IssueDetailProjectionRow
} from './supabase-issue-mapper';

const issueDetailProjection =
  'id, repository_id, issue_number, title, body, status, close_reason, version, created_by, created_at, updated_at, closed_at';
const issueSummaryProjection =
  'id, repository_id, issue_number, title, status, close_reason, version, created_by, created_at, updated_at, closed_at';
const accessDeniedCodes = new Set(['42501', 'PGRST301']);

function literalLikePattern(value: string) {
  return `%${value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`;
}

export class SupabaseIssueReader implements IssueReader, IssueWriter {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  private async hydrate(row: IssueDetailProjectionRow): Promise<IssueDetail> {
    const [assignments, appliedLabels, comments] = await Promise.all([
      this.client.from('issue_assignees').select('user_id').eq('issue_id', row.id),
      this.client.from('issue_labels').select('label_id').eq('issue_id', row.id),
      this.client
        .from('issue_comments')
        .select('id, issue_id, repository_id, body, version, created_by, created_at, updated_at')
        .eq('issue_id', row.id)
        .order('created_at', { ascending: true })
        .order('id', { ascending: true })
    ]);
    if (assignments.error || appliedLabels.error || comments.error) {
      throw new Error('Unable to hydrate the accessible Issue.', {
        cause: assignments.error ?? appliedLabels.error ?? comments.error
      });
    }
    const labelIds = appliedLabels.data.map((label) => label.label_id);
    const labels =
      labelIds.length === 0
        ? { data: [], error: null }
        : await this.client
            .from('repository_labels')
            .select('id, repository_id, name, color, created_at')
            .in('id', labelIds)
            .order('name');
    if (labels.error) throw new Error('Unable to load Issue labels.', { cause: labels.error });
    return mapSupabaseIssueRow(row, {
      assigneeIds: assignments.data.map((assignment) => assignment.user_id),
      comments: comments.data,
      labels: labels.data
    });
  }

  public async findAccessibleIssue(query: AccessibleIssueQuery): Promise<IssueDetail | null> {
    const { data, error } = await this.client
      .from('issues')
      .select(issueDetailProjection)
      .eq('repository_id', query.repositoryId)
      .eq('issue_number', query.issueNumber)
      .maybeSingle();
    if (error) throw new Error('Unable to load the accessible Issue.', { cause: error });
    return data ? this.hydrate(data) : null;
  }

  public async findAccessibleIssueById(query: AccessibleIssueByIdQuery): Promise<IssueDetail | null> {
    const { data, error } = await this.client
      .from('issues')
      .select(issueDetailProjection)
      .eq('repository_id', query.repositoryId)
      .eq('id', query.issueId)
      .maybeSingle();
    if (error) throw new Error('Unable to load the accessible Issue command target.', { cause: error });
    return data ? this.hydrate(data) : null;
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
    return { issues: data.map(mapSupabaseIssueSummaryRow), total: count ?? 0 };
  }

  public async executeIssueCommand(command: IssueCommand): Promise<IssueCommandPersistenceResult> {
    let response;
    switch (command.type) {
      case 'create':
        response = await this.client.rpc('create_issue', {
          issue_body: command.body,
          issue_title: command.title,
          mentioned_user_ids: command.mentionedUserIds ? [...command.mentionedUserIds] : undefined,
          target_repository_id: command.repositoryId
        });
        break;
      case 'edit':
        response = await this.client.rpc('edit_issue', {
          expected_version: command.expectedVersion,
          issue_body: command.body,
          issue_id: command.issueId,
          issue_title: command.title,
          mentioned_user_ids: command.mentionedUserIds ? [...command.mentionedUserIds] : undefined,
          target_repository_id: command.repositoryId
        });
        break;
      case 'comment':
        response = await this.client.rpc('add_issue_comment', {
          comment_body: command.body,
          expected_version: command.expectedVersion,
          issue_id: command.issueId,
          mentioned_user_ids: command.mentionedUserIds ? [...command.mentionedUserIds] : undefined,
          target_repository_id: command.repositoryId
        });
        break;
      case 'assign':
      case 'unassign':
        response = await this.client.rpc('set_issue_assignee', {
          assignee_id: command.assigneeId,
          expected_version: command.expectedVersion,
          target_issue_id: command.issueId,
          should_assign: command.type === 'assign',
          target_repository_id: command.repositoryId
        });
        break;
      case 'label':
      case 'unlabel':
        response = await this.client.rpc('set_issue_label', {
          expected_version: command.expectedVersion,
          issue_id: command.issueId,
          label_id: command.labelId,
          should_apply: command.type === 'label',
          target_repository_id: command.repositoryId
        });
        break;
      case 'close':
      case 'reopen':
        response = await this.client.rpc('transition_issue', {
          expected_version: command.expectedVersion,
          issue_id: command.issueId,
          target_close_reason: command.type === 'close' ? command.closeReason : undefined,
          target_repository_id: command.repositoryId,
          target_status: command.type === 'close' ? 'closed' : 'open'
        });
        break;
    }
    if (response.error) {
      if (accessDeniedCodes.has(response.error.code)) return { ok: false, reason: 'forbidden' };
      if (response.error.code === 'P0002') {
        return { ok: false, reason: 'related-resource-unavailable' };
      }
      throw new Error('Unable to execute the Issue command.', { cause: response.error });
    }
    const row = response.data[0];
    if (!row) return { ok: false, reason: 'state-changed' };
    const issue = await this.findAccessibleIssue({
      issueNumber: row.issue_number,
      repositoryId: row.repository_id
    });
    if (!issue) throw new Error('The Issue command result is not readable by its Actor.');
    return { issue, ok: true };
  }
}
