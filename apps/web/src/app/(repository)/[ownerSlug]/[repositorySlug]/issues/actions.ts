'use server';

import { ExecuteIssueCommand } from '@no-code-collaboration-platform/application';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createRequestServices } from '@/composition/create-request-services';
import {
  repositoryIssuePath,
  repositoryIssuesPath,
  repositoryPath
} from '@/routing/repository-routes';

import { requireAccessibleIssueRoute } from '../_queries/get-accessible-issue';
import { requireAccessibleRepositoryRoute } from '../_queries/get-accessible-repository-route';

type IssueCommand = Parameters<ExecuteIssueCommand['execute']>[0];

const createIssueSchema = z.object({
  body: z.string(),
  title: z.string().trim().min(1).max(240)
});

const existingIssueSchema = z.object({
  assigneeId: z.string().uuid().optional(),
  body: z.string().optional(),
  closeReason: z.enum(['completed', 'cancelled']).optional(),
  expectedVersion: z.coerce.number().int().positive(),
  intent: z.enum(['assign', 'close', 'comment', 'edit', 'label', 'reopen', 'unassign', 'unlabel']),
  labelId: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(240).optional()
});

async function execute(command: IssueCommand) {
  const services = await createRequestServices();
  return new ExecuteIssueCommand(
    services.identityProvider,
    services.repositoryReader,
    services.repositoryAccessReader,
    services.issueWriter
  )
    .execute(command)
    .catch(() => null);
}

function errorDestination(destination: string, reason: string) {
  return `${destination}?command=${encodeURIComponent(reason)}`;
}

export async function createIssueAction(
  ownerSlug: string,
  repositorySlug: string,
  formData: FormData
) {
  const parsed = createIssueSchema.safeParse({
    body: String(formData.get('body') ?? ''),
    title: String(formData.get('title') ?? '')
  });
  const route = await requireAccessibleRepositoryRoute(ownerSlug, repositorySlug);
  const collectionPath = repositoryIssuesPath(route);
  if (!parsed.success) redirect(errorDestination(collectionPath, 'invalid-command'));

  const result = await execute({
    body: parsed.data.body,
    repositoryId: route.repository.id,
    title: parsed.data.title,
    type: 'create'
  });
  if (result === null) redirect(errorDestination(collectionPath, 'provider-unavailable'));
  if (!result.ok) redirect(errorDestination(collectionPath, result.reason));

  revalidatePath(repositoryPath(route));
  revalidatePath(collectionPath);
  redirect(repositoryIssuePath(route, result.issue.issueNumber));
}

export async function updateIssueAction(
  ownerSlug: string,
  repositorySlug: string,
  issueNumber: string,
  formData: FormData
) {
  const { issue, route } = await requireAccessibleIssueRoute(
    ownerSlug,
    repositorySlug,
    issueNumber
  );
  const destination = repositoryIssuePath(route, issue.issueNumber);
  const parsed = existingIssueSchema.safeParse({
    assigneeId: formData.get('assigneeId') || undefined,
    body: formData.get('body') ?? undefined,
    closeReason: formData.get('closeReason') || undefined,
    expectedVersion: formData.get('expectedVersion'),
    intent: formData.get('intent'),
    labelId: formData.get('labelId') || undefined,
    title: formData.get('title') || undefined
  });
  if (!parsed.success) redirect(errorDestination(destination, 'invalid-command'));

  const common = {
    expectedVersion: parsed.data.expectedVersion,
    issueId: issue.id,
    repositoryId: route.repository.id
  } as const;
  let command: IssueCommand;
  switch (parsed.data.intent) {
    case 'edit':
      if (parsed.data.title === undefined || parsed.data.body === undefined) {
        redirect(errorDestination(destination, 'invalid-command'));
      }
      command = { ...common, body: parsed.data.body, title: parsed.data.title, type: 'edit' };
      break;
    case 'comment':
      if (parsed.data.body === undefined || parsed.data.body.trim().length === 0) {
        redirect(errorDestination(destination, 'invalid-command'));
      }
      command = { ...common, body: parsed.data.body, type: 'comment' };
      break;
    case 'assign':
    case 'unassign':
      if (parsed.data.assigneeId === undefined) {
        redirect(errorDestination(destination, 'invalid-command'));
      }
      command = { ...common, assigneeId: parsed.data.assigneeId, type: parsed.data.intent };
      break;
    case 'label':
    case 'unlabel':
      if (parsed.data.labelId === undefined) {
        redirect(errorDestination(destination, 'invalid-command'));
      }
      command = { ...common, labelId: parsed.data.labelId, type: parsed.data.intent };
      break;
    case 'close':
      if (parsed.data.closeReason === undefined) {
        redirect(errorDestination(destination, 'invalid-command'));
      }
      command = { ...common, closeReason: parsed.data.closeReason, type: 'close' };
      break;
    case 'reopen':
      command = { ...common, type: 'reopen' };
      break;
  }

  const result = await execute(command);
  if (result === null) redirect(errorDestination(destination, 'provider-unavailable'));
  if (!result.ok) redirect(errorDestination(destination, result.reason));

  revalidatePath(repositoryPath(route));
  revalidatePath(repositoryIssuesPath(route));
  revalidatePath(destination);
  redirect(`${destination}?command=saved`);
}
