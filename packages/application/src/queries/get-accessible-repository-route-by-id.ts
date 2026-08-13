import type { RepositoryRouteReader } from '../ports/repository-route-reader';

export class GetAccessibleRepositoryRouteById {
  public constructor(private readonly repositoryRouteReader: RepositoryRouteReader) {}

  public execute(repositoryId: string) {
    return this.repositoryRouteReader.findAccessibleRepositoryRouteById(repositoryId);
  }
}
