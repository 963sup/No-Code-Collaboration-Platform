import { expect, test } from '@playwright/test';

const userSlug = 'sup-demo';
const organizationSlug = 'demo-organization';

test('one Owner namespace URL resolves User and Organization by persisted kind, not path shape', async ({
  page
}) => {
  await page.goto(`/${userSlug}`);
  await expect(page).toHaveURL(`/${userSlug}`);
  await expect(page.getByRole('heading', { name: 'Sup Demo', exact: true })).toBeVisible();
  await expect(page.getByText('User', { exact: true })).toBeVisible();

  await page.goto(`/${organizationSlug}`);
  await expect(page).toHaveURL(`/${organizationSlug}`);
  await expect(page.getByRole('heading', { name: 'Demo Organization', exact: true })).toBeVisible();
  await expect(page.getByText('Organization', { exact: true })).toBeVisible();
});

test('Owner profile tabs are query Context while Overview is the bare identity path', async ({
  page
}) => {
  await page.goto(`/${userSlug}?tab=repositories`);
  await expect(page).toHaveURL(`/${userSlug}?tab=repositories`);
  await expect(page.getByRole('link', { name: 'Repositories' })).toHaveAttribute(
    'aria-current',
    'page'
  );

  await page.goto(`/${userSlug}?tab=stars`);
  await expect(page).toHaveURL(`/${userSlug}?tab=stars`);
  const starsHeading = page.getByRole('heading', { name: 'Stars', exact: true });
  await expect(starsHeading).toBeVisible();
  await expect(starsHeading.locator('..').getByText('deferred', { exact: true })).toBeVisible();

  await page.goto(`/${userSlug}?tab=projects`);
  await expect(page).toHaveURL(`/${userSlug}?tab=projects`);
  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();

  await page.goto(`/${userSlug}?tab=overview`);
  await expect(page).toHaveURL(`/${userSlug}`);
  await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
});

test('anonymous Owner Repository projection never leaks a private Repository', async ({ page }) => {
  await page.goto(`/${organizationSlug}?tab=repositories`);
  await expect(page.getByText('Demo Repository', { exact: true })).toHaveCount(0);
  await expect(page.getByText('No visible repositories', { exact: true })).toBeVisible();

  await page.goto(`/sign-in?next=${encodeURIComponent(`/${organizationSlug}?tab=repositories`)}`);
  await page.getByLabel('Email').fill('sup@a-i.tw');
  await page.getByLabel('Password').fill('Aa12341234');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(`/${organizationSlug}?tab=repositories`);
  await expect(page.getByText('Demo Repository', { exact: true })).toBeVisible();
});
