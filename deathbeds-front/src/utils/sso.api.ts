import axios from 'axios';
import Cookies from 'js-cookie';

const http = axios.create({
  baseURL: 'http://192.168.1.237:8000/',
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
      const { data } = await http.post('/auth/token/refresh', {
        token: refreshToken,
      });
      Cookies.set('access_token', data[0].access_token);
      Cookies.set('refresh_token', data[1].refresh_token);
      return http(originalRequest);
    }
    return Promise.reject(error);
  }
)

export default http;
