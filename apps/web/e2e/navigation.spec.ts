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

test('auth route is grouped without changing its URL', async ({ page }) => {
  await page.goto('/sign-in');

  await expect(page).toHaveURL(/\/sign-in$/u);
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

test('protected app route redirects an unauthenticated actor', async ({ page }) => {
  await page.goto('/app');

  await expectSignInRedirect(page, '/app');
});

test('nested Repository workspace preserves the requested URL through authentication', async ({
  page
}) => {
  const repositoryPath = '/app/repositories/00000000-0000-4000-8000-000000000001';

  await page.goto(repositoryPath);

  await expectSignInRedirect(page, repositoryPath);
});

test('hard navigation preserves a nested Parallel Route destination through authentication', async ({
  page
}) => {
  const resourcesPath = '/app/repositories/00000000-0000-4000-8000-000000000001/resources';

  await page.goto(resourcesPath);

  await expectSignInRedirect(page, resourcesPath);
});

test('Page workspace identity survives authentication redirect', async ({ page }) => {
  const pagePath =
    '/app/repositories/00000000-0000-4000-8000-000000000001/resources/' +
    '00000000-0000-4000-8000-000000000002';

  await page.goto(pagePath);

  await expectSignInRedirect(page, pagePath);
});
