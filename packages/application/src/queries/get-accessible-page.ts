import type { AccessiblePageQuery, PageReader } from '../ports/page-repository';

export class GetAccessiblePage {
  public constructor(private readonly pageReader: PageReader) {}

  public execute(query: AccessiblePageQuery) {
    return this.pageReader.findAccessiblePageById(query);
  }
}
