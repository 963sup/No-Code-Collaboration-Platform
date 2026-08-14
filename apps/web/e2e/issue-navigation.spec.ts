import { resolve } from 'node:path';

import { expect, test } from '@playwright/test';

const repositoryPath = '/demo-organization/demo-repository';
const issuesPath = `${repositoryPath}/issues`;
const issuePath = `${issuesPath}/1`;

test.beforeEach(async ({ page }) => {
  await page.goto(`/sign-in?next=${encodeURIComponent(issuesPath)}`);
  await page.getByLabel('Email').fill('sup@a-i.tw');
  await page.getByLabel('Password').fill('Aa12341234');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(issuesPath);
});

test('Issue list preserves Repository-scoped URL state and responsive supporting navigation', async ({
  page
}) => {
  await expect(page.getByRole('heading', { name: 'All issues' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'New issue' })).toBeDisabled();
  await expect(
    page.getByRole('link', { name: 'Clarify the customer onboarding handoff' })
  ).toBeVisible();

  for (const viewport of [
    { height: 900, name: 'desktop', width: 1440 },
    { height: 800, name: 'laptop', width: 1280 },
    { height: 1024, name: 'tablet', width: 768 },
    { height: 844, name: 'mobile', width: 390 }
  ]) {
    await page.setViewportSize(viewport);
    const issueNavigation = page.getByRole('complementary', { name: 'Issue navigation' });
    await expect(issueNavigation).toBeVisible();

    if (viewport.name === 'mobile') {
      await expect(issueNavigation.getByText('Issue views')).toBeVisible();
      const navigationBox = await issueNavigation.boundingBox();
      const headingBox = await page.getByRole('heading', { name: 'All issues' }).boundingBox();
      expect(navigationBox?.y).toBeLessThan(headingBox?.y ?? 0);
    } else {
      await expect(issueNavigation.getByRole('navigation', { name: 'Issue views' })).toBeVisible();
    }

    if (process.env.CAPTURE_PLAYWRIGHT_MCP === '1') {
      await page.screenshot({
        fullPage: true,
        path: resolve(
          process.cwd(),
          '.playwright-mcp/github/repositories/369sup/support/issues/screenshots',
          `target-issues-list-${viewport.name}-default.png`
        )
      });
    }
  }

  await page.getByLabel('Search issues').fill('missing work');
  await page.getByRole('button', { name: 'Submit issue search' }).click();
  await expect(page).toHaveURL(`${issuesPath}?q=missing+work`);
  await expect(page.getByText('No issues match this view')).toBeVisible();
});

test('Issue soft navigation, Back, Forward, refresh, and direct URL share canonical identity', async ({
  page
}) => {
  await page.getByRole('link', { name: 'Clarify the customer onboarding handoff' }).click();
  await expect(page).toHaveURL(issuePath);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByText('Document the owner')).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(issuesPath);
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.goForward();
  await expect(page).toHaveURL(issuePath);
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(issuePath);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: /Clarify the customer onboarding handoff/u })
  ).toBeVisible();

  await page.goto(issuePath);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('Issue', { exact: true }).last()).toBeVisible();
});
