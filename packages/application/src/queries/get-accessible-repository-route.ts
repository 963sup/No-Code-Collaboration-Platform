import type {
  RepositoryRouteKey,
  RepositoryRouteReader
} from '../ports/repository-route-reader';

export class GetAccessibleRepositoryRoute {
  public constructor(private readonly repositoryRouteReader: RepositoryRouteReader) {}

  public execute(key: RepositoryRouteKey) {
    return this.repositoryRouteReader.findAccessibleRepositoryRouteByKey(key);
  }
}
