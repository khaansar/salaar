const NETWORK_ERROR =
  "We couldn't reach ClearIt. Check your internet connection and try again.";
const SERVER_ERROR =
  'Something went wrong on our side. Please try again in a moment.';

/**
 * Splits a normalized API error (see lib/apiClient) into messages for individual
 * fields and one message for the form as a whole.
 *
 * @param err        `{ message, code, status, errors: [{ field, issue }] }` or a string
 * @param fallback   message used when the error carries none
 * @param codeFields error code -> form field that the error belongs to
 * @param fieldMap   API field name -> form field name, when they differ
 */
export function parseFormError(err, { fallback = 'Something went wrong. Please try again.', codeFields = {}, fieldMap = {} } = {}) {
  const fieldErrors = {};

  if (!err || typeof err === 'string') {
    return { fieldErrors, formError: err || fallback };
  }

  if (err.code && codeFields[err.code]) {
    fieldErrors[codeFields[err.code]] = err.message || fallback;
    return { fieldErrors, formError: null };
  }

  const details = Array.isArray(err.errors) ? err.errors : [];
  details.forEach((detail) => {
    const field = fieldMap[detail?.field] ?? detail?.field;
    const message = detail?.issue || detail?.message;
    if (field && message && !fieldErrors[field]) {
      fieldErrors[field] = message;
    }
  });

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, formError: null };
  }

  if (err.message === 'Network Error') {
    return { fieldErrors, formError: NETWORK_ERROR };
  }

  if (err.status >= 500) {
    return { fieldErrors, formError: SERVER_ERROR };
  }

  return { fieldErrors, formError: err.message || fallback };
}
