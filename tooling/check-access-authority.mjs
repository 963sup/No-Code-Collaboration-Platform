import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const failures = [];

function read(path) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) {
    failures.push(`${path}: required Access Authority contract is missing`);
    return '';
  }
  return readFileSync(absolute, 'utf8');
}

function requireText(path, content, text, message) {
  if (!content.includes(text)) failures.push(`${path}: ${message}`);
}

function forbidText(path, content, text, message) {
  if (content.includes(text)) failures.push(`${path}: ${message}`);
}

const paths = {
  domainDelegation: 'packages/domain/src/access/delegation.ts',
  applicationPort: 'packages/application/src/ports/repository-grant-repository.ts',
  applicationCommand: 'packages/application/src/commands/execute-repository-grant-command.ts',
  applicationQuery: 'packages/application/src/queries/get-repository-grant-management.ts',
  adapter: 'packages/infrastructure/supabase/src/access/supabase-repository-grant-repository.ts',
  webActions: 'apps/web/src/app/(owner)/[ownerSlug]/[repositorySlug]/settings/access/actions.ts',
  webPage: 'apps/web/src/app/(owner)/[ownerSlug]/[repositorySlug]/settings/access/page.tsx',
  commandSchema: 'supabase/schemas/92_repository_grant_commands.sql',
  rlsGuardrails: 'supabase/schemas/99_zz_repository_grant_command_guardrails.sql',
  domainContract: 'docs/domains/access-authority.md',
  databaseTest: 'supabase/tests/repository-grant-lifecycle.test.sql',
  browserTest: 'apps/web/e2e/repository-grant-lifecycle.spec.ts'
};

const documents = Object.fromEntries(
  Object.entries(paths).map(([name, path]) => [name, read(path)])
);

for (const symbol of [
  'canMutateRepositoryGrantForPrincipal',
  'actorId !== targetUserId',
  "hasRepositoryCapability(actorRole, 'member.manage')"
]) {
  requireText(
    paths.domainDelegation,
    documents.domainDelegation,
    symbol,
    `${symbol} delegation invariant is missing`
  );
}

for (const symbol of [
  'findGrantTargetByUsername',
  'listDirectRepositoryGrants',
  'mutateDirectRepositoryGrant',
  'expectedRole',
  'proposedRole'
]) {
  requireText(
    paths.applicationPort,
    documents.applicationPort,
    symbol,
    `${symbol} Port contract is missing`
  );
}

for (const symbol of [
  'canMutateRepositoryGrantForPrincipal',
  'expectedRole',
  'proposedRole',
  'findGrantTargetByUsername',
  'mutateDirectRepositoryGrant'
]) {
  requireText(
    paths.applicationCommand,
    documents.applicationCommand,
    symbol,
    `${symbol} Application command boundary is missing`
  );
}

for (const symbol of [
  'GetRepositoryGrantManagement',
  'grantableRoles',
  'allowedRoles',
  'canRevoke'
]) {
  requireText(
    paths.applicationQuery,
    documents.applicationQuery,
    symbol,
    `${symbol} management Projection is missing`
  );
}

for (const symbol of [
  "rpc('find_repository_grant_target_by_username'",
  "rpc('list_repository_direct_grants'",
  "'execute_repository_grant_command'"
]) {
  requireText(paths.adapter, documents.adapter, symbol, `${symbol} Supabase adapter mapping is missing`);
}

const webBoundary = `${documents.webActions}\n${documents.webPage}`;
for (const symbol of [
  'ExecuteRepositoryGrantCommand',
  'services.repositoryGrantRepository',
  'grantRepositoryAccess',
  'changeRepositoryGrantRole',
  'revokeRepositoryGrant'
]) {
  requireText(paths.webPage, webBoundary, symbol, `${symbol} Web/Application composition is missing`);
}
for (const forbidden of ['@supabase/', 'repository_user_grants']) {
  forbidText(
    paths.webActions,
    webBoundary,
    forbidden,
    `${forbidden} must not bypass the Application boundary`
  );
}

for (const symbol of [
  'expected_role public.repository_role',
  'proposed_role public.repository_role',
  'actor_id = target_user_id',
  'private.can_manage_repository_grant',
  'private.record_repository_grant_event',
  "'repository_grant.created'",
  "'repository_grant.role_changed'",
  "'repository_grant.revoked'"
]) {
  requireText(
    paths.commandSchema,
    documents.commandSchema,
    symbol,
    `${symbol} database command invariant is missing`
  );
}

for (const symbol of [
  "current_setting('app.repository_grant_command', true)",
  "= 'mutate'",
  'user_id <> (select auth.uid())',
  'private.can_manage_repository_grant'
]) {
  requireText(
    paths.rlsGuardrails,
    documents.rlsGuardrails,
    symbol,
    `${symbol} independent RLS guard is missing`
  );
}

for (const phrase of ['self-target', 'same-transaction Activity Evidence', 'raw Data API']) {
  requireText(
    paths.domainContract,
    documents.domainContract,
    phrase,
    `${phrase} Access Authority rule is missing`
  );
}

for (const symbol of [
  'Repository admin creates a contributor Grant',
  'Actor cannot manufacture a Direct Grant to itself',
  'revocation immediately removes private Repository read authority'
]) {
  requireText(
    paths.databaseTest,
    documents.databaseTest,
    symbol,
    `${symbol} database regression evidence is missing`
  );
}

for (const symbol of [
  'Add collaborator',
  'Change role',
  'Revoke',
  'Grant lifecycle proof',
  'repository_grant.revoked'
]) {
  requireText(
    paths.browserTest,
    documents.browserTest,
    symbol,
    `${symbol} two-User browser journey is missing`
  );
}

const result = { ok: failures.length === 0, failures };
process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
