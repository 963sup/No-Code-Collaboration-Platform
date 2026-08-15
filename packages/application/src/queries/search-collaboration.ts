import {
  collaborationSearchSorts,
  collaborationSearchTypes,
  type CollaborationSearchQuery,
  type CollaborationSearchReader
} from '../ports/collaboration-projections';

export interface SearchCollaborationInput {
  readonly owner?: string;
  readonly page?: number;
  readonly query?: string;
  readonly repository?: string;
  readonly sort?: string;
  readonly status?: string;
  readonly type?: string;
}

function pageNumber(value: number | undefined) {
  return Number.isSafeInteger(value) && value && value > 0 ? Math.min(value, 10_000) : 1;
}

export class SearchCollaboration {
  public constructor(private readonly reader: CollaborationSearchReader) {}

  public execute(input: SearchCollaborationInput) {
    const query: CollaborationSearchQuery = {
      owner: input.owner?.trim().toLowerCase().slice(0, 64) ?? '',
      page: pageNumber(input.page),
      query: input.query?.trim().slice(0, 200) ?? '',
      repository: input.repository?.trim().toLowerCase().slice(0, 64) ?? '',
      sort: collaborationSearchSorts.includes(input.sort as never)
        ? (input.sort as CollaborationSearchQuery['sort'])
        : 'relevance',
      status: input.status === 'open' || input.status === 'closed' ? input.status : 'all',
      type: collaborationSearchTypes.includes(input.type as never)
        ? (input.type as CollaborationSearchQuery['type'])
        : 'all'
    };
    return this.reader.searchAccessibleCollaboration(query);
  }
}
