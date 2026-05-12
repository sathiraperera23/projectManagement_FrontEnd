import api from '@/lib/axios';

export const authApi = {
  register: async (email: string, password: string, displayName: string) => {
    const { data } = await api.post('/api/auth/register', {
      email,
      password,
      displayName
    });
    return data;
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post('/api/auth/login', {
      email,
      password
    });
    return data;
  },

  refresh: async (refreshToken: string) => {
    const { data } = await api.post('/api/auth/refresh', { refreshToken });
    return data;
  },

  logout: async (refreshToken: string) => {
    await api.post('/api/auth/logout', { refreshToken });
  },

  getCurrentUser: async () => {
    const { data } = await api.get('/api/auth/me');
    return data;
  },
};
