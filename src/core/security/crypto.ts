import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { config } from '../config/config';

export class CryptoService {
  private static instance: CryptoService;
  private algorithm = 'aes-256-cbc';

  public static getInstance(): CryptoService {
    if (!CryptoService.instance) {
      CryptoService.instance = new CryptoService();
    }
    return CryptoService.instance;
  }

  // Generic encryption
  encrypt(text: string, key?: string): string {
    try {
      const secretKey = key || config.security.encryptionKey;
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(secretKey.substring(0, 32)), iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  // Generic decryption
  decrypt(encryptedText: string, key?: string): string {
    try {
      const secretKey = key || config.security.encryptionKey;
      const [ivHex, encrypted] = encryptedText.split(':');
      const iv = Buffer.from(ivHex, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(secretKey.substring(0, 32)), iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  // Password hashing
  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, config.security.hashRounds);
    } catch (error) {
      throw new Error('Password hashing failed');
    }
  }

  // Password verification
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error('Password verification failed');
    }
  }

  // Generate random token
  generateToken(length: number = 32): string {
    try {
      return crypto.randomBytes(length).toString('hex');
    } catch (error) {
      throw new Error('Token generation failed');
    }
  }
}