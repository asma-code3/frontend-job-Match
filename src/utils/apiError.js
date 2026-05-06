export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const status = error?.response?.status;
  const serverMessage = error?.response?.data?.message;

  if (serverMessage && String(serverMessage).trim()) return String(serverMessage);
  if (status === 401) return 'Your session has expired. Please login again.';
  if (status === 403) return 'You are not allowed to perform this action.';
  if (status === 404) return 'The requested resource was not found.';
  if (status === 409) return 'A conflict occurred. Please refresh and try again.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'Server error. Please try again in a moment.';
  return fallback;
};

