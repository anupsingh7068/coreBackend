import { Request, Response, NextFunction } from 'express';
import { ResponseService } from '../response/response';

/**
 * Simple CSRF protection middleware
 * In production, use a proper CSRF library like 'csurf'
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    next();
    return;
  }

  // Check for CSRF token in headers
  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionToken = req.headers['x-session-token'] as string;

  // Basic CSRF validation (in production, use proper token generation/validation)
  if (!csrfToken || !sessionToken) {
    ResponseService.error(res, 'CSRF token required', [], 403);
    return;
  }

  // Simple validation - in production, implement proper CSRF token validation
  if (csrfToken.length < 10 || sessionToken.length < 10) {
    ResponseService.error(res, 'Invalid CSRF token', [], 403);
    return;
  }

  next();
};

/**
 * Generate CSRF token endpoint
 */
export const generateCSRFToken = (req: Request, res: Response): void => {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  
  ResponseService.success(res, 'CSRF token generated', {
    csrfToken: token,
    sessionToken: Date.now().toString()
  });
};