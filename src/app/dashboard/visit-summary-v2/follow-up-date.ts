/** The notes keep the follow-up date as "yyyy-mm-dd"; read it as a local Date. */
export function followUpDateToDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  return match ? new Date(+match[1], +match[2] - 1, +match[3]) : null;
}

/** A local Date back to "yyyy-mm-dd". */
export function followUpDateToString(date: Date | null): string {
  if (!date) { return ''; }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
