import { readFileSync, writeFileSync } from 'node:fs';

function read(path) {
  return readFileSync(path, 'utf8');
}

function write(path, content) {
  writeFileSync(path, content, 'utf8');
}

function replaceOnce(path, before, after) {
  const content = read(path);
  const index = content.indexOf(before);
  if (index === -1) throw new Error(`${path}: expected block not found`);
  if (content.indexOf(before, index + before.length) !== -1) {
    throw new Error(`${path}: expected block is not unique`);
  }
  write(path, `${content.slice(0, index)}${after}${content.slice(index + before.length)}`);
}

function replaceSection(path, heading, nextHeading, body) {
  const content = read(path);
  const start = content.indexOf(heading);
  const end = content.indexOf(nextHeading, start + heading.length);
  if (start === -1 || end === -1) throw new Error(`${path}: section boundary missing`);
  const replacement = `${heading}\n\n${body.trim()}\n\n`;
  write(path, `${content.slice(0, start)}${replacement}${content.slice(end)}`);
}

const ontology = 'docs/ONTOLOGY.md';
replaceSection(
  ontology,
  '## 12. Role and Capability — bundle vs decision primitive',
  '## 13. Effective Authorization — owner-neutral derived decision',
  `Status: **Canonical.**

\`\`\`text
Role
= GitHub-derived named Capability bundle

Capability
= atomic authorization action on a defined target
\`\`\`

Current Repository Roles are preserved from GitHub after removing Code/Git-specific permissions:

\`\`\`text
read | triage | write | maintain | admin
\`\`\`

Current no-code Capability vocabulary is surface-specific:

\`\`\`text
Repository
repository.view
repository.manage
repository.access.manage

Page / Knowledge
resource.view
page.create
page.update

Issue
issue.create
issue.comment
issue.edit
issue.manage

Discussion
discussion.create
discussion.comment
discussion.comment.locked
discussion.edit
discussion.moderate
discussion.announce
\`\`\`

Current Role meaning:

| Role | Surviving no-code responsibility |
| --- | --- |
| Read | Repository/content read plus ordinary Issue/Discussion participation |
| Triage | Read + Issue management and Discussion editing/moderation |
| Write | Triage + Page mutation, Issue content editing, locked-Discussion comment authority |
| Maintain | Write + accepted non-sensitive maintenance, currently Announcement creation |
| Admin | all current Capabilities including sensitive Repository settings and Direct Repository access management |

Direct Repository Grant management is Admin-only. Role rank is explanation/selection support and never creates delegation authority.

Generic \`resource.create\`, \`resource.update\`, and \`member.manage\` are not current authorization vocabulary. They previously hid materially different Page/Issue/Discussion/access actions and produced target-only Role semantics.

An operation not accepted by Product lifecycle is absent from Capability vocabulary. Resource hard deletion remains unavailable. Capability decides authorization; Role supports assignment and explanation.`
);
replaceSection(
  ontology,
  '## 15. Issue — accepted actionable Artifact',
  '## 16. Discussion — accepted conversation Artifact',
  `Status: **Accepted target semantic and lifecycle.**

Durable benchmark problem:

> track a Repository-scoped item that should be acted on, assigned, discussed, and completed.

\`\`\`text
Issue
= Repository-scoped actionable Artifact
stable identity = Repository ID + issue number
\`\`\`

Issue owns \`open | closed\` state, \`completed | cancelled\` close reason, Repository-scoped labels, access-eligible User assignees, and flat chronological comments. Assignment is responsibility, never authority.

GitHub-derived action split survives the no-code subtraction test:

\`\`\`text
Read
→ issue.create + issue.comment

Triage
→ Read + issue.manage

Write / Maintain / Admin
→ Triage + issue.edit
\`\`\`

Every meaningful mutation uses expected version and same-transaction Activity Evidence. Hard delete, nested replies, milestones, reactions, Source Code, and Git semantics remain excluded from v1.

Issue is never a collaboration Container.`
);
replaceSection(
  ontology,
  '## 16. Discussion — accepted conversation Artifact',
  '## 17. Project-style planning view — Projection',
  `Status: **Accepted target semantic and lifecycle.**

Durable benchmark problem:

> create a Repository-scoped conversation whose primary goal is shared understanding rather than committed execution.

\`\`\`text
Discussion
= Repository-scoped conversation/shared-understanding Artifact
stable identity = Repository ID + discussion number
\`\`\`

Categories are fixed to \`general | question | announcement\`; status is \`open | closed\`; locked is an independent moderation state; comments are flat and chronological. A \`question\` may select one of its own comments as Answer.

GitHub-derived action split:

\`\`\`text
Read
→ create ordinary Discussion + comment while open/unlocked

Triage
→ Read + edit/moderate/lock/answer

Write
→ Triage + comment while open/locked

Maintain
→ Write + create Announcement

Admin
→ all current Discussion capabilities
\`\`\`

Closed Discussion rejects new comments for every Role. Lock blocks ordinary Read/Triage comment participation but Write/Maintain/Admin carry \`discussion.comment.locked\` and may continue commenting while the Discussion remains open.

Announcement creation uses \`discussion.announce\`; moderation uses \`discussion.moderate\`. Neither is Repository access management. Every meaningful mutation uses expected version and same-transaction Activity Evidence. Hard delete, nested replies, reactions, Source Code, and Git semantics remain excluded from v1.`
);

const lifecycle = 'supabase/tests/collaboration-lifecycle.test.sql';
replaceOnce(lifecycle, 'select plan(55);', 'select plan(57);');
replaceOnce(
  lifecycle,
  `select lives_ok(
  $$
    select * from public.set_discussion_lock(
      '20000000-0000-0000-0000-000000000501',
      (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 2),
      true,
      2
    )
  $$,
  'Repository manager can apply independent Discussion moderation lock state'
);

select is(
  (select count(*) from public.add_discussion_comment(
    '20000000-0000-0000-0000-000000000501',
    (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 2),
    'Rejected locked comment',
    3
  )),
  0::bigint,
  'a locked Discussion rejects new comments independently of open status'
);`,
  `select lives_ok(
  $$
    select * from public.set_discussion_lock(
      '20000000-0000-0000-0000-000000000501',
      (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 2),
      true,
      2
    )
  $$,
  'Admin can apply independent Discussion moderation lock state'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000502', true);

select lives_ok(
  $$
    select * from public.add_discussion_comment(
      '20000000-0000-0000-0000-000000000501',
      (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 2),
      'Write may continue participating while locked',
      3
    )
  $$,
  'Write can comment on an open locked Discussion'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000501', true);

select is(
  public.execute_repository_grant_command(
    '20000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000502',
    'write',
    'triage'
  ),
  'applied',
  'Admin can change the collaborator from Write to Triage'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000502', true);

select is(
  (select count(*) from public.add_discussion_comment(
    '20000000-0000-0000-0000-000000000501',
    (select id from public.discussions where repository_id = '20000000-0000-0000-0000-000000000501' and discussion_number = 2),
    'Triage must remain blocked while locked',
    4
  )),
  0::bigint,
  'Triage cannot comment on an open locked Discussion'
);`
);
replaceOnce(
  lifecycle,
  'a Contributor cannot create an announcement Discussion',
  'Triage cannot create an announcement Discussion'
);

replaceOnce(
  'tooling/check-instruction-scopes.mjs',
  `/Repository managers MUST NOT.*manager or admin grants/is,
      'Repository delegation ceiling is missing'`,
  `/Direct Repository Grant management is Admin-only/is,
      'Admin-only Repository access-management boundary is missing'`
);

process.stdout.write(`${JSON.stringify({ ok: true })}\n`);
