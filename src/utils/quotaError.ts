export function isQuotaExceededError(err: unknown): boolean {
  if (!err) return false;
  const text =
    typeof err === 'string'
      ? err
      : err instanceof Error
        ? `${err.name} ${err.message}`
        : JSON.stringify(err);
  const normalized = text.toUpperCase();
  return (
    normalized.includes('RESOURCE_EXHAUSTED') ||
    normalized.includes('OVER_QUERY_LIMIT') ||
    normalized.includes('OVERQUOTAMAPERROR') ||
    normalized.includes('QUOTAEXCEEDED') ||
    normalized.includes('429')
  );
}

export function notifyQuotaExceededIfApplicable(err: unknown): boolean {
  if (isQuotaExceededError(err)) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    return true;
  }
  return false;
}
