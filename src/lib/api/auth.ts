import api from '@/lib/axios';

export const authApi = {
  login: async (username: string, password: string) => {
    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);
    const { data } = await api.post('/api/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
};
