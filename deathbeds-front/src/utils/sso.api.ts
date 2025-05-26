import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';

const route = useRouter();

const http = axios.create({
  baseURL: 'http://10.10.14.190:8000/',
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
      try {
        const refreshToken = Cookies.get('refresh_token');
        const { data } = await http.post('/auth/token/refresh', {
          refresh_token: refreshToken,
        });
        Cookies.set('access_token', data.access_token);
        Cookies.set('refresh_token', data.refresh_token)
        return http(originalRequest);
      } catch (refreshError) {
        console.log(refreshError);
        route.push('/login');
      }
    }
    return Promise.reject(error);
  }
)

export default http;
