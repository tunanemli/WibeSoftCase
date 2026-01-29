export function getSessionId(headers: Record<string, string | string[] | undefined>): string {
  const sessionId =
    (headers['x-session-id'] as string) ||
    (headers['session-id'] as string) ||
    'default-session';

  return sessionId;
}
