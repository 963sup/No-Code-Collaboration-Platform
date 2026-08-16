import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

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

function requireOrder(path, content, earlier, later, message) {
  const earlierIndex = content.indexOf(earlier);
  const laterIndex = content.indexOf(later);
  if (earlierIndex === -1 || laterIndex === -1 || earlierIndex >= laterIndex) {
    failures.push(`${path}: ${message}`);
  }
}

function walkFiles(directory, extensions) {
  const files = [];
  for (const entry of readdirSync(resolve(root, directory), { withFileTypes: true })) {
    const relative = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(relative, extensions));
    else if (entry.isFile() && extensions.has(extname(entry.name))) files.push(relative);
  }
  return files;
}

const paths = {
  domainCapability: 'packages/domain/src/access/capability.ts',
  domainDelegation: 'packages/domain/src/access/delegation.ts',
  pageCreate: 'packages/application/src/commands/create-page.ts',
  pageUpdate: 'packages/application/src/commands/update-page.ts',
  issueCommand: 'packages/application/src/commands/execute-issue-command.ts',
  discussionCommand: 'packages/application/src/commands/execute-discussion-command.ts',
  applicationPort: 'packages/application/src/ports/repository-grant-repository.ts',
  applicationCommand: 'packages/application/src/commands/execute-repository-grant-command.ts',
  applicationQuery: 'packages/application/src/queries/get-repository-grant-management.ts',
  adapter: 'packages/infrastructure/supabase/src/access/supabase-repository-grant-repository.ts',
  webDatabaseId: 'apps/web/src/app/_validation/database-id.ts',
  webActions: 'apps/web/src/app/(owner)/[ownerSlug]/[repositorySlug]/settings/access/actions.ts',
  webPage: 'apps/web/src/app/(owner)/[ownerSlug]/[repositorySlug]/settings/access/page.tsx',
  accessSchema: 'supabase/schemas/40_access.sql',
  privateFunctions: 'supabase/schemas/90_private_functions.sql',
  commandSchema: 'supabase/schemas/92_repository_grant_commands.sql',
  collaborationCommands: 'supabase/schemas/93_collaboration_commands.sql',
  rls: 'supabase/schemas/99_rls.sql',
  rlsGuardrails: 'supabase/schemas/99_zz_repository_grant_command_guardrails.sql',
  adr: 'docs/architecture/ADR-004-authority-delegation-invariants.md',
  accessContract: 'docs/domains/access-authority.md',
  pageContract: 'docs/domains/page-resource.md',
  issueContract: 'docs/domains/issue-resource.md',
  discussionContract: 'docs/domains/discussion-resource.md',
  databaseTest: 'supabase/tests/repository-grant-lifecycle.test.sql',
  delegationDatabaseTest: 'supabase/tests/role-delegation.test.sql',
  collaborationDatabaseTest: 'supabase/tests/collaboration-lifecycle.test.sql',
  browserTest: 'apps/web/e2e/repository-grant-lifecycle.spec.ts'
};

const documents = Object.fromEntries(
  Object.entries(paths).map(([name, path]) => [name, read(path)])
);

for (const role of ['read', 'triage', 'write', 'maintain', 'admin']) {
  requireText(
    paths.domainCapability,
    documents.domainCapability,
    `'${role}'`,
    `GitHub-derived Repository Role ${role} is missing`
  );
}
for (const obsolete of ["'viewer'", "'contributor'", "'manager'"]) {
  forbidText(
    paths.domainCapability,
    documents.domainCapability,
    obsolete,
    `superseded target Role ${obsolete} remains executable`
  );
}
for (const capability of [
  'repository.access.manage',
  'page.create',
  'page.update',
  'issue.create',
  'issue.comment',
  'issue.edit',
  'issue.manage',
  'discussion.create',
  'discussion.comment',
  'discussion.comment.locked',
  'discussion.edit',
  'discussion.moderate',
  'discussion.announce'
]) {
  requireText(
    paths.domainCapability,
    documents.domainCapability,
    `'${capability}'`,
    `${capability} action-specific Capability is missing`
  );
}
for (const obsolete of ["'resource.create'", "'resource.update'", "'member.manage'"]) {
  forbidText(
    paths.domainCapability,
    documents.domainCapability,
    obsolete,
    `superseded generic mutation Capability ${obsolete} remains executable`
  );
}

