import { describe, expect, it } from 'vitest';

import {
  canCommentOnDiscussion,
  canSelectDiscussionAnswer,
  isDiscussionCategory,
  isDiscussionNumber,
  isDiscussionTitle,
  isDiscussionVersion
} from '../src/index';

describe('Discussion Resource', () => {
  it('accepts only locked v1 categories and Repository-local identity', () => {
    expect(isDiscussionCategory('general')).toBe(true);
    expect(isDiscussionCategory('question')).toBe(true);
    expect(isDiscussionCategory('announcement')).toBe(true);
    expect(isDiscussionCategory('forum')).toBe(false);
    expect(isDiscussionNumber(1)).toBe(true);
    expect(isDiscussionNumber(0)).toBe(false);
    expect(isDiscussionVersion(1)).toBe(true);
    expect(isDiscussionVersion(1.5)).toBe(false);
    expect(isDiscussionTitle('How should onboarding work?')).toBe(true);
  });

  it('keeps closed state absolute while locked state permits elevated comment authority', () => {
    expect(
      canCommentOnDiscussion({ canCommentWhenLocked: false, isLocked: false, status: 'open' })
    ).toBe(true);
    expect(
      canCommentOnDiscussion({ canCommentWhenLocked: false, isLocked: true, status: 'open' })
    ).toBe(false);
    expect(
      canCommentOnDiscussion({ canCommentWhenLocked: true, isLocked: true, status: 'open' })
    ).toBe(true);
    expect(
      canCommentOnDiscussion({ canCommentWhenLocked: true, isLocked: false, status: 'closed' })
    ).toBe(false);
  });

  it('allows Answer selection only for a comment in a question Discussion', () => {
    expect(canSelectDiscussionAnswer('question', true)).toBe(true);
    expect(canSelectDiscussionAnswer('general', true)).toBe(false);
    expect(canSelectDiscussionAnswer('question', false)).toBe(false);
  });
});
