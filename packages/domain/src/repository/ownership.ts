export type RepositoryOwner =
  | { readonly kind: 'user'; readonly userId: string }
  | { readonly kind: 'organization'; readonly organizationId: string };

export const repositoryOwnerReservedSlugs = [
  'app',
  'auth',
  'forgot-password',
  'new',
  'organizations',
  'recover-password',
  'reset-password',
  'settings',
  'sign-in',
  'sign-up',
  'verify-email'
] as const;

export function isRepositoryOwnerSlug(value: string): boolean {
  return !repositoryOwnerReservedSlugs.some((reservedSlug) => reservedSlug === value);
}
