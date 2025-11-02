import winston from 'winston';
import { config } from '../config/config';

class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private constructor() {
    this.logger = winston.createLogger({
      level: config.app.env === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ timestamp, level, message, stack }) => {
              return `${timestamp} [${level}]: ${message}${stack ? '\n' + stack : ''}`;
            })
          )
        })
      ]
    });

    // Add file transport for production
    if (config.app.env === 'production') {
      this.logger.add(new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error'
      }));
      this.logger.add(new winston.transports.File({
        filename: 'logs/combined.log'
      }));
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public error(message: string, error?: any): void {
    this.logger.error(message, error);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  public success(message: string, meta?: any): void {
    this.logger.info(`✅ ${message}`, meta);
  }
}

export const logger = Logger.getInstance();