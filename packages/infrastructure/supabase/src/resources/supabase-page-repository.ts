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
import { mapSupabasePageRow, mapSupabasePageSummaryRow } from './supabase-page-mapper';

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
    const { data, error } = await this.client.rpc('create_page', {
      page_title: page.title,
      target_repository_id: page.repositoryId
    });

    if (error) {
      if (accessDeniedCodes.has(error.code)) return null;
      throw new Error('Unable to create the Page.', { cause: error });
    }

    const row = data[0];
    if (!row) throw new Error('The Page command did not return the created Page.');
    return mapSupabasePageRow(row);
  }

  public async updatePage(page: PageUpdate): Promise<PageDetail | null> {
    const { data, error } = await this.client.rpc('update_page', {
      expected_updated_at: page.expectedUpdatedAt,
      page_body: page.content.body,
      page_id: page.id,
      page_title: page.title,
      target_repository_id: page.repositoryId
    });

    if (error) {
      if (accessDeniedCodes.has(error.code)) return null;
      throw new Error('Unable to update the Page.', { cause: error });
    }

    const row = data[0];
    return row ? mapSupabasePageRow(row) : null;
  }
}
