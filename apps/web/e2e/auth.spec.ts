import { randomUUID } from 'node:crypto';

import { expect, test, type APIRequestContext } from '@playwright/test';

const MAILPIT_URL = 'http://127.0.0.1:54324';

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

test('registration proves email ownership before creating an authenticated session', async ({
  page,
  request
}) => {
  const email = `actor-${randomUUID()}@example.com`;
  const password = 'Correct-Horse-Battery-Staple-42';

  await page.goto('/sign-up?next=%2Fapp');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(
    new RegExp(
      `/verify-email\\?email=${encodeURIComponent(email)}&next=%2Fapp&notice=sent$`,
      'u'
    )
  );

  const code = await readVerificationCode(request, email);

  await page.getByLabel('Verification code').fill(code);
  await page.getByRole('button', { name: 'Verify email' }).click();

  await expect(page).toHaveURL(/\/app$/u);
  await expect(page.getByRole('heading', { name: 'Repositories' })).toBeVisible();

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/$/u);

  await page.goto('/app');
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fapp$/u);
});

test('auth pages preserve a safe post-auth destination', async ({ page }) => {
  const repositoryPath = '/app/repositories/00000000-0000-4000-8000-000000000001';

  await page.goto(`/sign-in?next=${encodeURIComponent(repositoryPath)}`);

  await expect(page.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
    'href',
    `/sign-up?next=${encodeURIComponent(repositoryPath)}`
  );
});

test('external and protocol destinations are replaced with the authenticated default', async ({
  page
}) => {
  await page.goto('/sign-in?next=https%3A%2F%2Fexample.com');

  await expect(page.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
    'href',
    '/sign-up?next=%2Fapp'
  );

  await page.goto('/sign-up?next=%2Fauth%2Fconfirm');

  await expect(page.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
    'href',
    '/sign-in?next=%2Fapp'
  );
});
