export type RepositoryOwner =
  | { readonly kind: 'user'; readonly userId: string }
  | { readonly kind: 'organization'; readonly organizationId: string };
