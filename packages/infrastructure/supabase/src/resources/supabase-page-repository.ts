import type {
  AccessiblePageQuery,
  PageReader,
  PageWriter
} from '@no-code-collaboration-platform/application';
import type {
  PageDetail,
  PageDraft,
  PageSummary,
  PageUpdate
} from '@no-code-collaboration-platform/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../generated/database.types';
import {
  mapSupabasePageRow,
  mapSupabasePageSummaryRow
} from '../mappers/supabase-page-mapper';

const pageProjection =
  'id, repository_id, kind, title, content, created_by, created_at, updated_at';
const accessDeniedCodes = new Set(['42501', 'PGRST301']);

export class SupabasePageRepository implements PageReader, PageWriter {
  public constructor(private readonly client: SupabaseClient<Database>) {}

  public async findAccessiblePageById(query: AccessiblePageQuery): Promise<PageDetail | null> {
    const { data, error } = await this.client
      .from('resources')
      .select(pageProjection)
      .eq('id', query.pageId)
      .eq('repository_id', query.repositoryId)
      .eq('kind', 'page')
      .maybeSingle();

    if (error) throw new Error('Unable to load the accessible Page.', { cause: error });
    return data ? mapSupabasePageRow(data) : null;
  }

  public async listAccessiblePages(repositoryId: string): Promise<readonly PageSummary[]> {
    const { data, error } = await this.client
      .from('resources')
      .select(pageProjection)
      .eq('repository_id', repositoryId)
      .eq('kind', 'page')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Unable to list accessible Pages.', { cause: error });
    return data.map(mapSupabasePageSummaryRow);
  }

  public async createPage(page: PageDraft): Promise<PageDetail | null> {
    const { data, error } = await this.client
      .from('resources')
      .insert({
        content: { body: page.content.body },
        created_by: page.createdBy,
        kind: page.kind,
        repository_id: page.repositoryId,
        title: page.title
      })
      .select(pageProjection)
      .single();

    if (error) {
      if (accessDeniedCodes.has(error.code)) return null;
      throw new Error('Unable to create the Page.', { cause: error });
    }
    return mapSupabasePageRow(data);
  }

  public async updatePage(page: PageUpdate): Promise<PageDetail | null> {
    const { data, error } = await this.client
      .from('resources')
      .update({
        content: { body: page.content.body },
        title: page.title
      })
      .eq('id', page.id)
      .eq('repository_id', page.repositoryId)
      .eq('kind', 'page')
      .eq('updated_at', page.expectedUpdatedAt)
      .select(pageProjection)
      .maybeSingle();

    if (error) {
      if (accessDeniedCodes.has(error.code)) return null;
      throw new Error('Unable to update the Page.', { cause: error });
    }
    return data ? mapSupabasePageRow(data) : null;
  }
}
