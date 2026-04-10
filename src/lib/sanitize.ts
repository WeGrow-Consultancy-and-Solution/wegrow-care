/**
 * Input sanitization utilities to prevent XSS and injection attacks.
 * Firebase Firestore is NoSQL so SQL injection doesn't apply,
 * but we still sanitize all user inputs against XSS.
 */

// Strip HTML tags and dangerous patterns
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script-related keywords followed by special chars
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Remove data: URIs that could contain scripts
    .replace(/data\s*:/gi, '')
    // Remove vbscript
    .replace(/vbscript\s*:/gi, '')
    // Trim whitespace
    .trim();
}

// Validate email format
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeInput(email).toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) return '';
  return sanitized;
}

// Sanitize phone number
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9+\-() ]/g, '').trim();
}

// Test for potential injection patterns (returns true if suspicious)
export function isSuspiciousInput(input: string): boolean {
  const patterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /--\s*$/,
    /;\s*drop/i,
    /'\s*or\s*'1'\s*=\s*'1/i,
    /"\s*or\s*"1"\s*=\s*"1/i,
  ];
  
  return patterns.some(p => p.test(input));
}
