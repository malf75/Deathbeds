import axios from 'axios';
import Cookies from 'js-cookie';

const http = axios.create({
  baseURL: `https://${import.meta.env.VITE_API_IP}:8000/`,
  withCredentials: true,
});

http.interceptors.request.use(config => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`https://${import.meta.env.VITE_API_IP}:8000/auth/token/refresh`,
            { token: refreshToken },
            { withCredentials: true }
          );
          Cookies.set('access_token', data[0].access_token);
          Cookies.set('refresh_token', data[1].refresh_token);
          originalRequest.headers['Authorization'] = `Bearer ${Cookies.get('access_token')}`
          return http(originalRequest);
        } catch (refreshError) {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          return Promise.reject(refreshError)
        }
      }
    }
    return Promise.reject(error);
  }
)

export default http;
