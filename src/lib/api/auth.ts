import api from '@/lib/axios';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  RefreshRequest,
  LogoutRequest
} from '@/types/auth';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/api/auth/login', credentials);
    return data;
  },
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const { data } = await api.post<RegisterResponse>('/api/auth/register', userData);
    return data;
  },
  refresh: async (request: RefreshRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/api/auth/refresh', request);
    return data;
  },
  logout: async (request: LogoutRequest): Promise<void> => {
    await api.post('/api/auth/logout', request);
  },
};
