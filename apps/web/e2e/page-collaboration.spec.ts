import { randomUUID } from 'node:crypto';

import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const MAILPIT_URL = 'http://127.0.0.1:54324';
const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321';

interface MailpitAddress {
  readonly Address: string;
}

interface MailpitMessage {
  readonly HTML?: string;
  readonly ID: string;
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

interface PasswordGrantResponse {
  readonly access_token: string;
  readonly user: {
    readonly id: string;
  };
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

    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });
  }

  throw new Error(`Verification email for ${email} was not observed in Mailpit.`);
}

async function registerAndVerifyActor(
  page: Page,
  request: APIRequestContext,
  email: string,
  password: string
) {
  await page.goto('/sign-up?next=%2Fapp');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/verify-email/u);
  const code = await readVerificationCode(request, email);

  await page.getByLabel('Verification code').fill(code);
  await page.getByRole('button', { name: 'Verify email' }).click();
  await expect(page).toHaveURL(/\/app$/u);
}

async function establishApiIdentity(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<PasswordGrantResponse> {
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? LOCAL_SUPABASE_URL;

  if (!publishableKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required for browser fixture setup.');
  }

  const response = await request.post(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    data: { email, password },
    headers: {
      apikey: publishableKey,
      'content-type': 'application/json'
    }
  });

  expect(response.ok()).toBe(true);
  return (await response.json()) as PasswordGrantResponse;
}

async function createRepositoryFixture(
  request: APIRequestContext,
  identity: PasswordGrantResponse
) {
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? LOCAL_SUPABASE_URL;

  if (!publishableKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required for browser fixture setup.');
  }

  const organizationId = randomUUID();
  const repositoryId = randomUUID();
  const suffix = randomUUID().slice(0, 8);
  const ownerSlug = `e2e-org-${suffix}`;
  const repositorySlug = `e2e-repo-${suffix}`;
  const headers = {
    apikey: publishableKey,
    authorization: `Bearer ${identity.access_token}`,
    'content-type': 'application/json',
    prefer: 'return=minimal'
  };

  const organizationResponse = await request.post(`${supabaseUrl}/rest/v1/organizations`, {
    data: {
      created_by: identity.user.id,
      id: organizationId,
      name: 'E2E Organization',
      slug: ownerSlug
    },
    headers
  });
  expect(organizationResponse.status()).toBe(201);

  const repositoryResponse = await request.post(`${supabaseUrl}/rest/v1/repositories`, {
    data: {
      created_by: identity.user.id,
      id: repositoryId,
      name: 'E2E Repository',
      owner_organization_id: organizationId,
      slug: repositorySlug
    },
    headers
  });
  expect(repositoryResponse.status()).toBe(201);

  return { ownerSlug, repositoryId, repositorySlug };
}

test('Page collaboration uses canonical Owner/Repository routes while stable IDs remain authorization targets', async ({
  page,
  request
}) => {
  const email = `page-${randomUUID()}@example.com`;
  const password = 'Correct-Horse-Battery-Staple-42';

  await registerAndVerifyActor(page, request, email, password);
  const identity = await establishApiIdentity(request, email, password);
  const { ownerSlug, repositoryId, repositorySlug } = await createRepositoryFixture(
    request,
    identity
  );
  const repositoryPath = `/${ownerSlug}/${repositorySlug}`;
  const pagesPath = `${repositoryPath}/pages`;

  await page.goto('/app');
  await page.getByRole('link', { name: /E2E Repository/u }).click();
  await expect(page).toHaveURL(repositoryPath);

  await page.goto(`/app/repositories/${repositoryId}`);
  await expect(page).toHaveURL(repositoryPath);

  await page.goto(`/app/repositories/${repositoryId}/resources`);
  await expect(page).toHaveURL(pagesPath);
  await expect(page.getByRole('heading', { name: 'Pages', exact: true })).toBeVisible();

  await page.getByLabel('Page title').fill('Product brief');
  await page.getByRole('button', { name: 'Create Page' }).click();

  await expect(page).toHaveURL(new RegExp(`${pagesPath}/[0-9a-f-]+$`, 'u'));
  await expect(page.getByRole('heading', { name: 'Edit Page' })).toBeVisible();

  const canonicalPagePath = new URL(page.url()).pathname;
  const pageId = canonicalPagePath.split('/').at(-1);
  expect(pageId).toBeTruthy();

  await page.goto(`/app/repositories/${repositoryId}/resources/${pageId}`);
  await expect(page).toHaveURL(canonicalPagePath);

  const initialVersion = await page.locator('input[name="expectedUpdatedAt"]').inputValue();
  const stalePage = await page.context().newPage();
  await stalePage.goto(page.url());
  await expect(stalePage.getByRole('heading', { name: 'Edit Page' })).toBeVisible();

  await page.getByLabel('Content').fill('Version two');
  await page.waitForTimeout(20);
  await page.getByRole('button', { name: 'Save Page' }).click();
  await expect(page.getByText('Page saved.', { exact: true })).toBeVisible();

  const meaningfulVersion = await page.locator('input[name="expectedUpdatedAt"]').inputValue();
  expect(meaningfulVersion).not.toBe(initialVersion);

  await stalePage.getByLabel('Content').fill('Stale overwrite');
  await stalePage.getByRole('button', { name: 'Save Page' }).click();
  await expect(
    stalePage.getByText(
      'The Page or its authority changed after loading. Refresh before saving again.',
      { exact: true }
    )
  ).toBeVisible();
  await expect(stalePage.getByLabel('Content')).toHaveValue('Version two');
  await stalePage.close();

  await page.waitForTimeout(20);
  await page.getByRole('button', { name: 'Save Page' }).click();
  await expect(page.getByText('Page saved.', { exact: true })).toBeVisible();

  const noOpVersion = await page.locator('input[name="expectedUpdatedAt"]').inputValue();
  expect(noOpVersion).toBe(meaningfulVersion);

  await page.getByRole('link', { name: 'Activity' }).click();
  await expect(page).toHaveURL(`${repositoryPath}/activity`);
  await expect(page.getByText('resource.created', { exact: true })).toHaveCount(1);
  await expect(page.getByText('resource.updated', { exact: true })).toHaveCount(1);
});
