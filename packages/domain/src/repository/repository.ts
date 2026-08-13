import type { RepositoryOwner } from './ownership';

export const repositoryVisibilities = ['private', 'public'] as const;

export type RepositoryVisibility = (typeof repositoryVisibilities)[number];

export interface RepositorySummary {
  readonly id: string;
  readonly owner: RepositoryOwner;
  /** @deprecated Use owner. Removed after executable ownership migration completes. */
  readonly organizationId: string | null;
  readonly slug: string;
  readonly name: string;
  readonly description: string | null;
  readonly visibility: RepositoryVisibility;
}

const repositorySlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export function isRepositorySlug(value: string): boolean {
  return value.length >= 2 && value.length <= 64 && repositorySlugPattern.test(value);
}
