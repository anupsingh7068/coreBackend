import dotenv from 'dotenv';
dotenv.config();

export interface IConfig {
  app: {
    name: string;
    version: string;
    port: number;
    env: string;
  };
  database: {
    url: string;
    maxConnections: number;
  };
  security: {
    jwtSecret: string;
    encryptionKey: string;
    hashRounds: number;
  };
  cache: {
    host: string;
    port: number;
    ttl: number;
  };
  server: {
    rateLimit: {
      windowMs: number;
      maxRequests: number;
    };
    cors: {
      origins: string[];
    };
  };
}

const getEnvString = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

export const config: IConfig = {
  app: {
    name: getEnvString('APP_NAME', 'CoreBackend API'),
    version: getEnvString('APP_VERSION', '1.0.0'),
    port: getEnvNumber('PORT', 3000),
    env: getEnvString('NODE_ENV', 'development')
  },
  database: {
    url: getEnvString('DATABASE_URL', 'mongodb://localhost:27017/corebackend'),
    maxConnections: getEnvNumber('DB_MAX_CONNECTIONS', 10)
  },
  security: {
    jwtSecret: getEnvString('JWT_SECRET', 'your-secret-key'),
    encryptionKey: getEnvString('ENCRYPTION_KEY', 'your-encryption-key'),
    hashRounds: getEnvNumber('HASH_ROUNDS', 12)
  },
  cache: {
    host: getEnvString('REDIS_HOST', 'localhost'),
    port: getEnvNumber('REDIS_PORT', 6379),
    ttl: getEnvNumber('CACHE_TTL', 3600)
  },
  server: {
    rateLimit: {
      windowMs: getEnvNumber('RATE_LIMIT_WINDOW', 15 * 60 * 1000),
      maxRequests: getEnvNumber('RATE_LIMIT_MAX', 100)
    },
    cors: {
      origins: getEnvString('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
    }
  }
};

// Config validation
export const validateConfig = (): void => {
  if (!config.security.jwtSecret || config.security.jwtSecret === 'your-secret-key') {
    console.warn('Warning: Using default JWT secret. Set JWT_SECRET environment variable.');
  }
  if (config.app.env === 'production' && config.database.url.includes('localhost')) {
    throw new Error('Production environment requires remote database connection');
  }
};