/**
 * Returns `candidate` only if it is a same-site relative path.
 * Rejects protocol-relative ("//evil.com") and backslash ("/\\evil.com")
 * URLs, which start with "/" but leave the site.
 */
export function safeNextPath(candidate, fallback = '/') {
  if (typeof candidate !== 'string') return fallback;
  if (!candidate.startsWith('/')) return fallback;
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return fallback;
  return candidate;
}
