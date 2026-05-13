export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");

  if (digits.startsWith("90") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length === 11) {
    return `+90${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    return `+90${digits}`;
  }

  return `+${digits}`;
}
