import { ApiError } from '../api/client';

export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.code === 'FORBIDDEN') return 'У вас нет доступа к этому разделу.';
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export function getErrorCode(err: unknown): string | undefined {
  return err instanceof ApiError ? err.code : undefined;
}
