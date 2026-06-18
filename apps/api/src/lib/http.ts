/** Throwable HTTP error — formatted consistently by the global error handler. */
export function httpError(statusCode: number, message: string): Error & { statusCode: number } {
  const e = new Error(message) as Error & { statusCode: number };
  e.statusCode = statusCode;
  return e;
}
