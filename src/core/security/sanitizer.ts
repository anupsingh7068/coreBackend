/**
 * Sanitize user input to prevent log injection and other attacks
 */
export const sanitizeForLog = (input: any): string => {
  if (typeof input !== 'string') {
    input = String(input);
  }
  
  // Remove control characters and newlines to prevent log injection
  return input
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .substring(0, 100); // Limit length
};

/**
 * Sanitize email input
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  // Basic email normalization
  return email.toLowerCase().trim();
};

/**
 * Escape HTML characters
 */
const escapeHtml = (str: string): string => {
  const htmlEscapes: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return str.replace(/[&<>"'\/]/g, (match) => htmlEscapes[match]);
};

/**
 * Sanitize MongoDB query to prevent NoSQL injection
 */
export const sanitizeMongoQuery = (query: any): any => {
  if (typeof query !== 'object' || query === null) {
    return query;
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(query)) {
    // Prevent MongoDB operators in user input
    if (key.startsWith('$')) {
      continue;
    }
    
    if (typeof value === 'string') {
      sanitized[key] = escapeHtml(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeMongoQuery(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Sanitize object for safe updates (prevent mass assignment)
 */
export const sanitizeUpdateFields = (updates: any, allowedFields: string[]): any => {
  const sanitized: any = {};
  
  for (const field of allowedFields) {
    if (updates.hasOwnProperty(field)) {
      sanitized[field] = updates[field];
    }
  }
  
  return sanitized;
};