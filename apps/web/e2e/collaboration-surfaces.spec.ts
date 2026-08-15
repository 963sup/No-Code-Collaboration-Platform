import { expect, test, type Page } from '@playwright/test';

const repositoryPath = '/demo-organization/demo-repository';

test.setTimeout(120_000);

async function signIn(page: Page, destination = '/dashboard') {
  await page.goto(`/sign-in?next=${encodeURIComponent(destination)}`);
  await page.getByLabel('Email').fill('sup@a-i.tw');
  await page.getByLabel('Password').fill('Aa12341234');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(destination);
}

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test('accepted breadth surfaces expose truthful availability without code-product navigation', async ({
  page
}) => {
  test.setTimeout(240_000);
  const surfaces = [
    { availability: 'preview', path: '/repos', title: 'Repositories' },
    { availability: 'preview', path: '/issues/assigned', title: 'Issues assigned to you' },
    { availability: 'live', path: '/projects', title: 'Projects' },
    { availability: 'preview', path: '/discussions', title: 'Discussions' },
    { availability: 'live', path: '/notifications', title: 'Notifications' },
    { availability: 'live', path: '/search', title: 'Search' },
    { availability: 'live', path: '/explore', title: 'Explore' },
    { availability: 'preview', path: '/marketplace?category=mcp', title: 'Marketplace' },
    { availability: 'live', path: `${repositoryPath}/projects`, title: 'Projects' },
    { availability: 'live', path: `${repositoryPath}/discussions`, title: 'Discussions' },
    { availability: 'preview', path: `${repositoryPath}/security`, title: 'Security' },
    { availability: 'preview', path: `${repositoryPath}/settings`, title: 'Settings' },
    { availability: 'preview', path: '/settings/profile', title: 'Profile' },
    { availability: 'deferred', path: '/settings/enterprises', title: 'Enterprise' },
    { availability: 'deferred', path: '/settings/installations', title: 'Installed Apps' },
    {
      availability: 'preview',
      path: '/orgs/demo-organization/people',
      title: 'People'
    },
    {
      availability: 'deferred',
      path: '/orgs/demo-organization/teams',
      title: 'Teams'
    },
    {
      availability: 'preview',
      path: '/organizations/demo-organization/settings/audit-log',
      title: 'Organization audit log'
    }
  ] as const;

  for (const surface of surfaces) {
    await page.goto(surface.path);
    await expect(page.getByRole('heading', { level: 1 }).last()).toContainText(surface.title);
    await expect(page.getByText(surface.availability, { exact: true }).last()).toBeVisible();
  }

  const forbiddenProductPath = /\/(?:actions|branches|code|commits|gist|pulls)(?:\/|\?|$)/u;
  for (const link of await page
    .locator('a[href]')
    .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href') ?? ''))) {
    expect(link).not.toMatch(forbiddenProductPath);
  }
});

test('surface query state normalizes without rewriting GitHub-aligned route identity', async ({
  page
}) => {
  await page.goto('/search?sort=bogus&page=0&code=true');
  await expect(page).toHaveURL('/search');

  await page.goto('/issues/assigned?page=-2&status=bogus&code=true');
  await expect(page).toHaveURL('/issues/assigned');

  await page.goto('/marketplace?category=mcp&page=1');
  await expect(page).toHaveURL('/marketplace?category=mcp');

  await page.goto('/issues');
  await expect(page).toHaveURL('/issues/assigned');
});

test('authenticated shell remains usable at all acceptance viewports and Context does not grant authority', async ({
  page
}) => {
  for (const viewport of [
    { height: 900, name: 'desktop', width: 1440 },
    { height: 800, name: 'laptop', width: 1280 },
    { height: 1024, name: 'tablet', width: 768 },
    { height: 844, name: 'mobile', width: 390 }
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/dashboard');
    if (viewport.name === 'mobile') {
      await page.getByRole('button', { name: 'Open navigation' }).click();
    }
    await expect(page.getByRole('navigation', { name: 'Application navigation' })).toBeVisible();
  }

  await page.setViewportSize({ height: 900, width: 1440 });
  await page.goto(repositoryPath);
  await page.getByRole('button', { name: /All repositories/u }).click();
  await expect(
    page.getByText('Context filters navigation only. It never changes effective authorization.')
  ).toBeVisible();
  await page.getByRole('menuitem', { name: 'All accessible repositories' }).click();
  await expect(page).toHaveURL('/dashboard');
  await page.goto(repositoryPath);
  await expect(page.getByRole('heading', { name: 'Demo Repository', exact: true })).toBeVisible();
});

test('Question Discussion supports flat comments, Answer selection, and independent close state', async ({
  page
}) => {
  const suffix = Date.now().toString();
  const title = `E2E shared question ${suffix}`;
  const comment = `E2E answer candidate ${suffix}`;
  await page.goto(`${repositoryPath}/discussions`);
  await page.getByText('New Discussion', { exact: true }).click();
  const creationForm = page.getByRole('button', { name: 'Create Discussion' }).locator('..');
  await creationForm.locator('input[name="title"]').fill(title);
  await creationForm.locator('select[name="category"]').selectOption('question');
  await creationForm.locator('textarea[name="body"]').fill('A shared-understanding question.');
  await creationForm.getByRole('button', { name: 'Create Discussion' }).click();
  await expect(page).toHaveURL(new RegExp(`${repositoryPath}/discussions/\\d+$`, 'u'));

  const commentForm = page.getByRole('heading', { name: 'Add comment' }).locator('..');
  await commentForm.locator('textarea[name="body"]').fill(comment);
  await commentForm.getByRole('button', { name: 'Comment' }).click();
  await expect(page.getByText(comment, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Select answer' }).click();
  await expect(page.getByText('Answer', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(
    page.getByText(/New comments are unavailable while this Discussion is closed/u)
  ).toBeVisible();
});
