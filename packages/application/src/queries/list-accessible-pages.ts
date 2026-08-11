import type { PageReader } from '../ports/page-repository';

export class ListAccessiblePages {
  public constructor(private readonly pageReader: PageReader) {}

  public execute(repositoryId: string) {
    return this.pageReader.listAccessiblePages(repositoryId);
  }
}
