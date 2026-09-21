import axios from 'axios';
import { store, clearAuth, saveAuth } from '../store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
  withCredentials: true
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;

  if (token)
  {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (
      status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/refresh') &&
      !originalRequest?.url?.includes('/auth/login') &&
      !originalRequest?.url?.includes('/auth/logout') &&
      store.getState().auth.token
    )
    {
      originalRequest._retry = true;

      try
      {
        refreshPromise ??= api.post('/auth/refresh')
          .then((response) => {
            const data = response.data?.data;

            if (!data?.accessToken || !data?.user)
            {
              throw new Error('Invalid refresh response');
            }

            saveAuth(data.user, data.accessToken);
            return data.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });

        const token = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }
      catch (refreshError)
      {
        clearAuth();
        return Promise.reject(refreshError);
      }
    }

    if (
      status === 401 &&
      !originalRequest?.url?.includes('/auth/refresh')
    )
    {
      clearAuth();
    }

    return Promise.reject(error);
  }
);

export default api;
