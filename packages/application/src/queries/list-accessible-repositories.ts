import type { RepositoryReader } from '../ports/repository-reader';

export class ListAccessibleRepositories {
  public constructor(private readonly repositoryReader: RepositoryReader) {}

  public execute() {
    return this.repositoryReader.listAccessibleRepositories();
  }
}
