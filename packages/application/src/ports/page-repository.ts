import type {
  PageDetail,
  PageDraft,
  PageSummary,
  PageUpdate
} from '@no-code-collaboration-platform/domain';

export interface AccessiblePageQuery {
  readonly pageId: string;
  readonly repositoryId: string;
}

export interface PageReader {
  findAccessiblePageById(query: AccessiblePageQuery): Promise<PageDetail | null>;
  listAccessiblePages(repositoryId: string): Promise<readonly PageSummary[]>;
}

export interface PageWriter {
  createPage(page: PageDraft): Promise<PageDetail | null>;
  updatePage(page: PageUpdate): Promise<PageDetail | null>;
}
