import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { logger } from '../logger/logger';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export class JWTService {
  private static instance: JWTService;

  public static getInstance(): JWTService {
    if (!JWTService.instance) {
      JWTService.instance = new JWTService();
    }
    return JWTService.instance;
  }

  public generateToken(payload: JWTPayload): string {
    try {
      return jwt.sign(payload, config.security.jwtSecret, {
        expiresIn: '24h',
        issuer: config.app.name
      });
    } catch (error) {
      logger.error('Error generating JWT token:', error);
      throw new Error('Token generation failed');
    }
  }

  public verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.security.jwtSecret) as JWTPayload;
    } catch (error) {
      logger.error('Error verifying JWT token:', error);
      throw new Error('Invalid token');
    }
  }

  public refreshToken(token: string): string {
    try {
      const decoded = this.verifyToken(token);
      const { iat, exp, ...payload } = decoded as any;
      return this.generateToken(payload);
    } catch (error) {
      logger.error('Error refreshing JWT token:', error);
      throw new Error('Token refresh failed');
    }
  }
}