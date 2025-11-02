import { User, IUser } from '../../core/database/models/User';
import { JWTService } from '../../core/security/jwt';
import { logger } from '../../core/logger/logger';
import { sanitizeForLog, sanitizeEmail, sanitizeMongoQuery, sanitizeUpdateFields } from '../../core/security/sanitizer';

export interface AuthResponse {
  user: any;
  token: string;
}

export interface UserProfile {
  _id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jwtService = JWTService.getInstance();

export const registerUser = async (email: string, password: string, role: string = 'user'): Promise<AuthResponse> => {
  try {
    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email.toLowerCase());
    const sanitizedRole = ['user', 'admin'].includes(role) ? role : 'user';
    
    // Check if user already exists with sanitized query
    const query = sanitizeMongoQuery({ email: sanitizedEmail });
    const existingUser = await User.findOne(query);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const user = new User({ email: sanitizedEmail, password, role: sanitizedRole });
    await user.save();

    // Generate token
    const token = jwtService.generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    logger.info(`New user registered: ${sanitizeForLog(sanitizedEmail)}`);

    return {
      user: user.toJSON(),
      token
    };

  } catch (error: any) {
    logger.error('Registration service error:', sanitizeForLog(error.message));
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email.toLowerCase());
    
    // Find user with sanitized query
    const query = sanitizeMongoQuery({ email: sanitizedEmail, isActive: true });
    const user = await User.findOne(query);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = jwtService.generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    logger.info(`User logged in: ${sanitizeForLog(sanitizedEmail)}`);

    return {
      user: user.toJSON(),
      token
    };

  } catch (error: any) {
    logger.error('Login service error:', sanitizeForLog(error.message));
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user.toJSON() as UserProfile;

  } catch (error: any) {
    logger.error('Get profile service error:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<IUser>): Promise<UserProfile> => {
  try {
    // Sanitize updates - only allow safe fields
    const allowedFields = ['email', 'isActive'];
    const sanitizedUpdates = sanitizeUpdateFields(updates, allowedFields);
    
    // Sanitize email if provided
    if (sanitizedUpdates.email) {
      sanitizedUpdates.email = sanitizeEmail(sanitizedUpdates.email);
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { ...sanitizedUpdates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    logger.info(`User profile updated: ${sanitizeForLog(user.email)}`);
    return user.toJSON() as UserProfile;

  } catch (error: any) {
    logger.error('Update profile service error:', sanitizeForLog(error.message));
    throw error;
  }
};

export const deactivateUser = async (userId: string): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    logger.info(`User deactivated: ${sanitizeForLog(user.email)}`);

  } catch (error: any) {
    logger.error('Deactivate user service error:', sanitizeForLog(error.message));
    throw error;
  }
};