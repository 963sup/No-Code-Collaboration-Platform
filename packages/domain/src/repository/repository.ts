export const repositoryVisibilities = ['private', 'organization', 'public'] as const;

export type RepositoryVisibility = (typeof repositoryVisibilities)[number];

export interface RepositorySummary {
  readonly id: string;
  readonly organizationId: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string | null;
  readonly visibility: RepositoryVisibility;
}

const repositorySlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export function isRepositorySlug(value: string): boolean {
  return value.length >= 2 && value.length <= 64 && repositorySlugPattern.test(value);
}
