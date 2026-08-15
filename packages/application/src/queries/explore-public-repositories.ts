import {
  exploreSorts,
  type ExploreQuery,
  type ExploreReader
} from '../ports/collaboration-projections';

export interface ExplorePublicRepositoriesInput {
  readonly artifactType?: string;
  readonly ownerType?: string;
  readonly page?: number;
  readonly sort?: string;
}

export class ExplorePublicRepositories {
  public constructor(private readonly reader: ExploreReader) {}

  public execute(input: ExplorePublicRepositoriesInput) {
    const query: ExploreQuery = {
      artifactType: ['all', 'page', 'issue', 'discussion'].includes(input.artifactType ?? '')
        ? (input.artifactType as ExploreQuery['artifactType'])
        : 'all',
      ownerType: ['all', 'user', 'organization'].includes(input.ownerType ?? '')
        ? (input.ownerType as ExploreQuery['ownerType'])
        : 'all',
      page:
        Number.isSafeInteger(input.page) && input.page && input.page > 0
          ? Math.min(input.page, 10_000)
          : 1,
      sort: exploreSorts.includes(input.sort as never)
        ? (input.sort as ExploreQuery['sort'])
        : 'recent'
    };
    return this.reader.explorePublicRepositories(query);
  }
}
