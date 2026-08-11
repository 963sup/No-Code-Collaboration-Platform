import { describe, expect, it, vi } from 'vitest';

import {
  GetAccessiblePage,
  ListAccessiblePages,
  ListRepositoryActivity,
  type ActivityEventReader,
  type PageReader
} from '../src/index';

const page = {
  content: { body: '' },
  createdAt: '2026-08-12T00:00:00.000Z',
  createdBy: 'user-1',
  id: 'page-1',
  kind: 'page' as const,
  repositoryId: 'repository-1',
  title: 'Page',
  updatedAt: '2026-08-12T00:00:00.000Z'
};

describe('Page queries', () => {
  it('lists only the adapter-provided accessible Page projection', async () => {
    const listAccessiblePages = vi.fn().mockResolvedValue([page]);
    const reader: PageReader = {
      async findAccessiblePageById() {
        return null;
      },
      listAccessiblePages
    };

    await expect(new ListAccessiblePages(reader).execute(page.repositoryId)).resolves.toEqual([page]);
    expect(listAccessiblePages).toHaveBeenCalledWith(page.repositoryId);
  });

  it('loads one Page through stable Repository and Page identities', async () => {
    const findAccessiblePageById = vi.fn().mockResolvedValue(page);
    const reader: PageReader = {
      findAccessiblePageById,
      async listAccessiblePages() {
        return [];
      }
    };

    await expect(
      new GetAccessiblePage(reader).execute({ pageId: page.id, repositoryId: page.repositoryId })
    ).resolves.toEqual(page);
    expect(findAccessiblePageById).toHaveBeenCalledWith({
      pageId: page.id,
      repositoryId: page.repositoryId
    });
  });
});

describe('Repository activity query', () => {
  it('bounds projection size before calling the adapter', async () => {
    const listAccessibleRepositoryActivity = vi.fn().mockResolvedValue([]);
    const reader: ActivityEventReader = { listAccessibleRepositoryActivity };

    await new ListRepositoryActivity(reader).execute({
      limit: 500,
      repositoryId: page.repositoryId
    });

    expect(listAccessibleRepositoryActivity).toHaveBeenCalledWith(page.repositoryId, 50);
  });
});
