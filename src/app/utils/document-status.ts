// Same transitions as the backend (DocumentStatus.java): PENDING -> COMPLETED / CANCELLED,
// COMPLETED -> CANCELLED, CANCELLED is final
export function allowedStatusCodes(current: string): string[] {
  switch (current) {
    case 'PENDING':
      return ['PENDING', 'COMPLETED', 'CANCELLED'];
    case 'COMPLETED':
      return ['COMPLETED', 'CANCELLED'];
    default:
      return ['CANCELLED'];
  }
}

export function statusBadgeClass(code: string | undefined): string {
  switch (code) {
    case 'COMPLETED':
      return 'badge border border-success text-success';
    case 'CANCELLED':
      return 'badge border border-danger text-danger';
    default:
      return 'badge border border-warning text-warning';
  }
}

// Local yyyy-MM-dd (input[type=date] format)
export function isoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
