import { Request, Response, NextFunction } from 'express';
import { JWTService, JWTPayload } from '../security/jwt';
import { CacheService } from '../cache/cache';
import { ResponseService } from '../response/response';
import { logger } from '../logger/logger';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

const jwtService = JWTService.getInstance();
const cacheService = CacheService.getInstance();

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ResponseService.unauthorized(res, 'Token required');
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      ResponseService.unauthorized(res, 'Token required');
      return;
    }

    // Verify token
    const decoded = jwtService.verifyToken(token);

    // Check if token is blacklisted
    const isBlacklisted = await cacheService.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      ResponseService.unauthorized(res, 'Token is invalid');
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    ResponseService.unauthorized(res, 'Invalid token');
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      ResponseService.forbidden(res, 'Insufficient permissions');
      return;
    }
    next();
  };
};

// Function to blacklist token
export const blacklistToken = async (token: string): Promise<void> => {
  try {
    await cacheService.set(`blacklist:${token}`, true, 24 * 60 * 60); // 24 hours
    logger.info('Token blacklisted successfully');
  } catch (error) {
    logger.error('Error blacklisting token:', error);
  }
};