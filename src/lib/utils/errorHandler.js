/**
 * Error handling utilities
 */

/**
 * Extract user-friendly error message from various error formats
 */
export const getErrorMessage = (error) => {
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle error object with message property
  if (error?.message) {
    return error.message;
  }

  // Handle axios error response
  if (error?.data?.message) {
    return error.data.message;
  }

  // Handle response with error details
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Default message
  return 'An unexpected error occurred';
};

/**
 * Format error for logging
 */
export const formatError = (error, context = '') => {
  const timestamp = new Date().toISOString();
  const message = getErrorMessage(error);
  const status = error?.status || error?.response?.status;

  return {
    timestamp,
    context,
    message,
    status,
    details: {
      url: error?.data?.originalError?.config?.url,
      method: error?.data?.originalError?.config?.method,
    },
  };
};

/**
 * Parse API error response
 */
export const parseApiError = (error) => {
  const formatted = formatError(error);

  return {
    message: formatted.message,
    status: formatted.status,
    timestamp: formatted.timestamp,
    isNetworkError: !formatted.status,
    isAuthError: formatted.status === 401,
    isValidationError: formatted.status === 400,
    isServerError: formatted.status >= 500,
  };
};

/**
 * Validation error handler
 */
export const getValidationErrors = (error) => {
  if (!error?.data?.errors) {
    return {};
  }

  return error.data.errors;
};
