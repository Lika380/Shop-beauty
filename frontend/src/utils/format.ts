export function money(value: number | string | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : value ?? 0;
  return `${(Number.isFinite(num) ? num : 0).toFixed(2)} ₸`;
}

export function toNumber(value: number | string | null | undefined): number {
  const num = typeof value === 'string' ? parseFloat(value) : value ?? 0;
  return Number.isFinite(num) ? num : 0;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
}
