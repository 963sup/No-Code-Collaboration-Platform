const ownerProfileTabs = ['overview', 'repositories', 'stars', 'projects'] as const;

export type OwnerProfileTab = (typeof ownerProfileTabs)[number];

export function ownerPath(ownerSlug: string) {
  return `/${encodeURIComponent(ownerSlug)}`;
}

export function ownerTabPath(ownerSlug: string, tab: Exclude<OwnerProfileTab, 'overview'>) {
  return `${ownerPath(ownerSlug)}?${new URLSearchParams({ tab }).toString()}`;
}

export function normalizeOwnerProfileTab(value: string | readonly string[] | undefined): {
  readonly tab: OwnerProfileTab;
  readonly changed: boolean;
} {
  if (value === undefined) return { tab: 'overview', changed: false };
  if (Array.isArray(value)) return { tab: 'overview', changed: true };
  if (value === 'repositories' || value === 'stars' || value === 'projects') {
    return { tab: value, changed: false };
  }
  return { tab: 'overview', changed: true };
}
