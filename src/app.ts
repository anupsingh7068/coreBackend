import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { config } from './core/config/config';
import { logger } from './core/logger/logger';
import { HTTP_STATUS, MESSAGES } from './core/config/constants';

const app = express();

// Basic middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter
const limiter = rateLimit({
  windowMs: config.server.rateLimit.windowMs,
  max: config.server.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: MESSAGES.TOO_MANY_REQUESTS
  }
});
app.use(limiter);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || config.server.cors.origins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthStatus = {
    status: 'Healthy',
    message: `${config.app.name} is running`,
    version: config.app.version,
    environment: config.app.env,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: require('./core/database/connection').database.isConnected() ? 'Connected' : 'Disconnected'
    },
    cache: {
      status: require('./core/cache/cache').CacheService.getInstance().isConnected() ? 'Redis Connected' : 'In-Memory Fallback'
    }
  };
  res.status(HTTP_STATUS.OK).json({ success: true, data: healthStatus });
});

// API routes
import apiRoutes from './core/routes/index';
app.use('/api/v1', apiRoutes);

// Debug: List all registered routes
app._router.stack.forEach((middleware: any) => {
  if (middleware.route) {
    logger.info(`Route registered: ${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler: any) => {
      if (handler.route) {
        logger.info(`Nested route: ${Object.keys(handler.route.methods)} /api/v1${handler.route.path}`);
      }
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: MESSAGES.NOT_FOUND
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Application Error:', error);
  res.status(HTTP_STATUS.INTERNAL_ERROR).json({
    success: false,
    message: config.app.env === 'production' ? MESSAGES.INTERNAL_ERROR : error.message
  });
});

export default app;