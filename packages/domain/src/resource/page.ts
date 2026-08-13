export const pageResourceKind = 'page' as const;
export const pageTitleMaxLength = 240;

export interface PageContent {
  readonly body: string;
}

export interface PageSummary {
  readonly createdAt: string;
  readonly createdBy: string;
  readonly id: string;
  readonly kind: typeof pageResourceKind;
  readonly repositoryId: string;
  readonly title: string;
  readonly updatedAt: string;
}

export interface PageDetail extends PageSummary {
  readonly content: PageContent;
}

export interface PageDraft {
  readonly content: PageContent;
  readonly createdBy: string;
  readonly kind: typeof pageResourceKind;
  readonly repositoryId: string;
  readonly title: string;
}

export interface PageUpdate {
  readonly content: PageContent;
  readonly expectedUpdatedAt: string;
  readonly id: string;
  readonly repositoryId: string;
  readonly title: string;
}

export function isPageContent(value: unknown): value is PageContent {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

  const candidate = value as Record<string, unknown>;
  return Object.keys(candidate).length === 1 && typeof candidate.body === 'string';
}

export function isPageTitle(value: string): boolean {
  const title = value.trim();
  return title.length >= 1 && title.length <= pageTitleMaxLength;
}

export function createPageDraft(input: {
  readonly createdBy: string;
  readonly repositoryId: string;
  readonly title: string;
}): PageDraft | null {
  const title = input.title.trim();
  if (!input.createdBy || !input.repositoryId || !isPageTitle(title)) return null;

  return {
    content: { body: '' },
    createdBy: input.createdBy,
    kind: pageResourceKind,
    repositoryId: input.repositoryId,
    title
  };
}

export function createPageUpdate(input: {
  readonly body: string;
  readonly expectedUpdatedAt: string;
  readonly id: string;
  readonly repositoryId: string;
  readonly title: string;
}): PageUpdate | null {
  const title = input.title.trim();
  if (!input.expectedUpdatedAt || !input.id || !input.repositoryId || !isPageTitle(title)) {
    return null;
  }

  return {
    content: { body: input.body },
    expectedUpdatedAt: input.expectedUpdatedAt,
    id: input.id,
    repositoryId: input.repositoryId,
    title
  };
}
