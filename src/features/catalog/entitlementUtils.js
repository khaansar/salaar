/**
 * Current payment-service EntitlementView uses productType,
 * productReferenceId, status, and expiresAt.
 */
export function hasActiveEntitlementForTest(entitlements, test) {
  if (test?.isFree === true) return true;

  const testId = String(test?.testId ?? test?.id ?? '');
  const seriesId = String(test?.seriesId ?? test?.parentSeriesId ?? '');
  if (!testId) return false;

  const now = Date.now();
  return entitlements.some((entitlement) => {
    if (String(entitlement?.status ?? '').toUpperCase() !== 'ACTIVE') return false;
    if (entitlement?.expiresAt) {
      const expiry = Date.parse(entitlement.expiresAt);
      if (Number.isFinite(expiry) && expiry <= now) return false;
    }

    const type = String(entitlement?.productType ?? '').toUpperCase();
    const referenceId = String(entitlement?.productReferenceId ?? '');
    if (type === 'TEST' && referenceId === testId) return true;
    if (type === 'TEST_SERIES' && seriesId && referenceId === seriesId) return true;
    return false;
  });
}

export function hasActiveEntitlementForSeries(entitlements, seriesOrOptions) {
  if (!seriesOrOptions) return false;

  const options =
    typeof seriesOrOptions === 'object'
      ? seriesOrOptions
      : { seriesId: seriesOrOptions };

  if (options.isFree === true) return true;
  if (!Array.isArray(entitlements)) return false;

  const targetIds = [options.seriesId, options.id, options.slug]
    .filter(Boolean)
    .map(String);
  if (targetIds.length === 0) return false;

  const now = Date.now();
  return entitlements.some((entitlement) => {
    if (String(entitlement?.status ?? '').toUpperCase() !== 'ACTIVE') return false;
    if (entitlement?.expiresAt) {
      const expiry = Date.parse(entitlement.expiresAt);
      if (Number.isFinite(expiry) && expiry <= now) return false;
    }

    const type = String(entitlement?.productType ?? entitlement?.type ?? '').toUpperCase();
    const referenceId = String(entitlement?.productReferenceId ?? entitlement?.referenceId ?? '');
    const isSeries = type === 'TEST_SERIES' || type === 'SERIES';

    return isSeries && targetIds.includes(referenceId);
  });
}

