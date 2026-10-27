export { cn } from "cn";

export function formatPhoneForWhatsApp(phone?: string | null, fallback = '2347047531433'): string {
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

export function formatRmbUpdatedAt(isoString?: string | null, fallbackDisplay?: string): string {
  if (isoString) {
    const d = new Date(isoString);
    if (!isNaN(d.getTime())) {
      const now = new Date();
      const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const diffDays = Math.round((startOfToday - startOfDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return `${timeStr} Today`;
      } else if (diffDays === 1) {
        return `${timeStr} Yesterday`;
      } else if (diffDays > 1 && diffDays < 7) {
        const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
        return `${timeStr} ${weekday}`;
      } else {
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${timeStr} · ${dateStr}`;
      }
    }
  }

  if (fallbackDisplay) {
    if (fallbackDisplay.includes('5:09 PM')) {
      return '5:09 PM Yesterday';
    }
    return fallbackDisplay;
  }

  return '5:09 PM Yesterday';
}
