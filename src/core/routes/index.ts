import { Router } from 'express';
import { logger } from '../logger/logger';
import { HTTP_STATUS } from '../config/constants';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { ResponseService } from '../response/response';
import { JWTService } from '../security/jwt';
import authRoutes from '../../modules/auth/authRoutes';

const router = Router();
const jwtService = JWTService.getInstance();

// Auth routes
router.use('/auth', authRoutes);

// Public test route
router.get('/test', (req, res) => {
  logger.info('Test route accessed');
  ResponseService.success(res, 'API is working!', {
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Cache test route
router.get('/cache-test', async (req, res) => {
  try {
    const { CacheService } = await import('../cache/cache');
    const cacheService = CacheService.getInstance();
    
    // Test cache operations
    const testKey = 'test_key_' + Date.now();
    const testValue = { message: 'Redis test', timestamp: new Date().toISOString() };
    
    // Set value
    await cacheService.set(testKey, testValue, 60); // 60 seconds TTL
    
    // Get value
    const retrievedValue = await cacheService.get(testKey);
    
    // Check if exists
    const exists = await cacheService.exists(testKey);
    
    // Delete value
    await cacheService.delete(testKey);
    
    ResponseService.success(res, 'Cache test completed', {
      cacheType: cacheService.isConnected() ? 'Redis' : 'In-Memory',
      isConnected: cacheService.isConnected(),
      testResults: {
        setValue: testValue,
        retrievedValue: retrievedValue,
        existsCheck: exists,
        testPassed: JSON.stringify(testValue) === JSON.stringify(retrievedValue)
      }
    });
    
  } catch (error: any) {
    logger.error('Cache test error:', error);
    ResponseService.error(res, 'Cache test failed', [error.message]);
  }
});

// Generate test token route
router.post('/generate-token', (req, res) => {
  try {
    const testPayload = {
      id: 'test-user-123',
      email: 'test@example.com',
      role: 'admin'
    };
    
    const token = jwtService.generateToken(testPayload);
    
    ResponseService.success(res, 'Token generated successfully', {
      token,
      user: testPayload
    });
  } catch (error) {
    logger.error('Token generation error:', error);
    ResponseService.error(res, 'Failed to generate token');
  }
});

// Protected test route
router.get('/protected', authenticate, (req: AuthRequest, res) => {
  logger.info('Protected route accessed by:', req.user?.email);
  ResponseService.success(res, 'Access granted to protected route', {
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Admin only route
router.get('/admin', 
  authenticate, 
  authorize(['admin']), 
  (req: AuthRequest, res) => {
    logger.info('Admin route accessed by:', req.user?.email);
    ResponseService.success(res, 'Admin access granted', {
      user: req.user,
      timestamp: new Date().toISOString()
    });
  }
);

export default router;