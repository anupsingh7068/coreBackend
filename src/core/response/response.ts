import { Response } from 'express';
import { HTTP_STATUS } from '../config/constants';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp: string;
}

export class ResponseService {
  static success<T>(
    res: Response,
    message: string = 'Success',
    data?: T,
    statusCode: number = HTTP_STATUS.OK
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string = 'Error occurred',
    errors?: string[],
    statusCode: number = HTTP_STATUS.BAD_REQUEST
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
  }

  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): Response {
    return this.error(res, message, [], HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(
    res: Response,
    message: string = 'Access forbidden'
  ): Response {
    return this.error(res, message, [], HTTP_STATUS.FORBIDDEN);
  }
}