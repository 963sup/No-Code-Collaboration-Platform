import type { RepositoryRouteReader } from '../ports/repository-route-reader';

export class ListAccessibleRepositoryRoutes {
  public constructor(private readonly repositoryRouteReader: RepositoryRouteReader) {}

  public execute() {
    return this.repositoryRouteReader.listAccessibleRepositoryRoutes();
  }
}
