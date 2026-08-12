import { randomUUID } from 'node:crypto';

import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

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

async function readMailpitMessages(request: APIRequestContext, email: string) {
  const listResponse = await request.get(`${MAILPIT_URL}/api/v1/messages?limit=50`);
  if (!listResponse.ok()) return [];

  const mailbox = (await listResponse.json()) as MailpitMessages;
  const messages: MailpitMessage[] = [];

  for (const summary of mailbox.messages) {
    if (!summary.To.some((recipient) => recipient.Address === email)) continue;

    const messageResponse = await request.get(
      `${MAILPIT_URL}/api/v1/message/${encodeURIComponent(summary.ID)}`
    );
    if (messageResponse.ok()) messages.push((await messageResponse.json()) as MailpitMessage);
  }

  return messages;
}

async function readVerificationCode(request: APIRequestContext, email: string) {
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    const messages = await readMailpitMessages(request, email);

    for (const message of messages) {
      const code = `${message.Text ?? ''} ${message.HTML ?? ''}`.match(/\b(\d{6})\b/u)?.[1];
      if (code) return code;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });
  }

  throw new Error(`Verification email for ${email} was not observed in Mailpit.`);
}

async function readRecoveryTokenHash(request: APIRequestContext, email: string) {
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    const messages = await readMailpitMessages(request, email);

    for (const message of messages) {
      const content = `${message.Text ?? ''} ${message.HTML ?? ''}`;
      if (!content.includes('type=recovery')) continue;

      const tokenHash = content.match(/token_hash=([^&"'\s<]+)/u)?.[1];
      if (tokenHash) return tokenHash;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });
  }

  throw new Error(`Password recovery email for ${email} was not observed in Mailpit.`);
}

async function registerAndVerify(
  page: Page,
  request: APIRequestContext,
  email: string,
  password: string
) {
  await page.goto('/sign-up?next=%2Fapp');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(
    new RegExp(`/verify-email\\?email=${encodeURIComponent(email)}&next=%2Fapp&notice=sent$`, 'u')
  );

  const code = await readVerificationCode(request, email);

  await page.getByLabel('Verification code').fill(code);
  await page.getByRole('button', { name: 'Verify email' }).click();
  await expect(page).toHaveURL(/\/app$/u);
}

test('registration proves email ownership before creating an authenticated session', async ({
  page,
  request
}) => {
  const email = `actor-${randomUUID()}@example.com`;
  const password = 'Correct-Horse-Battery-Staple-42';

  await registerAndVerify(page, request, email, password);
  await expect(page.getByRole('heading', { name: 'Repositories', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/$/u);

  await page.goto('/app');
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fapp$/u);
});

test('password recovery uses a recovery-only session before accepting a new password', async ({
  page,
  request
}) => {
  const email = `recovery-${randomUUID()}@example.com`;
  const password = 'Correct-Horse-Battery-Staple-42';
  const newPassword = 'Different-Horse-Battery-Staple-84';

  await registerAndVerify(page, request, email, password);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.goto('/sign-in');

  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Send reset instructions' }).click();
  await expect(
    page.getByText("If an account can be recovered with that email, we've sent password reset instructions.")
  ).toBeVisible();

  const tokenHash = await readRecoveryTokenHash(request, email);
  await page.goto(`/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=recovery`);
  await expect(page).toHaveURL(/\/reset-password$/u);

  await page.goto('/app');
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fapp$/u);

  await page.goto('/reset-password');
  await page.getByLabel('New password').fill(newPassword);
  await page.getByLabel('Confirm new password').fill(newPassword);
  await page.getByRole('button', { name: 'Update password' }).click();

  await expect(page).toHaveURL(/\/sign-in\?notice=password-reset$/u);
  await expect(page.getByText('Your password was updated. Sign in with your new password.')).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(newPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/app$/u);

  await page.goto('/reset-password');
  await expect(page).toHaveURL(/\/app$/u);
});

test('auth pages preserve a safe post-auth destination', async ({ page }) => {
  const repositoryPath = '/app/repositories/00000000-0000-4000-8000-000000000001';

  await page.goto(`/sign-in?next=${encodeURIComponent(repositoryPath)}`);

  await expect(page.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
    'href',
    `/sign-up?next=${encodeURIComponent(repositoryPath)}`
  );
});

test('external, protocol, and recovery destinations are replaced with the authenticated default', async ({
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

  await page.goto('/sign-in?next=%2Freset-password');
  await expect(page.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
    'href',
    '/sign-up?next=%2Fapp'
  );
});

test('invalid email query input is not reflected into the verification form', async ({ page }) => {
  await page.goto('/verify-email?email=%3Cnot-an-email%3E');

  await expect(page.getByLabel('Email')).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Resend code' })).toHaveCount(0);
});

test('unknown authentication reasons use a stable generic error', async ({ page }) => {
  await page.goto('/auth/error?reason=unexpected-provider-detail');

  await expect(page.getByText('The authentication request could not be completed.')).toBeVisible();
});
