import { describe, expect, it } from 'vitest';

import {
  createPageDraft,
  createPageUpdate,
  isPageContent,
  isPageTitle,
  pageTitleMaxLength
} from '../src/index';

describe('Page Resource', () => {
  it('creates a blank Page draft with a normalized title', () => {
    expect(
      createPageDraft({
        createdBy: 'user-1',
        repositoryId: 'repository-1',
        title: '  Product brief  '
      })
    ).toEqual({
      content: { body: '' },
      createdBy: 'user-1',
      kind: 'page',
      repositoryId: 'repository-1',
      title: 'Product brief'
    });
  });

  it('rejects empty and overlong Page titles', () => {
    expect(isPageTitle('   ')).toBe(false);
    expect(isPageTitle('x'.repeat(pageTitleMaxLength + 1))).toBe(false);
    expect(
      createPageDraft({ createdBy: 'user-1', repositoryId: 'repository-1', title: ' ' })
    ).toBeNull();
  });

  it('preserves Page body content while normalizing update titles', () => {
    expect(
      createPageUpdate({
        body: 'A durable collaboration note.',
        expectedUpdatedAt: '2026-08-12T00:00:00.000Z',
        id: 'page-1',
        repositoryId: 'repository-1',
        title: '  Architecture note '
      })
    ).toEqual({
      content: { body: 'A durable collaboration note.' },
      expectedUpdatedAt: '2026-08-12T00:00:00.000Z',
      id: 'page-1',
      repositoryId: 'repository-1',
      title: 'Architecture note'
    });
  });

  it('accepts only the explicit Page content shape', () => {
    expect(isPageContent({ body: 'text' })).toBe(true);
    expect(isPageContent({})).toBe(false);
    expect(isPageContent({ body: 1 })).toBe(false);
    expect(isPageContent({ body: 'text', hidden: true })).toBe(false);
  });
});
