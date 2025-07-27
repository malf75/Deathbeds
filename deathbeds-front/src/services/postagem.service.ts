import http from '../utils/sso.api'

export const postagemServices = {
  async posta (payload: object) {
    const { data } = await http.post('/postagens', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return data;
  },
  async lista (quantidade: number){
    const { data } = await http.get(`/postagens?quantidade=${quantidade}`);
    return data;
  },
}
