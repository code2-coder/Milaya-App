import axios from 'axios';
import { toast } from 'sonner';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
  }

  // Fallback defaults
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://milaya.onrender.com/api/v1';
  }
  
  return 'http://localhost:8085/api/v1';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Routes that handle their own error toasts — skip global error handling
    const silentRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isSilentRoute = silentRoutes.some(route => originalRequest?.url?.includes(route));

    // Only handle global network or 500 server errors for non-auth routes
    if (!error.response) {
      toast.error('Network Error: Please check your internet connection.');
    } else if (error.response.status >= 500 && !isSilentRoute) {
      toast.error('Server Error: Our team has been notified.');
    } else if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/refresh-token' && originalRequest.url !== '/login') {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = localStorage.getItem('refreshToken');

      return new Promise((resolve, reject) => {
        api.post('/refresh-token', { refreshToken: storedRefreshToken })
          .then(({ data }) => {
            const newToken = data?.token || data?.data?.token;
            const newRefreshToken = data?.refreshToken || data?.data?.refreshToken;
            if (newToken) {
              localStorage.setItem('token', newToken);
              if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
              }
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              processQueue(null, newToken);
              resolve(api(originalRequest));
            } else {
              processQueue(new Error('No token returned'));
              reject(error);
            }
          })
          .catch((refreshError) => {
            processQueue(refreshError);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login?session_expired=true';
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }
    return Promise.reject(error);
  }
);

export default api;
