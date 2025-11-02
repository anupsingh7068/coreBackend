import { createClient, RedisClientType } from 'redis';
import { logger } from '../logger/logger';
import { config } from '../config/config';

export class CacheService {
  private static instance: CacheService;
  private redisClient: RedisClientType | null = null;
  private fallbackCache: Map<string, { value: any; expiry: number }> = new Map();
  private isRedisConnected = false;

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public async connect(): Promise<void> {
    // Check if Redis should be enabled
    const enableRedis = process.env.ENABLE_REDIS === 'true';
    
    if (!enableRedis) {
      logger.info('📦 Using in-memory cache (Redis disabled)');
      this.isRedisConnected = false;
      return;
    }

    try {
      this.redisClient = createClient({
        socket: {
          host: config.cache.host,
          port: config.cache.port,
          connectTimeout: 5000
        }
      });

      this.redisClient.on('error', (err) => {
        logger.warn('Redis unavailable, using in-memory cache');
        this.isRedisConnected = false;
      });

      this.redisClient.on('connect', () => {
        logger.success('✅ Redis connected successfully');
        this.isRedisConnected = true;
      });

      this.redisClient.on('disconnect', () => {
        logger.warn('Redis disconnected, using in-memory cache');
        this.isRedisConnected = false;
      });

      await this.redisClient.connect();
      
    } catch (error) {
      logger.info('Redis not available, using in-memory cache');
      this.isRedisConnected = false;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.disconnect();
        logger.info('Redis disconnected successfully');
      }
    } catch (error) {
      logger.error('Error disconnecting Redis:', error);
    }
  }

  public async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.setEx(key, ttlSeconds, serializedValue);
        logger.debug(`Redis cache set: ${key}`);
      } else {
        // Fallback to in-memory cache
        const expiry = Date.now() + (ttlSeconds * 1000);
        this.fallbackCache.set(key, { value, expiry });
        logger.debug(`Memory cache set: ${key}`);
      }
    } catch (error) {
      logger.error('Cache set error:', error);
      // Fallback to in-memory cache
      const expiry = Date.now() + (ttlSeconds * 1000);
      this.fallbackCache.set(key, { value, expiry });
    }
  }

  public async get(key: string): Promise<any> {
    try {
      if (this.isRedisConnected && this.redisClient) {
        const value = await this.redisClient.get(key);
        if (value) {
          logger.debug(`Redis cache hit: ${key}`);
          return JSON.parse(value);
        }
        return null;
      } else {
        // Fallback to in-memory cache
        const item = this.fallbackCache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
          this.fallbackCache.delete(key);
          return null;
        }
        
        logger.debug(`Memory cache hit: ${key}`);
        return item.value;
      }
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      if (this.isRedisConnected && this.redisClient) {
        const exists = await this.redisClient.exists(key);
        return exists === 1;
      } else {
        // Fallback to in-memory cache
        const item = this.fallbackCache.get(key);
        if (!item) return false;
        
        if (Date.now() > item.expiry) {
          this.fallbackCache.delete(key);
          return false;
        }
        
        return true;
      }
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      if (this.isRedisConnected && this.redisClient) {
        await this.redisClient.del(key);
        logger.debug(`Redis cache deleted: ${key}`);
      } else {
        // Fallback to in-memory cache
        this.fallbackCache.delete(key);
        logger.debug(`Memory cache deleted: ${key}`);
      }
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  public isConnected(): boolean {
    return this.isRedisConnected;
  }
}