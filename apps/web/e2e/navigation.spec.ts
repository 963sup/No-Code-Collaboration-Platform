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

test('GitHub-aligned dashboard remains authenticated-only', async ({ page }) => {
  await page.goto('/dashboard');

  await expectSignInRedirect(page, '/dashboard');
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

test('canonical Wiki hard navigation remains outside the authenticated dashboard wrapper', async ({
  page
}) => {
  const wikiPath = '/example-owner/example-repository/wiki';
  const response = await page.goto(wikiPath);

  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(wikiPath);
  await expect(page).not.toHaveURL(/\/sign-in/u);
});

test('canonical Wiki Page detail preserves Owner and Repository identity', async ({ page }) => {
  const pagePath = '/example-owner/example-repository/wiki/00000000-0000-4000-8000-000000000002';
  const response = await page.goto(pagePath);

  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(pagePath);
  await expect(page).not.toHaveURL(/\/sign-in/u);
});
