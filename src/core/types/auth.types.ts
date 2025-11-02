export interface UserRegistrationData {
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: {
    _id: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
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

export interface UpdateProfileData {
  email?: string;
  isActive?: boolean;
}