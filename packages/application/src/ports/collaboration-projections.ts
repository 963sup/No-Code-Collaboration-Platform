export const collaborationSearchTypes = [
  'all',
  'repository',
  'page',
  'issue',
  'discussion',
  'project'
] as const;
export const collaborationSearchSorts = ['relevance', 'updated', 'created'] as const;
export const exploreSorts = ['recent', 'new'] as const;
export const notificationStates = ['unread', 'read', 'archived'] as const;

export type CollaborationSearchType = (typeof collaborationSearchTypes)[number];
export type CollaborationSearchSort = (typeof collaborationSearchSorts)[number];
export type ExploreSort = (typeof exploreSorts)[number];
export type NotificationState = (typeof notificationStates)[number];

export interface CollaborationSearchQuery {
  readonly owner: string;
  readonly page: number;
  readonly query: string;
  readonly repository: string;
  readonly sort: CollaborationSearchSort;
  readonly status: string;
  readonly type: CollaborationSearchType;
}

export interface CollaborationSearchResult {
  readonly bodySnippet: string;
  readonly createdAt: string;
  readonly href: string;
  readonly id: string;
  readonly repositoryId: string;
  readonly title: string;
  readonly type: Exclude<CollaborationSearchType, 'all'>;
  readonly updatedAt: string;
}

export interface CollaborationSearchPage {
  readonly results: readonly CollaborationSearchResult[];
  readonly total: number;
}

export interface CollaborationSearchReader {
  searchAccessibleCollaboration(query: CollaborationSearchQuery): Promise<CollaborationSearchPage>;
}

export interface ExploreQuery {
  readonly artifactType: string | 'all';
  readonly ownerType: 'all' | 'organization' | 'user';
  readonly page: number;
  readonly sort: ExploreSort;
}

export interface ExploreRepositoryResult {
  readonly description: string | null;
  readonly href: string;
  readonly id: string;
  readonly lastPublicActivityAt: string;
  readonly name: string;
  readonly ownerSlug: string;
  readonly ownerType: 'organization' | 'user';
  readonly slug: string;
}

export interface ExplorePage {
  readonly repositories: readonly ExploreRepositoryResult[];
  readonly total: number;
}

export interface ExploreReader {
  explorePublicRepositories(query: ExploreQuery): Promise<ExplorePage>;
}

export interface ProjectItem {
  readonly createdAt: string;
  readonly href: string;
  readonly id: string;
  readonly repositoryId: string;
  readonly status: string;
  readonly title: string;
  readonly type: 'discussion' | 'issue' | 'page';
  readonly updatedAt: string;
}

export interface ProjectQuery {
  readonly assigneeId: string | null;
  readonly labelId: string | null;
  readonly page: number;
  readonly repositoryId: string | null;
  readonly sort: 'created' | 'updated';
  readonly status: string;
  readonly type: 'all' | 'discussion' | 'issue' | 'page';
}

export interface ProjectPage {
  readonly items: readonly ProjectItem[];
  readonly total: number;
}

export interface ProjectReader {
  listAccessibleProjectItems(query: ProjectQuery): Promise<ProjectPage>;
}

export interface NotificationThread {
  readonly artifactType: 'discussion' | 'issue' | 'page' | 'repository';
  readonly eventCount: number;
  readonly href: string;
  readonly id: string;
  readonly reason: 'assigned' | 'mentioned' | 'participating' | 'watching';
  readonly repositoryId: string;
  readonly sourceEvidenceId: number;
  readonly state: NotificationState;
  readonly title: string;
  readonly updatedAt: string;
}

export interface NotificationQuery {
  readonly page: number;
  readonly state: NotificationState | 'all';
}

export interface NotificationPage {
  readonly notifications: readonly NotificationThread[];
  readonly total: number;
}

export interface NotificationReader {
  listAccessibleNotifications(query: NotificationQuery): Promise<NotificationPage>;
}

export type NotificationCommand =
  | { readonly notificationId: string; readonly type: 'archive' | 'mark-read' | 'mark-unread' }
  | { readonly type: 'mark-all-read' }
  | {
      readonly repositoryId: string;
      readonly subjectId: string;
      readonly subjectType: 'discussion' | 'issue' | 'repository';
      readonly type: 'mute' | 'watch';
    };

export interface NotificationWriter {
  executeNotificationCommand(command: NotificationCommand): Promise<boolean>;
}
