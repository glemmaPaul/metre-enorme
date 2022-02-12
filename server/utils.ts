export function formatErrorResponse(error: Error | string): object {
  const message = error instanceof Error ? error.message : error

  return {
    type: 'error',
    message,
  };
}
