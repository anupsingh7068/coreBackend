import mongoose from 'mongoose';
import { config } from '../config/config';
import { logger } from '../logger/logger';

export class DatabaseConnection {
  private static instance: DatabaseConnection;

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    try {
      const connectionString = this.buildConnectionString();
      
      await mongoose.connect(connectionString, {
        maxPoolSize: config.database.maxConnections,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        bufferCommands: false
      });

      logger.success('✅ MongoDB Atlas connected successfully');
      logger.info(`📊 Database: ${mongoose.connection.db?.databaseName || 'Connected'}`);
      
      // Connection event listeners
      mongoose.connection.on('error', (error) => {
        logger.error('Database connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('Database disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('Database reconnected');
      });

    } catch (error) {
      logger.error('Failed to connect to MongoDB Atlas:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
    }
  }

  public isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  private buildConnectionString(): string {
    return config.database.url;
  }
}

export const database = DatabaseConnection.getInstance();