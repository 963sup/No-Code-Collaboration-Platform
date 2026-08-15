import type { ProjectQuery, ProjectReader } from '../ports/collaboration-projections';

export class ListProjectItems {
  public constructor(private readonly reader: ProjectReader) {}

  public execute(input: {
    readonly assigneeId?: string;
    readonly labelId?: string;
    readonly page?: number;
    readonly repositoryId?: string;
    readonly sort?: string;
    readonly status?: string;
    readonly type?: string;
  }) {
    const query: ProjectQuery = {
      assigneeId: input.assigneeId || null,
      labelId: input.labelId || null,
      page:
        Number.isSafeInteger(input.page) && input.page && input.page > 0
          ? Math.min(input.page, 10_000)
          : 1,
      repositoryId: input.repositoryId || null,
      sort: input.sort === 'created' ? 'created' : 'updated',
      status: input.status?.trim().slice(0, 32) ?? '',
      type: ['all', 'page', 'issue', 'discussion'].includes(input.type ?? '')
        ? (input.type as ProjectQuery['type'])
        : 'all'
    };
    return this.reader.listAccessibleProjectItems(query);
  }
}
