import { Request, Response } from 'express';
import * as authService from './authService';
import { ResponseService } from '../../core/response/response';
import { logger } from '../../core/logger/logger';
import { AuthRequest } from '../../core/middleware/auth';
import { RegisterRequest, LoginRequest } from '../../core/validation/authValidation';

export const register = async (req: Request<{}, {}, RegisterRequest>, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;
    
    const result = await authService.registerUser(email, password, role);
    
    ResponseService.success(
      res, 
      'User registered successfully', 
      result, 
      201
    );

  } catch (error: any) {
    logger.error('Registration controller error:', error);
    
    if (error.message.includes('already exists')) {
      ResponseService.error(res, error.message, [], 409);
    } else {
      ResponseService.error(res, 'Registration failed', [error.message], 500);
    }
  }
};

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.loginUser(email, password);
    
    ResponseService.success(
      res, 
      'Login successful', 
      result
    );

  } catch (error: any) {
    logger.error('Login controller error:', error);
    
    if (error.message.includes('Invalid')) {
      ResponseService.error(res, 'Invalid email or password', [], 401);
    } else {
      ResponseService.error(res, 'Login failed', [error.message], 500);
    }
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    
    const profile = await authService.getUserProfile(userId);
    
    ResponseService.success(
      res, 
      'Profile retrieved successfully', 
      { user: profile }
    );

  } catch (error: any) {
    logger.error('Get profile controller error:', error);
    
    if (error.message.includes('not found')) {
      ResponseService.error(res, 'User not found', [], 404);
    } else {
      ResponseService.error(res, 'Failed to get profile', [error.message], 500);
    }
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const updates = req.body;
    
    // Only allow specific fields to be updated (prevent mass assignment)
    const allowedUpdates: { [key: string]: any } = {};
    const allowedFields = ['email'];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        allowedUpdates[field] = updates[field];
      }
    }
    
    const updatedProfile = await authService.updateUserProfile(userId, allowedUpdates);
    
    ResponseService.success(
      res, 
      'Profile updated successfully', 
      { user: updatedProfile }
    );

  } catch (error: any) {
    logger.error('Update profile controller error:', error);
    
    if (error.message.includes('not found')) {
      ResponseService.error(res, 'User not found', [], 404);
    } else {
      ResponseService.error(res, 'Failed to update profile', [error.message], 500);
    }
  }
};