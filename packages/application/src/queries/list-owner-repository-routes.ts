import type { OwnerProfileReader } from '../ports/owner-profile-reader';

export class ListOwnerRepositoryRoutes {
  public constructor(private readonly ownerProfileReader: OwnerProfileReader) {}

  public execute(ownerSlug: string) {
    return this.ownerProfileReader.listAccessibleOwnerRepositoryRoutes(ownerSlug);
  }
}
