import http from '../utils/sso.api'
import Cookies from 'js-cookie';

const baseURL = '/auth'

export const authServices = {
  async login (credenciais: object) {
    const { data } = await http.post(`${baseURL}/login`, credenciais, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async cadastro (cadastro: object) {
    const { data } = await http.post(`${baseURL}/signup`, cadastro, {
      headers: {
        'Content-Type': 'Application/json',
      },
    });
    return data;
  },

  async primeiroLogin (id: number, key: string) {
    const { data } = await http.get(`${baseURL}/qr/${id}/${key}`, {
      headers: {
        'Content-Type': 'Application/json',
      },
    });
    return data;
  },

  async verificaOtp (id: number, otp: string | null) {
    const { data } = await http.post(`${baseURL}/m2f/${id}?otp=${otp}`, {
      headers: {
        'Content-Type': 'Application/json',
      },
    });
    if(data['tokens']) {
      Cookies.set('access_token', data['tokens'][0]['access_token'], { expires: 0.2/24 });
      Cookies.set('refresh_token', data['tokens'][1]['refresh_token'], { expires: 1 });
    }
  },

  async verificaToken (token: string | undefined) {
    const { data } = await http.get(`${baseURL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  },
}
