import {
  isPageContent,
  type PageDetail,
  type PageSummary
} from '@no-code-collaboration-platform/domain/resource';

import type { Database } from '../generated/database.types';

type ResourceRow = Database['public']['Tables']['resources']['Row'];

type PageProjectionRow = Pick<
  ResourceRow,
  'content' | 'created_at' | 'created_by' | 'id' | 'kind' | 'repository_id' | 'title' | 'updated_at'
>;

export function mapSupabasePageRow(row: PageProjectionRow): PageDetail {
  if (row.kind !== 'page' || !isPageContent(row.content)) {
    throw new Error('The Resource row does not satisfy the Page contract.');
  }

  return {
    content: row.content,
    createdAt: row.created_at,
    createdBy: row.created_by,
    id: row.id,
    kind: row.kind,
    repositoryId: row.repository_id,
    title: row.title,
    updatedAt: row.updated_at
  };
}

export function mapSupabasePageSummaryRow(row: PageProjectionRow): PageSummary {
  const page = mapSupabasePageRow(row);
  return {
    createdAt: page.createdAt,
    createdBy: page.createdBy,
    id: page.id,
    kind: page.kind,
    repositoryId: page.repositoryId,
    title: page.title,
    updatedAt: page.updatedAt
  };
}
