import axios from 'axios';

export const axiosWithToken = (token: string | null | undefined) => {
  const instance = axios.create({
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  instance.defaults.baseURL = process.env.NEXT_PUBLIC_BACK_END_URL || 'http://localhost:3000';
  instance.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : null;
  return instance;
};