for (const symbol of [
  'canMutateRepositoryGrantForPrincipal',
  'actorId !== targetUserId',
  "hasRepositoryCapability(actorRole, 'repository.access.manage')",
  'admin: repositoryRoles'
]) {
  requireText(
    paths.domainDelegation,
    documents.domainDelegation,
    symbol,
    `${symbol} Direct Grant invariant is missing`
  );
}
for (const role of ['read', 'triage', 'write', 'maintain']) {
  requireText(
    paths.domainDelegation,
    documents.domainDelegation,
    `${role}: []`,
    `${role} must not delegate Direct Repository Grants`
  );
}

requireText(paths.pageCreate, documents.pageCreate, "'page.create'", 'CreatePage must require page.create');
requireText(paths.pageUpdate, documents.pageUpdate, "'page.update'", 'UpdatePage must require page.update');
for (const pair of [
  ["case 'create':", "return 'issue.create';"],
  ["case 'comment':", "return 'issue.comment';"],
  ["case 'edit':", "return 'issue.edit';"],
  ["case 'assign':", "return 'issue.manage';"]
]) {
  requireText(paths.issueCommand, documents.issueCommand, pair[0], `${pair[0]} Issue branch is missing`);
  requireText(paths.issueCommand, documents.issueCommand, pair[1], `${pair[1]} Issue authorization is missing`);
}
for (const capability of [
  "'discussion.announce'",
  "'discussion.create'",
  "'discussion.comment'",
  "'discussion.edit'",
  "'discussion.moderate'"
]) {
  requireText(
    paths.discussionCommand,
    documents.discussionCommand,
    capability,
    `${capability} Discussion authorization is missing`
  );
}

