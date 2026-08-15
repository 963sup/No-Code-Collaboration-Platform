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

export interface RepositoryAccessExplanation {
  readonly effectiveCapabilities: readonly RepositoryCapability[];
  readonly effectiveRole: RepositoryRole | null;
  readonly sources: readonly RepositoryAccessSource[];
  readonly visibility: RepositoryVisibility;
}

export interface RepositoryAccessExplanationInput {
  readonly sources: RepositoryAuthoritySources;
  readonly visibility: RepositoryVisibility;
}

export interface RepositoryCapabilityDecision extends RepositoryAccessExplanation {
  readonly allowed: boolean;
  readonly requestedCapability: RepositoryCapability;
}

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

  const effectiveCapabilities = repositoryCapabilities.filter((capability) => {
    if (
      input.visibility === 'public' &&
      (capability === 'repository.view' || capability === 'resource.view')
    ) {
      return true;
    }
    return effectiveRole !== null && hasRepositoryCapability(effectiveRole, capability);
  });

  return {
    effectiveCapabilities,
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
