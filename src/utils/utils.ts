export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
export const uuid = () => Math.random().toString(36).slice(2);

export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Sanitizes user input to prevent XSS attacks
 * Removes potentially dangerous characters and enforces length limits
 * @param input - Raw user input string
 * @param maxLength - Maximum allowed length (default: 50)
 * @returns Sanitized string
 */
export function sanitizeInput(input: string, maxLength = 50): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove potentially dangerous characters
    .replace(/[<>'"&]/g, '')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Enforce max length
    .substring(0, maxLength);
}

/**
 * Sanitizes a name specifically - more permissive than general input
 * Allows letters, spaces, hyphens, apostrophes, and common name characters
 * @param name - Raw name input
 * @param maxLength - Maximum allowed length (default: 50)
 * @returns Sanitized name
 */
export function sanitizeName(name: string, maxLength = 50): string {
  if (!name || typeof name !== 'string') {
    return '';
  }
  
  return name
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Allow only letters, spaces, hyphens, apostrophes, periods, and accented characters
    .replace(/[^a-zA-Z\s\-'.À-ÿ]/g, '')
    // Remove multiple consecutive spaces
    .replace(/\s+/g, ' ')
    // Enforce max length
    .substring(0, maxLength);
}
