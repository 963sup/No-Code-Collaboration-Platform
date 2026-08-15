export type SurfaceSearchParams = Record<string, string | string[] | undefined>;

type TextRule = { readonly kind: 'text'; readonly maxLength?: number };
type EnumRule = {
  readonly kind: 'enum';
  readonly values: readonly string[];
  readonly defaultValue?: string;
};
type PageRule = { readonly kind: 'page' };
type UuidRule = { readonly kind: 'uuid' };
export type SurfaceQueryRule = TextRule | EnumRule | PageRule | UuidRule;

export interface NormalizedSurfaceQuery {
  readonly values: Readonly<Record<string, string>>;
  readonly search: string;
  readonly changed: boolean;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeSurfaceQuery(
  params: SurfaceSearchParams,
  rules: Readonly<Record<string, SurfaceQueryRule>>
): NormalizedSurfaceQuery {
  const canonical = new URLSearchParams();
  const values: Record<string, string> = {};

  for (const [name, rule] of Object.entries(rules)) {
    const raw = firstValue(params[name]);
    if (rule.kind === 'text') {
      const value = (raw ?? '').trim().slice(0, rule.maxLength ?? 200);
      if (value) {
        values[name] = value;
        canonical.set(name, value);
      }
      continue;
    }

    if (rule.kind === 'uuid') {
      const value = (raw ?? '').trim().toLowerCase();
      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(value)
      ) {
        values[name] = value;
        canonical.set(name, value);
      }
      continue;
    }

    if (rule.kind === 'page') {
      const parsed = Number.parseInt(raw ?? '1', 10);
      const value = Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
      values[name] = String(value);
      if (value > 1) canonical.set(name, String(value));
      continue;
    }

    const value = rule.values.includes(raw ?? '') ? (raw as string) : rule.defaultValue;
    if (value) {
      values[name] = value;
      if (value !== rule.defaultValue || raw === value) canonical.set(name, value);
    }
  }

  const original = new URLSearchParams();
  for (const [name, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((entry) => original.append(name, entry));
    else if (value !== undefined) original.set(name, value);
  }

  return {
    values,
    search: canonical.toString(),
    changed: original.toString() !== canonical.toString()
  };
}

export function canonicalSurfaceHref(pathname: string, normalized: NormalizedSurfaceQuery) {
  return normalized.search ? `${pathname}?${normalized.search}` : pathname;
}
