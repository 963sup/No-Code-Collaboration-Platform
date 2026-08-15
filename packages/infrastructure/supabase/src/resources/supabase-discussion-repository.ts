import type {
  AccessibleDiscussionQuery,
  DiscussionCollection,
  DiscussionCollectionQuery,
  DiscussionCommandPersistenceResult,
  DiscussionReader,
  DiscussionWriter
} from '@no-code-collaboration-platform/application';
import type {
  DiscussionCommand,
  DiscussionDetail
} from '@no-code-collaboration-platform/domain/resource';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';
import {
  mapSupabaseDiscussionRow,
  mapSupabaseDiscussionSummaryRow,
  type DiscussionDetailProjectionRow
} from './supabase-discussion-mapper';

const detailProjection =
  'id, repository_id, discussion_number, category, title, body, status, is_locked, answer_comment_id, version, created_by, created_at, updated_at, closed_at';
const summaryProjection =
  'id, repository_id, discussion_number, category, title, status, is_locked, version, created_by, created_at, updated_at, closed_at';
const accessDeniedCodes = new Set(['42501', 'PGRST301']);

function literalLikePattern(value: string) {
  return `%${value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`;
}

export class SupabaseDiscussionRepository implements DiscussionReader, DiscussionWriter {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  private async hydrate(row: DiscussionDetailProjectionRow): Promise<DiscussionDetail> {
    const { data, error } = await this.client
      .from('discussion_comments')
      .select('id, discussion_id, repository_id, body, version, created_by, created_at, updated_at')
      .eq('discussion_id', row.id)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });
    if (error) throw new Error('Unable to load Discussion comments.', { cause: error });
    return mapSupabaseDiscussionRow(row, data);
  }

  public async findAccessibleDiscussion(
    query: AccessibleDiscussionQuery
  ): Promise<DiscussionDetail | null> {
    const { data, error } = await this.client
      .from('discussions')
      .select(detailProjection)
      .eq('repository_id', query.repositoryId)
      .eq('discussion_number', query.discussionNumber)
      .maybeSingle();
    if (error) throw new Error('Unable to load the accessible Discussion.', { cause: error });
    return data ? this.hydrate(data) : null;
  }

  public async listAccessibleDiscussions(
    query: DiscussionCollectionQuery
  ): Promise<DiscussionCollection> {
    const first = (query.page - 1) * query.pageSize;
    const last = first + query.pageSize - 1;
    let request = this.client
      .from('discussions')
      .select(summaryProjection, { count: 'exact' })
      .eq('repository_id', query.repositoryId);
    if (query.status !== 'all') request = request.eq('status', query.status);
    if (query.category !== 'all') {
      request = request.eq(
        'category',
        query.category as Database['public']['Enums']['discussion_category']
      );
    }
    if (query.query) request = request.ilike('title', literalLikePattern(query.query));
    const { count, data, error } = await request
      .order('updated_at', { ascending: false })
      .order('discussion_number', { ascending: false })
      .range(first, last);
    if (error) throw new Error('Unable to list accessible Discussions.', { cause: error });
    return { discussions: data.map(mapSupabaseDiscussionSummaryRow), total: count ?? 0 };
  }

  public async executeDiscussionCommand(
    command: DiscussionCommand
  ): Promise<DiscussionCommandPersistenceResult> {
    let response;
    switch (command.type) {
      case 'create':
        response = await this.client.rpc('create_discussion', {
          discussion_body: command.body,
          discussion_category: command.category,
          discussion_title: command.title,
          mentioned_user_ids: command.mentionedUserIds ? [...command.mentionedUserIds] : undefined,
          target_repository_id: command.repositoryId
        });
        break;
      case 'edit':
        response = await this.client.rpc('edit_discussion', {
          discussion_body: command.body,
          discussion_id: command.discussionId,
          discussion_title: command.title,
          expected_version: command.expectedVersion,
          mentioned_user_ids: command.mentionedUserIds ? [...command.mentionedUserIds] : undefined,
          target_repository_id: command.repositoryId
        });
        break;
      case 'comment':
        response = await this.client.rpc('add_discussion_comment', {
          comment_body: command.body,
          discussion_id: command.discussionId,
          expected_version: command.expectedVersion,
          mentioned_user_ids: command.mentionedUserIds ? [...command.mentionedUserIds] : undefined,
          target_repository_id: command.repositoryId
        });
        break;
      case 'close':
      case 'reopen':
        response = await this.client.rpc('transition_discussion', {
          discussion_id: command.discussionId,
          expected_version: command.expectedVersion,
          target_repository_id: command.repositoryId,
          target_status: command.type === 'close' ? 'closed' : 'open'
        });
        break;
      case 'lock':
      case 'unlock':
        response = await this.client.rpc('set_discussion_lock', {
          discussion_id: command.discussionId,
          expected_version: command.expectedVersion,
          should_lock: command.type === 'lock',
          target_repository_id: command.repositoryId
        });
        break;
      case 'select-answer':
        response = await this.client.rpc('set_discussion_answer', {
          expected_version: command.expectedVersion,
          target_answer_comment_id: command.commentId,
          target_discussion_id: command.discussionId,
          target_repository_id: command.repositoryId
        });
        break;
      case 'clear-answer':
        response = await this.client.rpc('clear_discussion_answer', {
          discussion_id: command.discussionId,
          expected_version: command.expectedVersion,
          target_repository_id: command.repositoryId
        });
        break;
    }
    if (response.error) {
      if (accessDeniedCodes.has(response.error.code)) return { ok: false, reason: 'forbidden' };
      if (response.error.code === 'P0002') {
        return { ok: false, reason: 'related-resource-unavailable' };
      }
      throw new Error('Unable to execute the Discussion command.', { cause: response.error });
    }
    const row = response.data[0];
    if (!row) return { ok: false, reason: 'state-changed' };
    const discussion = await this.findAccessibleDiscussion({
      discussionNumber: row.discussion_number,
      repositoryId: row.repository_id
    });
    if (!discussion) throw new Error('The Discussion command result is not readable by its Actor.');
    return { discussion, ok: true };
  }
}