for (const symbol of [
  'findGrantTargetByUsername',
  'listDirectRepositoryGrants',
  'mutateDirectRepositoryGrant',
  'expectedRole',
  'proposedRole'
]) {
  requireText(paths.applicationPort, documents.applicationPort, symbol, `${symbol} Port contract is missing`);
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
requireText(
  paths.applicationQuery,
  documents.applicationQuery,
  "hasRepositoryCapability(actorRole, 'repository.access.manage')",
  'Grant management Projection must require repository.access.manage'
);
for (const symbol of ['grantableRoles', 'allowedRoles', 'canRevoke']) {
  requireText(
    paths.applicationQuery,
    documents.applicationQuery,
    symbol,
    `${symbol} Grant-management Projection is missing`
  );
}

for (const symbol of [
  "rpc('find_repository_grant_target_by_username'",
  "rpc('list_repository_direct_grants'",
  "'execute_repository_grant_command'"
]) {
  requireText(paths.adapter, documents.adapter, symbol, `${symbol} Supabase adapter mapping is missing`);
}

requireText(
  paths.webDatabaseId,
  documents.webDatabaseId,
  'z.guid()',
  'shared PostgreSQL UUID lexical validation must use the generic 8-4-4-4-12 contract'
);
const appFiles = walkFiles('apps/web/src/app', new Set(['.ts', '.tsx']));
for (const file of appFiles) {
  const content = read(file);
  forbidText(
    file,
    content,
    'z.string().uuid()',
    'App Router must not reject PostgreSQL UUID identities by requiring RFC version bits'
  );
}
const webBoundary = `${documents.webActions}\n${documents.webPage}`;
for (const symbol of [
  'ExecuteRepositoryGrantCommand',
  'services.repositoryGrantRepository',
  'grantRepositoryAccess',
  'changeRepositoryGrantRole',
  'revokeRepositoryGrant',
  "z.enum(['read', 'triage', 'write', 'maintain', 'admin'])",
  'databaseUuidSchema'
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

requireText(
  paths.accessSchema,
  documents.accessSchema,
  "enum ('read', 'triage', 'write', 'maintain', 'admin')",
  'PostgreSQL repository_role enum must match GitHub Repository Roles'
);
for (const capability of [
  "'repository.access.manage'",
  "'page.create'",
  "'page.update'",
  "'issue.manage'",
  "'discussion.comment.locked'",
  "'discussion.announce'"
]) {
  requireText(
    paths.privateFunctions,
    documents.privateFunctions,
    capability,
    `${capability} PostgreSQL capability projection is missing`
  );
}
for (const obsolete of ["'resource.create'", "'resource.update'", "'member.manage'"]) {
  forbidText(
    paths.privateFunctions,
    documents.privateFunctions,
    obsolete,
    `superseded generic mutation Capability ${obsolete} remains in PostgreSQL authority projection`
  );
}

for (const symbol of [
  "'repository.access.manage'",
  'actor_id = target_user_id',
  'on conflict (repository_id, user_id) do nothing',
  'and direct_grant.role = expected_role',
  'get diagnostics changed_rows = row_count',
  'if changed_rows <> 1 then',
  "return 'state-changed';",
  'private.record_repository_grant_event'
]) {
  requireText(
    paths.commandSchema,
    documents.commandSchema,
    symbol,
    `${symbol} atomic Direct Grant command invariant is missing`
  );
}
requireOrder(
  paths.commandSchema,
  documents.commandSchema,
  "'repository.access.manage'",
  'private.repository_grant_target_exists',
  'Repository access-management authority must be established before Auth target existence lookup'
);
requireOrder(
  paths.commandSchema,
  documents.commandSchema,
  'if changed_rows <> 1 then',
  'private.record_repository_grant_event',
  'Activity Evidence must be written only after exactly one Grant row transition'
);

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
    `${symbol} independent Direct Grant RLS guard is missing`
  );
}
requireText(
  paths.rls,
  documents.rls,
  "private.has_repository_capability(repository_id, 'repository.access.manage')",
  'raw Direct Grant SELECT must be Admin-only'
);
for (const capability of [
  "'page.create'",
  "'page.update'",
  "'issue.create'",
  "'issue.comment'",
  "'issue.edit'",
  "'issue.manage'",
  "'discussion.create'",
  "'discussion.comment'",
  "'discussion.edit'",
  "'discussion.moderate'",
  "'discussion.announce'",
  "'discussion.comment.locked'"
]) {
  requireText(paths.rls, documents.rls, capability, `${capability} RLS projection is missing`);
}
requireText(
  paths.collaborationCommands,
  documents.collaborationCommands,
  "'discussion.comment.locked'",
  'locked Discussion command must preserve Write-or-greater participation'
);

for (const [path, content] of [
  [paths.adr, documents.adr],
  [paths.accessContract, documents.accessContract]
]) {
  for (const phrase of [
    'read | triage | write | maintain | admin',
    'Admin-only',
    'repository.access.manage',
    'state-changed'
  ]) {
    requireText(path, content, phrase, `${phrase} current authority truth is missing`);
  }
}
for (const [path, content, phrases] of [
  [paths.pageContract, documents.pageContract, ['page.create', 'page.update', 'Write']],
  [paths.issueContract, documents.issueContract, ['issue.create', 'issue.manage', 'Triage']],
  [
    paths.discussionContract,
    documents.discussionContract,
    ['discussion.comment.locked', 'discussion.announce', 'Triage', 'Maintain']
  ]
]) {
  for (const phrase of phrases) requireText(path, content, phrase, `${phrase} current Resource authority truth is missing`);
}

for (const phrase of [
  'stale Grant command records no false role-change Evidence',
  'Read cannot enumerate raw Direct Grant rows through RLS',
  'Maintain cannot manage Direct Repository Grants'
]) {
  requireText(paths.databaseTest, documents.databaseTest, phrase, `${phrase} database regression evidence is missing`);
}
for (const phrase of [
  'Maintain cannot create a Write Direct Grant',
  'Maintain cannot create a Read Direct Grant',
  'Repository Admin can create an Admin Direct Grant'
]) {
  requireText(
    paths.delegationDatabaseTest,
    documents.delegationDatabaseTest,
    phrase,
    `${phrase} delegation database evidence is missing`
  );
}
for (const phrase of [
  'Write can comment on an open locked Discussion',
  'Triage cannot comment on an open locked Discussion'
]) {
  requireText(
    paths.collaborationDatabaseTest,
    documents.collaborationDatabaseTest,
    phrase,
    `${phrase} locked Discussion database evidence is missing`
  );
}
for (const symbol of [
  'test.describe.configure({ retries: 0 })',
  'Add collaborator',
  'Change role',
  'Revoke',
  "selectOption('write')",
  "selectOption('read')",
  'repository_grant.revoked'
]) {
  requireText(paths.browserTest, documents.browserTest, symbol, `${symbol} two-User browser journey is missing`);
}

const result = {
  ok: failures.length === 0,
  checkedAppFiles: appFiles.length,
  failures
};
process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
