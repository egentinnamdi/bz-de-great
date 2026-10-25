export { cn } from "cn";

export function formatPhoneForWhatsApp(phone?: string | null, fallback = '2347064482628'): string {
  if (!phone) return fallback;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return fallback;
  // If Nigerian local format starting with 0 (e.g. 080... 11 digits)
  if (digits.startsWith('0') && digits.length === 11) {
    return '234' + digits.slice(1);
  }
  // If Nigerian local format without leading 0 (10 digits starting with 7, 8, 9)
  if (digits.length === 10 && /^[789]/.test(digits)) {
    return '234' + digits;
  }
  // If starts with 234 or international code
  if (digits.length >= 10) {
    return digits;
  }
  return fallback;
}
