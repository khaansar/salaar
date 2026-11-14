import { safeNextPath } from '../utils/redirect';

const SUPPORTED_PROVIDERS = new Set([
  'google',
]);

/**
 * Starts the OAuth flow through the ClearIt IAM service.
 *
 * The frontend never receives or stores the provider access token.
 * IAM owns the complete OAuth/OIDC flow and establishes the normal
 * ClearIt ACCESS_TOKEN / REFRESH_TOKEN session.
 *
 * Returns false when sign-in could not be started (unsupported provider,
 * missing NEXT_PUBLIC_API_BASE_URL or an invalid URL) so the caller can
 * show a message.
 */
export function startOAuth(provider, next = '/') {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!SUPPORTED_PROVIDERS.has(provider) || !apiBaseUrl) {
    return false;
  }

  const safeDestination = safeNextPath(next, '/');

  try {
    const authorizationUrl = new URL(
      `/auth-api/oauth2/authorization/${provider}`,
      apiBaseUrl
    );

    authorizationUrl.searchParams.set('next', safeDestination);

    window.location.assign(authorizationUrl.toString());
    return true;
  } catch {
    return false;
  }
}