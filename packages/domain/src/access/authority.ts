import type { RepositoryVisibility } from '../repository/repository';
import {
  hasRepositoryCapability,
  highestRepositoryRole,
  repositoryCapabilities,
  type RepositoryCapability,
  type RepositoryRole
} from './capability';

export interface RepositoryAuthoritySources {
  readonly directRole: RepositoryRole | null;
  readonly governanceRole: RepositoryRole | null;
}

export type RepositoryAccessSource =
  | { readonly kind: 'direct-grant'; readonly role: RepositoryRole }
  | { readonly kind: 'governance-derived'; readonly role: RepositoryRole }
  | { readonly kind: 'public-visibility' };

export type RepositoryActorTrust = 'anonymous' | 'authenticated';

export interface RepositoryAccessExplanation {
  readonly actorTrust: RepositoryActorTrust;
  readonly effectiveCapabilities: readonly RepositoryCapability[];
  readonly effectiveRole: RepositoryRole | null;
  readonly sources: readonly RepositoryAccessSource[];
  readonly visibility: RepositoryVisibility;
}

export interface RepositoryAccessExplanationInput {
  readonly actorTrust: RepositoryActorTrust;
  readonly sources: RepositoryAuthoritySources;
  readonly visibility: RepositoryVisibility;
}

export interface RepositoryCapabilityDecision extends RepositoryAccessExplanation {
  readonly allowed: boolean;
  readonly requestedCapability: RepositoryCapability;
}

const publicReadCapabilities = [
  'repository.view',
  'resource.view'
] as const satisfies readonly RepositoryCapability[];

const authenticatedPublicParticipationCapabilities = [
  'issue.create',
  'issue.comment',
  'discussion.create',
  'discussion.comment'
] as const satisfies readonly RepositoryCapability[];

const publicCollaboratorWikiCapabilities = [
  'page.create',
  'page.update'
] as const satisfies readonly RepositoryCapability[];

export function effectiveRepositoryRole(
  sources: RepositoryAuthoritySources
): RepositoryRole | null {
  return highestRepositoryRole(
    [sources.directRole, sources.governanceRole].filter(
      (role): role is RepositoryRole => role !== null
    )
  );
}

export function explainRepositoryAccess(
  input: RepositoryAccessExplanationInput
): RepositoryAccessExplanation {
  const effectiveRole = effectiveRepositoryRole(input.sources);
  const sources: RepositoryAccessSource[] = [];

  if (input.sources.directRole !== null) {
    sources.push({ kind: 'direct-grant', role: input.sources.directRole });
  }
  if (input.sources.governanceRole !== null) {
    sources.push({ kind: 'governance-derived', role: input.sources.governanceRole });
  }
  if (input.visibility === 'public') sources.push({ kind: 'public-visibility' });

  const effectiveCapabilities = new Set<RepositoryCapability>();

  if (effectiveRole !== null) {
    for (const capability of repositoryCapabilities) {
      if (hasRepositoryCapability(effectiveRole, capability)) effectiveCapabilities.add(capability);
    }
  }

  if (input.visibility === 'public') {
    for (const capability of publicReadCapabilities) effectiveCapabilities.add(capability);

    if (input.actorTrust === 'authenticated') {
      for (const capability of authenticatedPublicParticipationCapabilities) {
        effectiveCapabilities.add(capability);
      }
    }

    // GitHub public-Wiki editing is collaborator-scoped by default. Public visibility alone does
    // not create mutation authority; an assigned/governance-derived Repository Role proves the
    // collaborator relationship. The optional GitHub setting that allows every account to edit a
    // public Wiki is not admitted by the target Product.
    if (effectiveRole !== null) {
      for (const capability of publicCollaboratorWikiCapabilities) {
        effectiveCapabilities.add(capability);
      }
    }
  }

  return {
    actorTrust: input.actorTrust,
    effectiveCapabilities: repositoryCapabilities.filter((capability) =>
      effectiveCapabilities.has(capability)
    ),
    effectiveRole,
    sources,
    visibility: input.visibility
  };
}

export function decideRepositoryCapability(
  input: RepositoryAccessExplanationInput,
  requestedCapability: RepositoryCapability
): RepositoryCapabilityDecision {
  const explanation = explainRepositoryAccess(input);
  return {
    ...explanation,
    allowed: explanation.effectiveCapabilities.includes(requestedCapability),
    requestedCapability
  };
}
