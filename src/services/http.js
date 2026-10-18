import axios from 'axios';
import { tokenStore } from './tokenStore';

// export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK) !== 'false';
export const USE_MOCK = false;

const http = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 15000,
  withCredentials: true, // needed if the API sets an httpOnly refresh cookie
});

http.interceptors.request.use((config) => {
  const t = tokenStore.get();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (error) => {
    const url = error.config?.url || '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && !isAuthCall) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:logout')); // AuthContext listens and redirects
    }
    return Promise.reject(error);
  }
);

export default http;
