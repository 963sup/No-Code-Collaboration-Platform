import { expect, test, type Page } from '@playwright/test';

async function expectSignInRedirect(page: Page, nextPath: string) {
  await expect(page).toHaveURL(/\/sign-in/u);
  const location = new URL(page.url());
  expect(location.pathname).toBe('/sign-in');
  expect(location.searchParams.get('next')).toBe(nextPath);
}

test('public route presents the product model', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Reverse-engineer mature collaboration semantics'
  );
  await expect(page.getByRole('link', { name: 'Sign in' }).first()).toHaveAttribute(
    'href',
    '/sign-in'
  );
});

test('auth route group does not change the human URL', async ({ page }) => {
  await page.goto('/sign-in');

  await expect(page).toHaveURL(/\/sign-in$/u);
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

test('dashboard remains authenticated-only', async ({ page }) => {
  await page.goto('/app');

  await expectSignInRedirect(page, '/app');
});

test('Repository creation preserves its authenticated destination', async ({ page }) => {
  await page.goto('/new');

  await expectSignInRedirect(page, '/new');
});

test('Organization creation preserves its authenticated destination', async ({ page }) => {
  await page.goto('/organizations/new');

  await expectSignInRedirect(page, '/organizations/new');
});

test('canonical Repository route is not forced through dashboard authentication', async ({
  page
}) => {
  const repositoryPath = '/example-owner/example-repository';
  const response = await page.goto(repositoryPath);

  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(repositoryPath);
  await expect(page).not.toHaveURL(/\/sign-in/u);
});

test('canonical Page collection hard navigation remains outside the authenticated dashboard wrapper', async ({
  page
}) => {
  const pagesPath = '/example-owner/example-repository/pages';
  const response = await page.goto(pagesPath);

  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(pagesPath);
  await expect(page).not.toHaveURL(/\/sign-in/u);
});

test('canonical Page detail hard navigation preserves Owner and Repository identity', async ({
  page
}) => {
  const pagePath = '/example-owner/example-repository/pages/00000000-0000-4000-8000-000000000002';
  const response = await page.goto(pagePath);

  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(pagePath);
  await expect(page).not.toHaveURL(/\/sign-in/u);
});
