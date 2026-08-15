import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const publicSupabaseEnvironmentKeys = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
] as const;

function loadLocalPublicSupabaseEnvironment() {
  if (publicSupabaseEnvironmentKeys.every((key) => process.env[key])) return;

  try {
    const localEnvironment = readFileSync(resolve('apps/web/.env.local'), 'utf8');
    for (const key of publicSupabaseEnvironmentKeys) {
      if (process.env[key]) continue;
      const value = localEnvironment.match(new RegExp(`^${key}=(.+)$`, 'mu'))?.[1]?.trim();
      if (value) process.env[key] = value.replace(/^['"]|['"]$/gu, '');
    }
  } catch {
    // CI and explicitly configured workstations provide these values through the process environment.
  }
}

loadLocalPublicSupabaseEnvironment();

const pnpmExecutable = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

export default defineConfig({
  testDir: './apps/web/e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // The local acceptance environment shares one Supabase Auth rate-limit bucket and one Next server.
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: process.env.CI
      ? `${pnpmExecutable} --filter @no-code-collaboration-platform/web start`
      : `${pnpmExecutable} --filter @no-code-collaboration-platform/web dev:e2e`,
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
