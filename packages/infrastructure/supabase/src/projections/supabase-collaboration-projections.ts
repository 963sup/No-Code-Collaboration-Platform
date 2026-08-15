import type {
  CollaborationSearchPage,
  CollaborationSearchQuery,
  CollaborationSearchReader,
  CollaborationSearchResult,
  ExplorePage,
  ExploreQuery,
  ExploreReader,
  ExploreRepositoryResult,
  NotificationCommand,
  NotificationPage,
  NotificationQuery,
  NotificationReader,
  NotificationThread,
  NotificationWriter,
  ProjectItem,
  ProjectPage,
  ProjectQuery,
  ProjectReader
} from '@no-code-collaboration-platform/application';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';

const searchResultTypes = new Set(['repository', 'page', 'issue', 'discussion', 'project']);
const projectItemTypes = new Set(['page', 'issue', 'discussion']);

export class SupabaseCollaborationProjections
  implements
    CollaborationSearchReader,
    ExploreReader,
    NotificationReader,
    NotificationWriter,
    ProjectReader
{
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async searchAccessibleCollaboration(
    query: CollaborationSearchQuery
  ): Promise<CollaborationSearchPage> {
    if (!query.query) return { results: [], total: 0 };
    const { data, error } = await this.client.rpc('search_collaboration', {
      requested_owner: query.owner,
      requested_page: query.page,
      requested_repository: query.repository,
      requested_sort: query.sort,
      requested_status: query.status === 'all' ? '' : query.status,
      requested_type: query.type,
      search_query: query.query
    });
    if (error) throw new Error('Unable to search accessible collaboration.', { cause: error });
    const results: CollaborationSearchResult[] = data.map((row) => {
      if (!searchResultTypes.has(row.result_type)) {
        throw new Error('Search returned an unsupported collaboration result type.');
      }
      return {
        bodySnippet: row.body_snippet,
        createdAt: row.created_at,
        href: row.href,
        id: row.stable_id,
        repositoryId: row.repository_id,
        title: row.title,
        type: row.result_type as CollaborationSearchResult['type'],
        updatedAt: row.updated_at
      };
    });
    return { results, total: data[0]?.total_count ?? 0 };
  }

  public async explorePublicRepositories(query: ExploreQuery): Promise<ExplorePage> {
    const { data, error } = await this.client.rpc('explore_public_repositories', {
      requested_artifact_type: query.artifactType,
      requested_owner_type: query.ownerType,
      requested_page: query.page,
      requested_sort: query.sort
    });
    if (error) throw new Error('Unable to explore public Repositories.', { cause: error });
    const repositories: ExploreRepositoryResult[] = data.map((row) => {
      if (row.owner_type !== 'user' && row.owner_type !== 'organization') {
        throw new Error('Explore returned an unsupported Repository owner type.');
      }
      return {
        description: row.description,
        href: row.href,
        id: row.id,
        lastPublicActivityAt: row.last_public_activity_at,
        name: row.name,
        ownerSlug: row.owner_slug,
        ownerType: row.owner_type,
        slug: row.slug
      };
    });
    return { repositories, total: data[0]?.total_count ?? 0 };
  }

  public async listAccessibleNotifications(query: NotificationQuery): Promise<NotificationPage> {
    const { data, error } = await this.client.rpc('list_notifications', {
      requested_page: query.page,
      requested_state: query.state
    });
    if (error) throw new Error('Unable to list accessible Notifications.', { cause: error });
    const notifications: NotificationThread[] = data.map((row) => ({
      artifactType: row.artifact_type,
      eventCount: row.event_count,
      href: row.href,
      id: row.id,
      reason: row.reason,
      repositoryId: row.repository_id,
      sourceEvidenceId: row.source_evidence_id,
      state: row.state,
      title: row.title,
      updatedAt: row.updated_at
    }));
    return { notifications, total: data[0]?.total_count ?? 0 };
  }

  public async executeNotificationCommand(command: NotificationCommand): Promise<boolean> {
    if (command.type === 'mark-all-read') {
      const { error } = await this.client.rpc('mark_all_notifications_read');
      if (error) throw new Error('Unable to mark Notifications as read.', { cause: error });
      return true;
    }
    if (
      command.type === 'mark-read' ||
      command.type === 'mark-unread' ||
      command.type === 'archive'
    ) {
      const targetState =
        command.type === 'mark-read'
          ? 'read'
          : command.type === 'mark-unread'
            ? 'unread'
            : 'archived';
      const { data, error } = await this.client.rpc('update_notification_state', {
        notification_id: command.notificationId,
        target_state: targetState
      });
      if (error) throw new Error('Unable to update Notification state.', { cause: error });
      return data;
    }
    if (command.type === 'watch' || command.type === 'mute') {
      const { data, error } = await this.client.rpc('set_notification_preference', {
        target_mode: command.type,
        target_repository_id: command.repositoryId,
        target_subject_id: command.subjectId,
        target_subject_type: command.subjectType
      });
      if (error) throw new Error('Unable to update Notification preference.', { cause: error });
      return data;
    }
    return false;
  }

  public async listAccessibleProjectItems(query: ProjectQuery): Promise<ProjectPage> {
    const { data, error } = await this.client.rpc('list_project_items', {
      requested_assignee_id: query.assigneeId ?? undefined,
      requested_label_id: query.labelId ?? undefined,
      requested_page: query.page,
      requested_sort: query.sort,
      requested_status: query.status,
      requested_type: query.type,
      target_repository_id: query.repositoryId ?? undefined
    });
    if (error) throw new Error('Unable to list the planning Projection.', { cause: error });
    const items: ProjectItem[] = data.map((row) => {
      if (!projectItemTypes.has(row.item_type)) {
        throw new Error('Planning Projection returned an unsupported Artifact type.');
      }
      return {
        createdAt: row.created_at,
        href: row.href,
        id: row.id,
        repositoryId: row.repository_id,
        status: row.status,
        title: row.title,
        type: row.item_type as ProjectItem['type'],
        updatedAt: row.updated_at
      };
    });
    return { items, total: data[0]?.total_count ?? 0 };
  }
}
