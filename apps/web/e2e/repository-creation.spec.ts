import { randomUUID } from 'node:crypto';

import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const MAILPIT_URL = 'http://127.0.0.1:54324';

interface MailpitAddress {
  readonly Address: string;
}

interface MailpitMessage {
  readonly HTML?: string;
  readonly Text?: string;
  readonly To: readonly MailpitAddress[];
}

interface MailpitMessageSummary {
  readonly ID: string;
  readonly To: readonly MailpitAddress[];
}

interface MailpitMessages {
  readonly messages: readonly MailpitMessageSummary[];
}

async function readVerificationCode(request: APIRequestContext, email: string) {
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    const listResponse = await request.get(`${MAILPIT_URL}/api/v1/messages?limit=50`);

    if (listResponse.ok()) {
      const mailbox = (await listResponse.json()) as MailpitMessages;
      const summary = mailbox.messages.find((message) =>
        message.To.some((recipient) => recipient.Address === email)
      );

      if (summary) {
        const messageResponse = await request.get(
          `${MAILPIT_URL}/api/v1/message/${encodeURIComponent(summary.ID)}`
        );
        if (messageResponse.ok()) {
          const message = (await messageResponse.json()) as MailpitMessage;
          const code = `${message.Text ?? ''} ${message.HTML ?? ''}`.match(/\b(\d{6})\b/u)?.[1];
          if (code) return code;
        }
      }
    }

    await new Promise((finish) => {
      setTimeout(finish, 250);
    });
  }

  throw new Error(`Verification email for ${email} was not observed in Mailpit.`);
}

async function registerAndVerifyActor(
  page: Page,
  request: APIRequestContext,
  email: string,
  password: string,
  nextPath = '/new'
) {
  await page.goto(`/sign-up?next=${encodeURIComponent(nextPath)}`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/verify-email/u, { timeout: 15_000 });
  const code = await readVerificationCode(request, email);
  await page.getByLabel('Verification code').fill(code);
  await page.getByRole('button', { name: 'Verify email' }).click();
  await expect(page).toHaveURL(new RegExp(`${nextPath.replaceAll('/', '\\/')}$`, 'u'));
}

test('a new Actor creates a non-Demo personal Repository through /new', async ({
  page,
  request
}) => {
  const suffix = randomUUID().slice(0, 8);
  const email = `repository-${suffix}@example.com`;
  const password = 'Correct-Horse-Battery-Staple-42';
  const repositoryName = `Acceptance Workspace ${suffix}`;
  const repositorySlug = `acceptance-workspace-${suffix}`;

  await registerAndVerifyActor(page, request, email, password);

  for (const viewport of [
    { height: 900, width: 1440 },
    { height: 800, width: 1280 },
    { height: 1024, width: 768 },
    { height: 844, width: 390 }
  ]) {
    await page.setViewportSize(viewport);
    await expect(page.getByRole('heading', { name: 'Create a Repository' })).toBeVisible();
    await expect(page.getByLabel('Owner')).toHaveValue(/^user:/u);
    await expect(page.getByRole('button', { name: 'Create Repository' })).toBeVisible();
  }

  await page.getByLabel('Repository name').fill(repositoryName);
  await page.getByLabel('Repository slug').fill(repositorySlug);
  await page.getByLabel('Description (optional)').fill('Created through the Product UI.');
  await page.getByRole('button', { name: 'Create Repository' }).click();

  await expect(page).toHaveURL(new RegExp(`/user-[0-9a-f]{32}/${repositorySlug}$`, 'u'));
  await expect(page.getByRole('heading', { name: repositoryName, exact: true })).toBeVisible();
  await expect(page.getByText('Created through the Product UI.')).toBeVisible();

  await page.getByRole('link', { name: 'No-Code Collaboration Platform home' }).click();
  await expect(page).toHaveURL(/\/app$/u);
  await expect(page.getByRole('link', { name: new RegExp(repositoryName, 'u') })).toBeVisible();
});

test('a new Actor creates an Organization and then its Repository through the Product UI', async ({
  page,
  request
}) => {
  const suffix = randomUUID().slice(0, 8);
  const email = `organization-${suffix}@example.com`;
  const password = 'Correct-Horse-Battery-Staple-42';
  const organizationName = `Acceptance Organization ${suffix}`;
  const organizationSlug = `acceptance-organization-${suffix}`;
  const repositoryName = `Organization Workspace ${suffix}`;
  const repositorySlug = `organization-workspace-${suffix}`;

  await registerAndVerifyActor(page, request, email, password, '/organizations/new');

  for (const viewport of [
    { height: 900, width: 1440 },
    { height: 800, width: 1280 },
    { height: 1024, width: 768 },
    { height: 844, width: 390 }
  ]) {
    await page.setViewportSize(viewport);
    await expect(page.getByRole('heading', { name: 'Create an Organization' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Organization' })).toBeVisible();
  }

  await page.getByLabel('Organization name').fill(organizationName);
  await page.getByLabel('Organization slug').fill(organizationSlug);
  await page.getByRole('button', { name: 'Create Organization' }).click();

  await expect(page).toHaveURL(/\/new\?[^#]*owner=organization%3A/u);
  await expect(page.getByRole('status')).toContainText('Organization created');
  await expect(page.getByLabel('Owner')).toHaveValue(/^organization:/u);
  await expect(page.getByLabel('Owner').locator('option:checked')).toContainText(organizationName);

  await page.getByLabel('Repository name').fill(repositoryName);
  await page.getByLabel('Repository slug').fill(repositorySlug);
  await page
    .getByLabel('Description (optional)')
    .fill('Created under a newly persisted Organization.');
  await page.getByRole('button', { name: 'Create Repository' }).click();

  await expect(page).toHaveURL(new RegExp(`/${organizationSlug}/${repositorySlug}$`, 'u'));
  await expect(page.getByRole('heading', { name: repositoryName, exact: true })).toBeVisible();
  await expect(page.getByText('Created under a newly persisted Organization.')).toBeVisible();

  await page.getByRole('link', { name: 'No-Code Collaboration Platform home' }).click();
  await expect(page).toHaveURL(/\/app$/u);
  await expect(page.getByRole('link', { name: new RegExp(repositoryName, 'u') })).toBeVisible();
});
