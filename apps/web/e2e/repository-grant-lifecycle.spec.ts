import { expect, test, type Page } from '@playwright/test';

test.describe.configure({ retries: 0 });

const repositoryPath = '/demo-organization/demo-repository';
const accessPath = `${repositoryPath}/settings/access`;
const wikiPath = `${repositoryPath}/wiki`;

async function signIn(page: Page, email: string, password: string, destination = '/dashboard') {
  await page.goto(`/sign-in?next=${encodeURIComponent(destination)}`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(destination);
}

async function signOut(page: Page) {
  await page.getByRole('button', { name: 'User menu' }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await expect(page).toHaveURL('/');
}

test('Direct Repository Grant create, role change, and revoke form one complete two-User collaboration loop', async ({
  page
}) => {
  test.setTimeout(180_000);

  await signIn(page, 'collaborator@a-i.tw', 'Bb12341234');
  await expect(page.getByText('Demo Repository', { exact: true })).toHaveCount(0);
  let response = await page.goto(repositoryPath);
  expect(response?.status()).toBe(404);
  await page.goto('/dashboard');
  await signOut(page);

  await signIn(page, 'sup@a-i.tw', 'Aa12341234', accessPath);
  await page.getByLabel('User username').fill('collaborator-demo');
  await page.getByLabel('Role').selectOption('write');
  await page.getByRole('button', { name: 'Grant access' }).click();
  await expect(page).toHaveURL(`${accessPath}?saved=1`);
  await expect(page.getByText('@collaborator-demo', { exact: true })).toBeVisible();
  await expect(page.getByText('write', { exact: true }).last()).toBeVisible();
  await signOut(page);

  await signIn(page, 'collaborator@a-i.tw', 'Bb12341234');
  await expect(page.getByText('Demo Repository', { exact: true })).toBeVisible();
  await page.goto(wikiPath);
  await page.getByLabel('Page title').fill('Grant lifecycle proof');
  await page.getByRole('button', { name: 'Create Page' }).click();
  await expect(page).toHaveURL(new RegExp(`${wikiPath}/[0-9a-f-]+$`, 'u'));
  const createdPagePath = new URL(page.url()).pathname;

  await page.goto('/search?q=Grant+lifecycle+proof');
  await expect(page.getByText('Grant lifecycle proof', { exact: true })).toBeVisible();
  await signOut(page);

  await signIn(page, 'sup@a-i.tw', 'Aa12341234', accessPath);
  await page.getByLabel('New role for collaborator-demo').selectOption('read');
  await page.getByRole('button', { name: 'Change role' }).click();
  await expect(page).toHaveURL(`${accessPath}?saved=1`);
  await expect(page.getByText('read', { exact: true }).last()).toBeVisible();
  await signOut(page);

  await signIn(page, 'collaborator@a-i.tw', 'Bb12341234', createdPagePath);
  await page.getByLabel('Content').fill('Viewer must not be allowed to save this mutation.');
  await page.getByRole('button', { name: 'Save Page' }).click();
  await expect(
    page.getByText('You do not have permission to update this Page.', { exact: true })
  ).toBeVisible();
  await signOut(page);

  await signIn(page, 'sup@a-i.tw', 'Aa12341234', accessPath);
  await page.getByRole('button', { name: 'Revoke' }).click();
  await expect(page).toHaveURL(`${accessPath}?saved=1`);
  await expect(page.getByText('@collaborator-demo', { exact: true })).toHaveCount(0);

  await page.goto(`${repositoryPath}/activity`);
  await expect(page.getByText('repository_grant.created', { exact: true })).toHaveCount(1);
  await expect(page.getByText('repository_grant.role_changed', { exact: true })).toHaveCount(1);
  await expect(page.getByText('repository_grant.revoked', { exact: true })).toHaveCount(1);
  await signOut(page);

  await signIn(page, 'collaborator@a-i.tw', 'Bb12341234');
  await expect(page.getByText('Demo Repository', { exact: true })).toHaveCount(0);
  response = await page.goto(repositoryPath);
  expect(response?.status()).toBe(404);

  await page.goto('/search?q=Grant+lifecycle+proof');
  await expect(page.getByText('Grant lifecycle proof', { exact: true })).toHaveCount(0);
});
