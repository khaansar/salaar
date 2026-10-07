import { safeNextPath } from '../utils/redirect';

const SUPPORTED_PROVIDERS = new Set([
  'google',
  'microsoft',
]);

/**
 * Starts the OAuth flow through the ClearIt IAM service.
 *
 * The frontend never receives or stores the provider access token.
 * IAM owns the complete OAuth/OIDC flow and establishes the normal
 * ClearIt ACCESS_TOKEN / REFRESH_TOKEN session.
 */
export function startOAuth(provider, next = '/') {
  if (!SUPPORTED_PROVIDERS.has(provider)) {
    console.error(`Unsupported OAuth provider: ${provider}`);
    return;
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    console.error(
      'NEXT_PUBLIC_API_BASE_URL is not configured. OAuth cannot be started.'
    );
    return;
  }

  const safeDestination = safeNextPath(next, '/');

  try {
    const authorizationUrl = new URL(
      `/auth-api/oauth2/authorization/${provider}`,
      apiBaseUrl
    );

    authorizationUrl.searchParams.set('next', safeDestination);

    window.location.assign(authorizationUrl.toString());
  } catch (error) {
    console.error('Unable to start OAuth authentication:', error);
  }
}