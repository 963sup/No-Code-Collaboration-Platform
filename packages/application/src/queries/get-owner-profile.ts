import type { OwnerProfileReader } from '../ports/owner-profile-reader';

export class GetOwnerProfile {
  public constructor(private readonly ownerProfileReader: OwnerProfileReader) {}

  public execute(ownerSlug: string) {
    return this.ownerProfileReader.findOwnerProfileBySlug(ownerSlug);
  }
}
