import type { RepositoryReader } from '../ports/repository-reader';

export class GetAccessibleRepository {
  public constructor(private readonly repositoryReader: RepositoryReader) {}

  public execute(repositoryId: string) {
    return this.repositoryReader.findAccessibleRepositoryById(repositoryId);
  }
}
