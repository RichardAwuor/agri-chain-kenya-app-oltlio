// List of free email domains to block
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'zoho.com',
]);

export function isValidPaidEmailDomain(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;
  return !FREE_EMAIL_DOMAINS.has(domain);
}

export function emailsMatch(email1: string, email2: string): boolean {
  return email1.toLowerCase() === email2.toLowerCase();
}

export function isValidWeekNumber(weekNumber: number): boolean {
  return weekNumber >= 1 && weekNumber <= 53;
}

// Check if collection estimation week is at least 7 days ahead
export function isValidCollectionEstimationWeek(weekNumber: number): boolean {
  const today = new Date();
  const currentWeek = getWeekNumber(today);
  const daysUntilEndOfWeek = 6 - today.getDay();

  // If more than 6 days until end of week, allow current week
  if (daysUntilEndOfWeek > 6) {
    return weekNumber > currentWeek;
  }

  // Otherwise, must be at least 2 weeks ahead
  return weekNumber > currentWeek + 1;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Conversion: 1 kg = 2.20462 lbs
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 100) / 100;
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 100) / 100;
}
