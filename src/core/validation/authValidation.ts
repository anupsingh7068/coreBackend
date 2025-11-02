import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ResponseService } from '../response/response';

export interface RegisterRequest {
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

const registerSchema = Joi.object<RegisterRequest>({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 50 characters',
      'any.required': 'Password is required'
    }),
  role: Joi.string()
    .valid('user', 'admin')
    .default('user')
    .messages({
      'any.only': 'Role must be either user or admin'
    })
});

const loginSchema = Joi.object<LoginRequest>({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => detail.message);
    ResponseService.error(res, 'Validation failed', errors, 400);
    return;
  }
  
  req.body = value;
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => detail.message);
    ResponseService.error(res, 'Validation failed', errors, 400);
    return;
  }
  
  req.body = value;
  next();
};