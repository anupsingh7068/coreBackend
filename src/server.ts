import app from './app';
import { logger } from './core/logger/logger';
import { config, validateConfig } from './core/config/config';
import { database } from './core/database/connection';
import { CacheService } from './core/cache/cache';
import dotenv from 'dotenv';

dotenv.config();

const PORT = config.app.port;
const cacheService = CacheService.getInstance();

async function startServer(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();
    logger.info('Configuration validated successfully');

    // Connect to database
    await database.connect();
    logger.info('Database connection established');

    // Connect to cache (Redis with fallback)
    await cacheService.connect();
    logger.info('Cache service initialized');

    // Start server
    app.listen(PORT, () => {
      logger.success(`🚀 Server is running on port ${PORT}`);
      logger.info(`📍 Environment: ${config.app.env}`);
      logger.info(`🗄️ Database: ${database.isConnected() ? 'Connected' : 'Disconnected'}`);
      logger.info(`💾 Cache: ${cacheService.isConnected() ? 'Redis Connected' : 'In-Memory Fallback'}`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/api/health`);
      logger.info(`📡 API Base: http://localhost:${PORT}/api/v1`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await database.disconnect();
  await cacheService.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await database.disconnect();
  await cacheService.disconnect();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

startServer();
