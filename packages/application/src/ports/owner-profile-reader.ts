import type { RepositoryRouteSummary } from './repository-route-reader';

export type OwnerProfileKind = 'organization' | 'user';

export interface OwnerProfile {
  readonly avatarUrl: string | null;
  readonly displayName: string | null;
  readonly id: string;
  readonly kind: OwnerProfileKind;
  readonly slug: string;
}

export interface OwnerProfileReader {
  findOwnerProfileBySlug(ownerSlug: string): Promise<OwnerProfile | null>;
  listAccessibleOwnerRepositoryRoutes(
    ownerSlug: string
  ): Promise<readonly RepositoryRouteSummary[]>;
}
