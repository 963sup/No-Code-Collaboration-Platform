import { isRepositoryOwnerSlug } from '../repository/ownership';

export interface OrganizationSummary {
  readonly createdBy: string;
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}

export interface OrganizationDraft {
  readonly createdBy: string;
  readonly name: string;
  readonly slug: string;
}

export interface CreateOrganizationDraftInput {
  readonly createdBy: string;
  readonly name: string;
  readonly slug: string;
}

const organizationSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export function isOrganizationName(value: string): boolean {
  const normalized = value.trim();
  return normalized.length >= 1 && normalized.length <= 120;
}

export function isOrganizationSlug(value: string): boolean {
  return (
    value.length >= 2 &&
    value.length <= 64 &&
    organizationSlugPattern.test(value) &&
    isRepositoryOwnerSlug(value)
  );
}

export function createOrganizationDraft(
  input: CreateOrganizationDraftInput
): OrganizationDraft | null {
  const name = input.name.trim();
  const slug = input.slug.trim();

  if (input.createdBy.length === 0 || !isOrganizationName(name) || !isOrganizationSlug(slug)) {
    return null;
  }

  return {
    createdBy: input.createdBy,
    name,
    slug
  };
}
