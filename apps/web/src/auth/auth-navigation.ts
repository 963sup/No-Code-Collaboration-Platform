const DEFAULT_AUTHENTICATED_PATH = '/app';

const INTERNAL_ORIGIN = 'https://auth-navigation.invalid';
const MAX_INTERNAL_PATH_LENGTH = 2048;

export type RouteAccess =
  | 'anonymous-only'
  | 'authenticated'
  | 'auth-protocol'
  | 'identity-proof'
  | 'public';

function containsControlCharacter(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const characterCode = value.charCodeAt(index);
    if (characterCode <= 0x1f || characterCode === 0x7f) return true;
  }

  return false;
}

export function classifyRouteAccess(pathname: string): RouteAccess {
  if (pathname === '/sign-in' || pathname === '/sign-up') return 'anonymous-only';
  if (pathname === '/verify-email') return 'identity-proof';
  if (pathname === '/auth/error') return 'public';
  if (pathname.startsWith('/auth/')) return 'auth-protocol';
  if (pathname === '/app' || pathname.startsWith('/app/')) return 'authenticated';
  return 'public';
}

export function buildPath(
  pathname: string,
  parameters: Readonly<Record<string, string | undefined>>
) {
  const search = new URLSearchParams();

  for (const [name, value] of Object.entries(parameters)) {
    if (value !== undefined && value !== '') search.set(name, value);
  }

  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function resolveSafeNextPath(value: string | null | undefined) {
  const candidate = value?.trim();

  if (
    !candidate ||
    candidate.length > MAX_INTERNAL_PATH_LENGTH ||
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.includes('\\') ||
    containsControlCharacter(candidate)
  ) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  try {
    const parsed = new URL(candidate, INTERNAL_ORIGIN);
    if (parsed.origin !== INTERNAL_ORIGIN) return DEFAULT_AUTHENTICATED_PATH;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return DEFAULT_AUTHENTICATED_PATH;
  }
}

export function resolvePostAuthDestination(value: string | null | undefined) {
  const destination = resolveSafeNextPath(value);
  const pathname = new URL(destination, INTERNAL_ORIGIN).pathname;
  const access = classifyRouteAccess(pathname);

  return access === 'anonymous-only' || access === 'auth-protocol' || access === 'identity-proof'
    ? DEFAULT_AUTHENTICATED_PATH
    : destination;
}
