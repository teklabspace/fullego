/**
 * Helpers for working with the standardized API error envelope on the client.
 * The API client attaches `code`, `status`/`statusCode`, and `details` to thrown
 * errors; these turn a validation error into per-field messages for forms.
 */
import { ERROR_CODES } from '@/config/apiErrorCodes';

/** Whether an error is a 422 field-validation failure. */
export const isValidationError = (err) =>
  err?.code === ERROR_CODES.VALIDATION_ERROR ||
  err?.status === 422 ||
  err?.statusCode === 422;

/**
 * Map the flattened `error.details` ([{ field, message }]) into { field: message }.
 * `field` is the backend's dot-joined path (leading body/query/path stripped),
 * e.g. "first_name" or "items.0.price". First message per field wins.
 */
export const fieldErrorsFromError = (err) => {
  const details = err?.details || err?.data?.error?.details;
  if (!Array.isArray(details)) return {};
  return details.reduce((acc, d) => {
    if (d?.field && d?.message && !acc[d.field]) acc[d.field] = d.message;
    return acc;
  }, {});
};
