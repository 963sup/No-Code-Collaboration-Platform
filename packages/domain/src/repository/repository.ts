import type { RepositoryOwner } from './ownership';

export const repositoryVisibilities = ['private', 'public'] as const;

export type RepositoryVisibility = (typeof repositoryVisibilities)[number];

export interface RepositorySummary {
  readonly id: string;
  readonly owner: RepositoryOwner;
  readonly slug: string;
  readonly name: string;
  readonly description: string | null;
  readonly visibility: RepositoryVisibility;
}

export interface RepositoryDraft {
  readonly createdBy: string;
  readonly owner: RepositoryOwner;
  readonly slug: string;
  readonly name: string;
  readonly description: string | null;
  readonly visibility: RepositoryVisibility;
}

export interface CreateRepositoryDraftInput {
  readonly createdBy: string;
  readonly owner: RepositoryOwner;
  readonly slug: string;
  readonly name: string;
  readonly description?: string | null;
  readonly visibility: string;
}

const repositorySlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export function isRepositoryName(value: string): boolean {
  const normalized = value.trim();
  return normalized.length >= 1 && normalized.length <= 160;
}

export function isRepositorySlug(value: string): boolean {
  return value.length >= 2 && value.length <= 64 && repositorySlugPattern.test(value);
}

export function isRepositoryVisibility(value: string): value is RepositoryVisibility {
  return repositoryVisibilities.some((visibility) => visibility === value);
}

export function createRepositoryDraft(input: CreateRepositoryDraftInput): RepositoryDraft | null {
  const name = input.name.trim();
  const slug = input.slug.trim();
  const description = input.description?.trim() || null;
  const ownerId = input.owner.kind === 'user' ? input.owner.userId : input.owner.organizationId;

  if (
    input.createdBy.length === 0 ||
    ownerId.length === 0 ||
    !isRepositoryName(name) ||
    !isRepositorySlug(slug) ||
    !isRepositoryVisibility(input.visibility)
  ) {
    return null;
  }

  return {
    createdBy: input.createdBy,
    description,
    name,
    owner: input.owner,
    slug,
    visibility: input.visibility
  };
}
