import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const root = process.cwd();
const failures = [];

function read(path) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) {
    failures.push(`${path}: required current-truth contract is missing`);
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

function forbidPath(path, message) {
  if (existsSync(resolve(root, path))) failures.push(`${path}: ${message}`);
}

function requireOrder(path, content, earlier, later, message) {
  const earlierIndex = content.indexOf(earlier);
  const laterIndex = content.indexOf(later);
  if (earlierIndex === -1 || laterIndex === -1 || earlierIndex >= laterIndex) {
    failures.push(`${path}: ${message}`);
  }
}

function extractSqlFunctionBody(path, content, functionStart) {
  const functionIndex = content.indexOf(functionStart);
  if (functionIndex === -1) {
    failures.push(`${path}: ${functionStart} is missing`);
    return '';
  }
  const bodyStartMarker = 'as $$';
  const bodyStart = content.indexOf(bodyStartMarker, functionIndex);
  if (bodyStart === -1) {
    failures.push(`${path}: ${functionStart} has no SQL body`);
    return '';
  }
  const bodyEnd = content.indexOf('\n$$;', bodyStart + bodyStartMarker.length);
  if (bodyEnd === -1) {
    failures.push(`${path}: ${functionStart} SQL body is unterminated`);
    return '';
  }
  return content.slice(bodyStart + bodyStartMarker.length, bodyEnd);
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
  domainAuthority: 'packages/domain/src/access/authority.ts',
  domainDelegation: 'packages/domain/src/access/delegation.ts',
  issueDomain: 'packages/domain/src/resource/issue.ts',
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
  legacyRlsOverride: 'supabase/schemas/99_zz_repository_grant_command_guardrails.sql',
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
  Object.entries(paths)
    .filter(([name]) => name !== 'legacyRlsOverride')
    .map(([name, path]) => [name, read(path)])
);

forbidPath(
  paths.legacyRlsOverride,
  'supplemental RLS correction files are forbidden; canonical policy belongs in 99_rls.sql'
);

for (const role of ['read', 'triage', 'write', 'maintain', 'admin']) {
  requireText(
    paths.domainCapability,
    documents.domainCapability,
    `'${role}'`,
    `GitHub organization-Repository Role ${role} is missing`
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
  "export type RepositoryActorTrust = 'anonymous' | 'authenticated'",
  'authenticatedPublicParticipationCapabilities',
  'publicCollaboratorWikiCapabilities',
  "'issue.create'",
  "'discussion.create'",
  "'page.update'",
  'effectiveRole !== null'
]) {
  requireText(
    paths.domainAuthority,
    documents.domainAuthority,
    symbol,
    `${symbol} contextual Repository authority rule is missing`
  );
}

for (const symbol of [
  'canMutateRepositoryGrantForPrincipal',
  'actorId !== targetUserId',
  "hasRepositoryCapability(actorRole, 'repository.access.manage')",
  'admin: repositoryRoles',
  'repositoryGrantRolesForOwner',
  "ownerKind === 'user' ? ['write'] : repositoryRoles"
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

for (const symbol of [
  'requiredIssueCapability',
  'issueAuthorMayExecute',
  "command.type === 'edit'",
  "command.type === 'close'"
]) {
  requireText(
    paths.issueDomain,
    documents.issueDomain,
    symbol,
    `${symbol} Issue authority rule is missing`
  );
}
requireText(
  paths.issueCommand,
  documents.issueCommand,
  'findAccessibleIssueById',
  'Issue command orchestration must load stable target state for author-specific authority'
);
requireText(
  paths.issueCommand,
  documents.issueCommand,
  'issueAuthorMayExecute',
  'Issue author rule must remain a Domain decision'
);

for (const path of [
  paths.pageCreate,
  paths.pageUpdate,
  paths.issueCommand,
  paths.discussionCommand
]) {
  requireText(
    path,
    documents[Object.keys(paths).find((key) => paths[key] === path)],
    "actorTrust: 'authenticated'",
    `${path} must distinguish authenticated participation from anonymous visibility`
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
  'isRepositoryGrantRoleAllowed',
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
  "hasRepositoryCapability(actorRole, 'repository.access.manage')",
  'repositoryGrantRolesForOwner(repository.owner.kind)',
  'grantableRoles',
  'allowedRoles',
  'canRevoke'
]) {
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
  requireText(
    paths.adapter,
    documents.adapter,
    symbol,
    `${symbol} Supabase adapter mapping is missing`
  );
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
  'databaseUuidSchema'
]) {
  requireText(
    paths.webPage,
    webBoundary,
    symbol,
    `${symbol} Web/Application composition is missing`
  );
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
  'PostgreSQL organization-Repository role enum must match GitHub Repository Roles'
);
for (const symbol of [
  "'repository.access.manage'",
  'repository_visibility',
  "'issue.create'",
  "'discussion.create'",
  "'page.create'",
  "'page.update'",
  'private.is_repository_grant_role_allowed',
  "target_role = 'write'::public.repository_role",
  'repository_user_grants_owner_role_guard'
]) {
  requireText(
    paths.privateFunctions,
    documents.privateFunctions,
    symbol,
    `${symbol} PostgreSQL contextual authority projection is missing`
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
  'private.repository_grant_target_exists',
  'private.is_repository_grant_role_allowed',
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
const grantCommandBody = extractSqlFunctionBody(
  paths.commandSchema,
  documents.commandSchema,
  'create function public.execute_repository_grant_command('
);
requireOrder(
  paths.commandSchema,
  grantCommandBody,
  "'repository.access.manage'",
  'private.repository_grant_target_exists',
  'Repository access-management authority must be established before Auth target existence lookup'
);
requireOrder(
  paths.commandSchema,
  grantCommandBody,
  'if changed_rows <> 1 then',
  'private.record_repository_grant_event',
  'Activity Evidence must be written only after exactly one Grant row transition'
);

for (const symbol of [
  "current_setting('app.repository_grant_command', true)",
  "= 'mutate'",
  'user_id <> (select auth.uid())',
  'private.can_manage_repository_grant',
  'private.is_repository_grant_role_allowed'
]) {
  requireText(
    paths.rls,
    documents.rls,
    symbol,
    `${symbol} canonical Direct Grant RLS guard is missing`
  );
}
for (const symbol of [
  "when 'edit' then (",
  'or created_by = (select auth.uid())',
  "when 'transition' then (",
  "private.has_repository_capability(repository_id, 'issue.manage')",
  "private.has_repository_capability(repository_id, 'discussion.comment.locked')",
  'private.current_repository_role(repository_id)) is not null'
]) {
  requireText(paths.rls, documents.rls, symbol, `${symbol} contextual RLS rule is missing`);
}
requireText(
  paths.rls,
  documents.rls,
  "private.has_repository_capability(repository_id, 'repository.access.manage')",
  'raw Direct Grant SELECT must be Admin-only'
);
requireText(
  paths.collaborationCommands,
  documents.collaborationCommands,
  "'issue.manage'",
  'Issue command-local authority must not fall back to generic resource.update'
);
for (const obsolete of ["'resource.create'", "'resource.update'"]) {
  forbidText(
    paths.collaborationCommands,
    documents.collaborationCommands,
    obsolete,
    `generic ${obsolete} authorization remains in collaboration command SQL`
  );
}

for (const [path, content] of [
  [paths.adr, documents.adr],
  [paths.accessContract, documents.accessContract]
]) {
  for (const phrase of [
    'read | triage | write | maintain | admin',
    'Admin-only',
    'repository.access.manage',
    'state-changed',
    'github/docs/content',
    'github/docs/src'
  ]) {
    requireText(path, content, phrase, `${phrase} current authority truth is missing`);
  }
}
for (const [path, content, phrases] of [
  [
    paths.pageContract,
    documents.pageContract,
    ['page.create', 'page.update', 'public Repository', 'collaborator']
  ],
  [
    paths.issueContract,
    documents.issueContract,
    ['issue.create', 'issue.manage', 'Issue author', 'Triage']
  ],
  [
    paths.discussionContract,
    documents.discussionContract,
    ['discussion.comment.locked', 'discussion.announce', 'Read', 'Triage', 'Maintain']
  ]
]) {
  for (const phrase of phrases)
    requireText(path, content, phrase, `${phrase} current Resource authority truth is missing`);
}

for (const phrase of [
  'stale Grant command records no false role-change Evidence',
  'Read cannot enumerate raw Direct Grant rows through RLS',
  'Maintain cannot manage Direct Repository Grants'
]) {
  requireText(
    paths.databaseTest,
    documents.databaseTest,
    phrase,
    `${phrase} database regression evidence is missing`
  );
}
for (const phrase of [
  'Maintain cannot create a Write Direct Grant',
  'Maintain cannot create a Read Direct Grant',
  'Repository Admin can create an Admin Direct Grant',
  'personal Repository rejects a Read Direct Grant'
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
  'Triage cannot comment on an open locked Discussion',
  'public authenticated Actor can create an Issue without a Direct Grant',
  'Issue author can edit their own Issue without Triage or Write'
]) {
  requireText(
    paths.collaborationDatabaseTest,
    documents.collaborationDatabaseTest,
    phrase,
    `${phrase} contextual collaboration database evidence is missing`
  );
}
for (const symbol of [
  'test.describe.configure({ retries: 0 })',
  'Grant access',
  'Change role',
  'Revoke',
  "selectOption('write')",
  "selectOption('read')",
  'repository_grant.revoked'
]) {
  requireText(
    paths.browserTest,
    documents.browserTest,
    symbol,
    `${symbol} two-User browser journey is missing`
  );
}

const result = {
  ok: failures.length === 0,
  checkedAppFiles: appFiles.length,
  failures
};
process.stdout.write(`${JSON.stringify(result)}\n`);
if (failures.length > 0) process.exitCode = 1;
