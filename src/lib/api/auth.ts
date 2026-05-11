import api from '@/lib/axios';

export const authApi = {
  register: async (username: string, email: string, password: string, displayName: string) => {
    const { data } = await api.post('/api/auth/register', {
      username,
      email,
      password,
      displayName
    });
    return data;
  },

  login: async (username: string, password: string) => {
    const { data } = await api.post('/api/auth/login', {
      username,
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
