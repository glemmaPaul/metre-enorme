export function formatErrorResponse(error: Error): object {
  return {
    type: 'error',
    message: error.message,
  };
}
